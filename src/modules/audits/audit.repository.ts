import { Prisma, type AuditAssetStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const auditRepository = {
  createCycle(data: Prisma.AuditCycleUncheckedCreateInput) {
    return prisma.auditCycle.create({ data });
  },
  seedAuditAssets(rows: Prisma.AuditAssetUncheckedCreateInput[]) {
    return prisma.auditAsset.createMany({ data: rows });
  },
  findCycle(id: string) {
    return prisma.auditCycle.findUnique({ where: { id }, include: { auditors: { select: { name: true } } } });
  },
  listCycles() {
    return prisma.auditCycle.findMany({ include: { auditors: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  },
  // Compute counts in the DB (groupBy), never by pulling rows into Node.
  statusCounts(auditCycleId: string) {
    return prisma.auditAsset.groupBy({
      by: ["status"],
      where: { auditCycleId },
      _count: { _all: true },
    });
  },
  auditAssets(auditCycleId: string, statuses?: AuditAssetStatus[]) {
    return prisma.auditAsset.findMany({
      where: { auditCycleId, ...(statuses ? { status: { in: statuses } } : {}) },
      include: { asset: { select: { name: true, tag: true, serialNumber: true, location: true } } },
      orderBy: { createdAt: "asc" },
    });
  },
  findAuditAsset(id: string) {
    return prisma.auditAsset.findUnique({ where: { id } });
  },
  updateAuditAsset(id: string, data: Prisma.AuditAssetUpdateInput) {
    return prisma.auditAsset.update({
      where: { id },
      data,
      include: { asset: { select: { name: true, tag: true, serialNumber: true, location: true } } },
    });
  },
  countPending(auditCycleId: string) {
    return prisma.auditAsset.count({ where: { auditCycleId, status: "PENDING" } });
  },
  closeCycle(id: string) {
    return prisma.auditCycle.update({ where: { id }, data: { status: "CLOSED" } });
  },
  allAssetIds() {
    return prisma.asset.findMany({ where: { deletedAt: null }, select: { id: true } });
  },
};
