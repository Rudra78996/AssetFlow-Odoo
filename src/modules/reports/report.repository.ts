import { prisma } from "@/lib/prisma";

export const reportRepository = {
  // Utilization trend: bookings per day since `since`, aggregated in-DB via groupBy.
  bookingsSince(since: Date) {
    return prisma.booking.groupBy({
      by: ["date"],
      where: { date: { gte: since }, status: { not: "CANCELLED" } },
      _count: { _all: true },
    });
  },
  allocationsByDepartment() {
    return prisma.allocation.groupBy({
      by: ["departmentId"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    });
  },
  assetStatusCounts() {
    return prisma.asset.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } });
  },
  operationalCost() {
    return prisma.maintenanceRequest.aggregate({ _sum: { cost: true } });
  },
  totalAssets() {
    return prisma.asset.count({ where: { deletedAt: null } });
  },
  // Idle heuristic: AVAILABLE assets with no booking activity since `since`.
  async idleAssetCount(since: Date) {
    const activeAssetIds = await prisma.booking.findMany({
      where: { date: { gte: since }, status: { not: "CANCELLED" } },
      select: { assetId: true },
      distinct: ["assetId"],
    });
    const busy = activeAssetIds.map((b) => b.assetId);
    return prisma.asset.count({
      where: { deletedAt: null, status: "AVAILABLE", id: { notIn: busy.length ? busy : ["__none__"] } },
    });
  },
  departmentNames() {
    return prisma.department.findMany({ select: { id: true, name: true } });
  },
};
