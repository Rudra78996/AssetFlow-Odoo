import { dashboardRepository } from "./dashboard.repository";
import { cached } from "@/lib/cache";
import { config } from "@/lib/config";
import { AssetStatusLabel } from "@/modules/shared/presenters";
import type { AssetStatus } from "@prisma/client";

export const dashboardService = {
  async kpis() {
    return cached("dashboard:kpis", config.reportCacheTtlMs, async () => {
      const [statusGroups, activeBookings, pendingMaint, transfers, returns] = await Promise.all([
        dashboardRepository.assetStatusCounts(),
        dashboardRepository.activeBookingsToday(),
        dashboardRepository.pendingMaintenance(),
        dashboardRepository.activeTransfers(),
        dashboardRepository.returnsCount(),
      ]);

      const byStatus: Record<string, number> = {};
      for (const g of statusGroups) byStatus[AssetStatusLabel[g.status as AssetStatus]] = g._count._all;

      return {
        kpis: [
          { label: "Available", value: byStatus["Available"] ?? 0, icon: "inventory", color: "text-primary" },
          { label: "Allocated", value: byStatus["Allocated"] ?? 0, icon: "outbound", color: "text-secondary" },
          { label: "Maintenance", value: byStatus["Under Maintenance"] ?? 0, icon: "engineering", color: "text-tertiary" },
          { label: "Bookings", value: activeBookings, icon: "book_online", color: "text-secondary" },
          { label: "Transfers", value: transfers, icon: "sync_alt", color: "text-on-surface-variant" },
          { label: "Returns", value: returns, icon: "keyboard_return", color: "text-secondary" },
        ],
        assetStatusBreakdown: Object.entries(byStatus).map(([label, count]) => ({ label, count })),
        pendingMaintenance: pendingMaint,
      };
    });
  },
};
