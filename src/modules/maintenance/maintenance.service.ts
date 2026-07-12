import type { MaintenanceStatus, Prisma } from "@prisma/client";
import { maintenanceRepository } from "./maintenance.repository";
import type {
  CreateMaintenanceInput,
  AssignTechnicianInput,
  ResolveInput,
  ListMaintenanceQuery,
} from "./maintenance.schema";
import { NotFoundError, UnprocessableTransitionError } from "@/lib/errors";
import { resolvePagination, skipTake, buildMeta } from "@/lib/pagination";
import { MaintenanceStatusLabel, MaintenancePriorityLabel } from "@/modules/shared/presenters";
import { logActivity } from "@/modules/activity/activity.service";
import { notify } from "@/modules/notifications/notification.service";

// Explicit allowed-transitions map — the single authority on legal state moves.
// Any transition not listed here is rejected, so illegal jumps (e.g. OPEN->RESOLVED)
// are impossible by construction rather than by scattered if/else checks.
const ALLOWED: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  OPEN: ["APPROVED", "REJECTED"],
  APPROVED: ["TECHNICIAN_ASSIGNED", "REJECTED"],
  TECHNICIAN_ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  REJECTED: [],
  RESOLVED: [],
};

function assertTransition(from: MaintenanceStatus, to: MaintenanceStatus) {
  if (!ALLOWED[from].includes(to)) {
    throw new UnprocessableTransitionError(
      `Cannot move maintenance request from ${from} to ${to}`,
      { allowedNext: ALLOWED[from] },
    );
  }
}

type Row = Prisma.MaintenanceRequestGetPayload<{
  include: { asset: { select: { name: true; status: true } } };
}>;

function toDto(m: Row) {
  return {
    id: m.id,
    assetId: m.assetId,
    assetName: m.asset?.name ?? "",
    issue: m.issue,
    priority: MaintenancePriorityLabel[m.priority],
    status: MaintenanceStatusLabel[m.status],
    technician: m.technician ?? undefined,
    date: m.createdAt.toISOString(),
    description: m.description,
    cost: m.cost ?? undefined,
  };
}

async function loadOrThrow(id: string): Promise<Row> {
  const m = await maintenanceRepository.findById(id);
  if (!m) throw new NotFoundError("Maintenance request not found");
  return m;
}

export const maintenanceService = {
  toDto,

  async list(rawQuery: ListMaintenanceQuery, resolvedOnly: boolean) {
    const p = resolvePagination(rawQuery);
    const where: Prisma.MaintenanceRequestWhereInput = {};
    if (resolvedOnly) where.status = "RESOLVED";
    else if (rawQuery.status) where.status = rawQuery.status;
    else where.status = { not: "RESOLVED" }; // active requests by default
    if (rawQuery.priority) where.priority = rawQuery.priority;
    if (p.search) {
      where.OR = [
        { issue: { contains: p.search, mode: "insensitive" } },
        { description: { contains: p.search, mode: "insensitive" } },
        { asset: { name: { contains: p.search, mode: "insensitive" } } },
      ];
    }
    const { skip, take } = skipTake(p);
    const { items, total } = await maintenanceRepository.list(where, skip, take);
    return { items: items.map(toDto), meta: buildMeta(total, p) };
  },

  async create(input: CreateMaintenanceInput, actorId: string) {
    const m = await maintenanceRepository.create({
      assetId: input.assetId,
      issue: input.issue,
      description: input.description,
      priority: input.priority ?? "MEDIUM",
      status: "OPEN",
      requestedById: actorId,
    });
    await logActivity({
      userId: actorId,
      action: "maintenance.requested",
      objectType: "MaintenanceRequest",
      objectId: m.id,
    });
    return toDto(m);
  },

  async approve(id: string, actorId: string) {
    const m = await loadOrThrow(id);
    if (m.status === "APPROVED") return toDto(m); // idempotent
    assertTransition(m.status, "APPROVED");
    // Approving takes the asset out of service until the work is resolved.
    const updated = await maintenanceRepository.transitionTx(id, { status: "APPROVED" }, {
      assetId: m.assetId,
      status: "UNDER_MAINTENANCE",
    });
    await logActivity({ userId: actorId, action: "maintenance.approved", objectType: "MaintenanceRequest", objectId: id });
    return toDto(updated);
  },

  async reject(id: string, actorId: string) {
    const m = await loadOrThrow(id);
    if (m.status === "REJECTED") return toDto(m);
    assertTransition(m.status, "REJECTED");
    const updated = await maintenanceRepository.simpleUpdate(id, { status: "REJECTED" });
    await logActivity({ userId: actorId, action: "maintenance.rejected", objectType: "MaintenanceRequest", objectId: id });
    return toDto(updated);
  },

  async assignTechnician(id: string, input: AssignTechnicianInput, actorId: string) {
    const m = await loadOrThrow(id);
    if (m.status === "TECHNICIAN_ASSIGNED") {
      return toDto(await maintenanceRepository.simpleUpdate(id, { technician: input.technician, technicianId: input.technicianId ?? null }));
    }
    assertTransition(m.status, "TECHNICIAN_ASSIGNED");
    const updated = await maintenanceRepository.simpleUpdate(id, {
      status: "TECHNICIAN_ASSIGNED",
      technician: input.technician,
      technicianId: input.technicianId ?? null,
    });
    await logActivity({ userId: actorId, action: "maintenance.technicianAssigned", objectType: "MaintenanceRequest", objectId: id });
    return toDto(updated);
  },

  async start(id: string, actorId: string) {
    const m = await loadOrThrow(id);
    if (m.status === "IN_PROGRESS") return toDto(m);
    assertTransition(m.status, "IN_PROGRESS");
    const updated = await maintenanceRepository.simpleUpdate(id, { status: "IN_PROGRESS" });
    await logActivity({ userId: actorId, action: "maintenance.started", objectType: "MaintenanceRequest", objectId: id });
    return toDto(updated);
  },

  async resolve(id: string, input: ResolveInput, actorId: string) {
    const m = await loadOrThrow(id);
    if (m.status === "RESOLVED") return toDto(m);
    assertTransition(m.status, "RESOLVED");
    // If the asset was taken out of service for this work, return it to AVAILABLE.
    const assetChange =
      m.asset?.status === "UNDER_MAINTENANCE"
        ? ({ assetId: m.assetId, status: "AVAILABLE" } as const)
        : undefined;
    const updated = await maintenanceRepository.transitionTx(
      id,
      { status: "RESOLVED", resolvedAt: new Date(), cost: input.cost ?? undefined },
      assetChange,
    );
    await logActivity({ userId: actorId, action: "maintenance.resolved", objectType: "MaintenanceRequest", objectId: id });
    await notify({
      userId: m.requestedById,
      type: "maintenance",
      title: "Maintenance Resolved",
      message: `Your maintenance request for ${m.asset?.name ?? "an asset"} has been resolved.`,
    });
    return toDto(updated);
  },
};
