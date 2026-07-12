import { reportRepository } from "./report.repository";
import { cached } from "@/lib/cache";
import { config } from "@/lib/config";
import { startOfDay } from "@/lib/time";
import { AssetStatusLabel } from "@/modules/shared/presenters";
import type { AssetStatus } from "@prisma/client";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const reportService = {
  async summary(range: number, idleDays: number) {
    return cached(`reports:summary:${range}:${idleDays}`, config.reportCacheTtlMs, async () => {
      const since = startOfDay(new Date(Date.now() - range * 24 * 60 * 60 * 1000));
      const idleSince = startOfDay(new Date(Date.now() - idleDays * 24 * 60 * 60 * 1000));

      const [bookingsAgg, deptAgg, statusAgg, cost, total, idle, depts] = await Promise.all([
        reportRepository.bookingsSince(since),
        reportRepository.allocationsByDepartment(),
        reportRepository.assetStatusCounts(),
        reportRepository.operationalCost(),
        reportRepository.totalAssets(),
        reportRepository.idleAssetCount(idleSince),
        reportRepository.departmentNames(),
      ]);

      // Bucket bookings into a per-day trend, filling gaps with zero.
      const trendMap = new Map<string, number>();
      for (const b of bookingsAgg) {
        const key = b.date.toISOString().slice(0, 10);
        trendMap.set(key, (trendMap.get(key) ?? 0) + b._count._all);
      }
      const utilizationTrend: { day: string; date: string; value: number }[] = [];
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        utilizationTrend.push({ day: DOW[d.getDay()], date: key, value: trendMap.get(key) ?? 0 });
      }

      const deptName = new Map(depts.map((d) => [d.id, d.name]));
      const deptAllocation = deptAgg.map((g) => ({
        dept: g.departmentId ? (deptName.get(g.departmentId) ?? "Unknown") : "Unassigned",
        units: g._count._all,
      }));

      const statusBreakdown = statusAgg.map((g) => ({
        label: AssetStatusLabel[g.status as AssetStatus],
        count: g._count._all,
        percentage: total === 0 ? 0 : Math.round((g._count._all / total) * 1000) / 10,
      }));

      const allocatedCount = statusAgg.find((g) => g.status === "ALLOCATED")?._count._all ?? 0;
      const avgUtilization = total === 0 ? 0 : Math.round((allocatedCount / total) * 1000) / 10;

      return {
        kpis: {
          averageUtilization: avgUtilization,
          idleAssetCount: idle,
          operationalCost: cost._sum.cost ?? 0,
        },
        utilizationTrend,
        deptAllocation,
        statusBreakdown,
      };
    });
  },
};
