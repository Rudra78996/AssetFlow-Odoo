"use client";

import { cn } from "@/lib/utils";

const statusConfig: Record<string, { color: string; bg: string; icon?: string }> = {
  Available: { color: "text-available", bg: "bg-available/10" },
  Allocated: { color: "text-allocated", bg: "bg-allocated/10" },
  Reserved: { color: "text-reserved", bg: "bg-reserved/10" },
  "Under Maintenance": { color: "text-under-maintenance", bg: "bg-under-maintenance/10" },
  Lost: { color: "text-error", bg: "bg-error/10", icon: "×" },
  Rejected: { color: "text-error", bg: "bg-error/20", icon: "✕" },
  Overdue: { color: "text-error", bg: "bg-error/30", icon: "!" },
  Retired: { color: "text-outline", bg: "bg-outline/10", icon: "○" },
  Disposed: { color: "text-outline", bg: "bg-outline/20", icon: "⊘" },
  Cancelled: { color: "text-outline", bg: "bg-outline/30", icon: "–" },
  ACTIVE: { color: "text-available", bg: "bg-available/10" },
  PENDING: { color: "text-reserved", bg: "bg-reserved/10" },
  OVERDUE: { color: "text-error", bg: "bg-error/10", icon: "!" },
  RETURNED: { color: "text-outline", bg: "bg-outline/10", icon: "↩" },
  Upcoming: { color: "text-primary", bg: "bg-primary/10" },
  Ongoing: { color: "text-secondary", bg: "bg-secondary/10" },
  Completed: { color: "text-available", bg: "bg-available/10" },
  Optimal: { color: "text-available", bg: "bg-available/10" },
  Critical: { color: "text-error", bg: "bg-error/10", icon: "⚠" },
  Success: { color: "text-available", bg: "bg-available/10", icon: "✓" },
  Failed: { color: "text-error", bg: "bg-error/10", icon: "✕" },
  Resolved: { color: "text-available", bg: "bg-available/10", icon: "✓" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status] || { color: "text-on-surface-variant", bg: "bg-surface-container-low" };
  return (
    <span className={cn("status-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium", config.bg, config.color, className)}>
      {config.icon && <span className="font-bold">{config.icon}</span>}
      <span className={cn("w-1.5 h-1.5 rounded-full", config.color.replace("text-", "bg-"))} />
      {status}
    </span>
  );
}
