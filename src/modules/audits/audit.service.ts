import type { AuditAssetStatus, Prisma } from "@prisma/client";
import { auditRepository } from "./audit.repository";
import type { CreateCycleInput, MarkAuditAssetInput } from "./audit.schema";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { AuditAssetStatusLabel, AuditCycleStatusLabel } from "@/modules/shared/presenters";
import { logActivity } from "@/modules/activity/activity.service";
import { notify } from "@/modules/notifications/notification.service";

// Pure, unit-testable compliance math. All cycle stats are DERIVED — never stored,
// so they can never drift from the underlying AuditAsset rows.
export function computeStats(counts: Partial<Record<AuditAssetStatus, number>>) {
  const verified = counts.VERIFIED ?? 0;
  const missing = counts.MISSING ?? 0;
  const damaged = counts.DAMAGED ?? 0;
  const pending = counts.PENDING ?? 0;
  const total = verified + missing + damaged + pending;
  const handled = verified + missing + damaged;
  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    total,
    verifiedCount: verified,
    discrepancyCount: missing + damaged,
    progress: total === 0 ? 0 : round((handled / total) * 100),
    complianceGauge: total === 0 ? 0 : round((verified / total) * 100),
  };
}

async function statsFor(cycleId: string) {
  const grouped = await auditRepository.statusCounts(cycleId);
  const counts: Partial<Record<AuditAssetStatus, number>> = {};
  for (const g of grouped) counts[g.status] = g._count._all;
  return computeStats(counts);
}

type CycleRow = Prisma.AuditCycleGetPayload<{ include: { auditors: { select: { name: true } } } }>;

async function cycleDto(cycle: CycleRow) {
  const stats = await statsFor(cycle.id);
  return {
    id: cycle.id,
    scope: cycle.scope,
    startDate: cycle.startDate.toISOString().slice(0, 10),
    endDate: cycle.endDate.toISOString().slice(0, 10),
    auditors: cycle.auditors.map((a) => a.name),
    status: AuditCycleStatusLabel[cycle.status],
    ...stats,
  };
}

export const auditService = {
  computeStats,

  async listCycles() {
    const cycles = await auditRepository.listCycles();
    return Promise.all(cycles.map(cycleDto));
  },

  async createCycle(input: CreateCycleInput, actorId: string) {
    const cycle = await auditRepository.createCycle({
      scope: input.scope,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "ACTIVE",
      auditorIds: input.auditorIds,
    });
    const assetIds =
      input.assetIds ?? (await auditRepository.allAssetIds()).map((a) => a.id);
    if (assetIds.length > 0) {
      await auditRepository.seedAuditAssets(
        assetIds.map((assetId) => ({ auditCycleId: cycle.id, assetId, status: "PENDING" })),
      );
    }
    await logActivity({ userId: actorId, action: "audit.cycleCreated", objectType: "AuditCycle", objectId: cycle.id });
    const full = await auditRepository.findCycle(cycle.id);
    return cycleDto(full as CycleRow);
  },

  async getCycle(id: string) {
    const cycle = await auditRepository.findCycle(id);
    if (!cycle) throw new NotFoundError("Audit cycle not found");
    const assets = await auditRepository.auditAssets(id);
    return {
      ...(await cycleDto(cycle)),
      assets: assets.map((a) => ({
        id: a.id,
        name: a.asset?.name ?? "",
        tag: a.asset?.tag ?? "",
        serialNumber: a.asset?.serialNumber ?? "",
        location: a.asset?.location ?? "",
        status: AuditAssetStatusLabel[a.status],
        note: a.note ?? undefined,
      })),
    };
  },

  async markAsset(cycleId: string, auditAssetId: string, input: MarkAuditAssetInput, actorId: string) {
    const cycle = await auditRepository.findCycle(cycleId);
    if (!cycle) throw new NotFoundError("Audit cycle not found");
    if (cycle.status === "CLOSED") throw new ConflictError("Audit cycle is closed");
    const entry = await auditRepository.findAuditAsset(auditAssetId);
    if (!entry || entry.auditCycleId !== cycleId) throw new NotFoundError("Audit asset not found in this cycle");

    const updated = await auditRepository.updateAuditAsset(auditAssetId, {
      status: input.status,
      note: input.note ?? null,
      verifiedAt: input.status === "VERIFIED" ? new Date() : null,
    });
    await logActivity({
      userId: actorId,
      action: `audit.asset.${input.status.toLowerCase()}`,
      objectType: "AuditAsset",
      objectId: auditAssetId,
    });
    // Surface discrepancies as notifications to the auditors.
    if (input.status === "MISSING" || input.status === "DAMAGED") {
      for (const auditorId of cycle.auditorIds) {
        await notify({
          userId: auditorId,
          type: "audit",
          title: "Audit Discrepancy",
          message: `${updated.asset?.name ?? "An asset"} flagged as ${input.status.toLowerCase()}.`,
        });
      }
    }
    return {
      id: updated.id,
      name: updated.asset?.name ?? "",
      tag: updated.asset?.tag ?? "",
      serialNumber: updated.asset?.serialNumber ?? "",
      location: updated.asset?.location ?? "",
      status: AuditAssetStatusLabel[updated.status],
      note: updated.note ?? undefined,
    };
  },

  // Disallow closing with unverified items unless force=true (matches the
  // "Close Audit Cycle" confirm flow).
  async closeCycle(id: string, force: boolean, actorId: string) {
    const cycle = await auditRepository.findCycle(id);
    if (!cycle) throw new NotFoundError("Audit cycle not found");
    if (cycle.status === "CLOSED") return cycleDto(cycle); // idempotent

    const pending = await auditRepository.countPending(id);
    if (pending > 0 && !force) {
      throw new ConflictError(`Cycle has ${pending} pending item(s). Pass force=true to close anyway.`, {
        pending,
      });
    }
    await auditRepository.closeCycle(id);
    await logActivity({ userId: actorId, action: "audit.cycleClosed", objectType: "AuditCycle", objectId: id, metadata: { forced: force, pending } });
    const fresh = await auditRepository.findCycle(id);
    return cycleDto(fresh as CycleRow);
  },

  async discrepancies(id: string) {
    const cycle = await auditRepository.findCycle(id);
    if (!cycle) throw new NotFoundError("Audit cycle not found");
    const rows = await auditRepository.auditAssets(id, ["MISSING", "DAMAGED"]);
    return rows.map((a) => ({
      id: a.id,
      assetName: a.asset?.name ?? "",
      issue: a.note ?? (a.status === "MISSING" ? "Asset missing during audit" : "Asset damaged during audit"),
      type: a.status === "MISSING" ? "missing" : "damaged",
    }));
  },
};
