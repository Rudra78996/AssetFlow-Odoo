import { Prisma } from "@prisma/client";
import { allocationRepository } from "./allocation.repository";
import type { CreateAllocationInput, ListAllocationQuery } from "./allocation.schema";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { resolvePagination, skipTake, buildMeta } from "@/lib/pagination";
import { withTxRetry } from "@/lib/tx";
import { logActivity } from "@/modules/activity/activity.service";
import { notify } from "@/modules/notifications/notification.service";

type AllocationRow = Prisma.AllocationGetPayload<{
  include: {
    asset: { select: { name: true } };
    recipient: { select: { name: true; department: { select: { name: true } } } };
  };
}>;

// Status is computed on read: an ACTIVE allocation past its expectedReturn shows
// as OVERDUE even if the nightly job has not run yet — always correct.
function displayStatus(a: { status: string; expectedReturn: Date | null }): string {
  if (a.status === "ACTIVE" && a.expectedReturn && a.expectedReturn.getTime() < Date.now()) {
    return "OVERDUE";
  }
  return a.status;
}

function toDto(a: AllocationRow) {
  return {
    id: a.id,
    assetId: a.assetId,
    assetName: a.asset?.name ?? "",
    employee: a.recipient?.name ?? "",
    department: a.recipient?.department?.name ?? "",
    status: displayStatus(a),
    date: a.requestedAt.toISOString().slice(0, 10),
    expectedReturn: a.expectedReturn?.toISOString().slice(0, 10),
  };
}

export const allocationService = {
  toDto,

  async list(rawQuery: ListAllocationQuery) {
    const p = resolvePagination(rawQuery);
    const where: Prisma.AllocationWhereInput = {};
    if (rawQuery.status && rawQuery.status !== "OVERDUE") where.status = rawQuery.status;
    if (rawQuery.status === "OVERDUE") {
      where.status = "ACTIVE";
      where.expectedReturn = { lt: new Date() };
    }
    if (rawQuery.department) where.recipient = { department: { name: rawQuery.department } };
    if (p.search) {
      where.OR = [
        { asset: { name: { contains: p.search, mode: "insensitive" } } },
        { recipient: { name: { contains: p.search, mode: "insensitive" } } },
      ];
    }
    const { skip, take } = skipTake(p);
    const { items, total } = await allocationRepository.list(where, skip, take, { requestedAt: "desc" });
    return { items: items.map(toDto), meta: buildMeta(total, p) };
  },

  // Server-side conflict check: never trust the client to have verified this.
  async create(input: CreateAllocationInput, actorId: string) {
    return withTxRetry(async () => {
      const active = await allocationRepository.findActiveForAsset(input.assetId);
      if (active) {
        throw new ConflictError("Asset is currently allocated and unavailable", {
          heldBy: active.recipient?.name ?? "another user",
          allocationId: active.id,
        });
      }
      const allocation = await allocationRepository.create({
        assetId: input.assetId,
        recipientId: input.recipientId,
        departmentId: input.departmentId ?? null,
        type: input.type ?? "allocated",
        status: "PENDING",
        expectedReturn: input.expectedReturn ?? null,
        notes: input.notes ?? null,
      });
      await logActivity({
        userId: actorId,
        action: "allocation.requested",
        objectType: "Allocation",
        objectId: allocation.id,
      });
      return toDto(allocation);
    });
  },

  async approve(id: string, actorId: string) {
    const allocation = await allocationRepository.findById(id);
    if (!allocation) throw new NotFoundError("Allocation not found");
    if (allocation.status === "ACTIVE") return toDto(allocation); // idempotent

    // Guard against approving an allocation whose asset was taken in the meantime.
    const active = await allocationRepository.findActiveForAsset(allocation.assetId);
    if (active && active.id !== id) {
      throw new ConflictError("Asset was allocated to someone else", {
        heldBy: active.recipient?.name,
      });
    }
    const updated = await withTxRetry(() =>
      allocationRepository.approveTx(id, allocation.assetId),
    );
    await logActivity({
      userId: actorId,
      action: "allocation.approved",
      objectType: "Allocation",
      objectId: id,
    });
    await notify({
      userId: allocation.recipientId,
      type: "assignment",
      title: "Asset Assigned",
      message: `${updated.asset?.name ?? "An asset"} has been allocated to you.`,
    });
    return toDto(updated);
  },

  async returnAsset(id: string, actorId: string) {
    const allocation = await allocationRepository.findById(id);
    if (!allocation) throw new NotFoundError("Allocation not found");
    if (allocation.status === "RETURNED") return toDto(allocation); // idempotent

    const updated = await withTxRetry(() => allocationRepository.returnTx(id, allocation.assetId));
    await logActivity({
      userId: actorId,
      action: "allocation.returned",
      objectType: "Allocation",
      objectId: id,
    });
    return toDto(updated);
  },

  async reject(id: string, actorId: string) {
    const allocation = await allocationRepository.findById(id);
    if (!allocation) throw new NotFoundError("Allocation not found");
    if (allocation.status === "REJECTED") return toDto(allocation); // idempotent
    await allocationRepository.setStatus(id, "REJECTED");
    await logActivity({
      userId: actorId,
      action: "allocation.rejected",
      objectType: "Allocation",
      objectId: id,
    });
    const fresh = await allocationRepository.findById(id);
    return toDto(fresh as AllocationRow);
  },

  // Invoked by the overdue worker/cron: flip past-due ACTIVE allocations and notify.
  async flagOverdue() {
    const now = new Date();
    const candidates = await allocationRepository.findOverdueCandidates(now);
    let flagged = 0;
    for (const a of candidates) {
      await allocationRepository.setStatus(a.id, "OVERDUE");
      flagged++;
      await notify({
        userId: a.recipientId,
        type: "overdue",
        title: "Overdue Alert",
        message: `An asset assigned to you is overdue (expected back ${a.expectedReturn?.toISOString().slice(0, 10)}).`,
      });
    }
    return { flagged };
  },
};
