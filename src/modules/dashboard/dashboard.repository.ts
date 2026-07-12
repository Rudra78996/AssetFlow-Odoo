import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/lib/time";

// All counts are computed in MongoDB (groupBy/count), never by loading rows into Node.
export const dashboardRepository = {
  assetStatusCounts() {
    return prisma.asset.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } });
  },
  activeBookingsToday() {
    const now = new Date();
    return prisma.booking.count({
      where: { date: { gte: startOfDay(now), lte: endOfDay(now) }, status: { not: "CANCELLED" } },
    });
  },
  pendingMaintenance() {
    return prisma.maintenanceRequest.count({ where: { status: { notIn: ["RESOLVED", "REJECTED"] } } });
  },
  activeTransfers() {
    return prisma.allocation.count({ where: { status: "ACTIVE" } });
  },
  returnsCount() {
    return prisma.allocation.count({ where: { status: "RETURNED" } });
  },
};
