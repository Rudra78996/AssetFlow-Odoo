"use client";

import { cn } from "@/lib/utils";

const statusConfig: Record<string, { color: string; bg: string }> = {
  Available: { color: "text-available", bg: "bg-available/10" },
  Allocated: { color: "text-allocated", bg: "bg-allocated/10" },
  Reserved: { color: "text-reserved", bg: "bg-reserved/10" },
  "Under Maintenance": { color: "text-under-maintenance", bg: "bg-under-maintenance/10" },
  Lost: { color: "text-error", bg: "bg-error/10" },
  Rejected: { color: "text-error", bg: "bg-error/10" },
  Overdue: { color: "text-error", bg: "bg-error/10" },
  Retired: { color: "text-outline", bg: "bg-outline/10" },
  Disposed: { color: "text-outline", bg: "bg-outline/10" },
  Cancelled: { color: "text-outline", bg: "bg-outline/10" },
  ACTIVE: { color: "text-available", bg: "bg-available/10" },
  PENDING: { color: "text-reserved", bg: "bg-reserved/10" },
  OVERDUE: { color: "text-error", bg: "bg-error/10" },
  RETURNED: { color: "text-outline", bg: "bg-outline/10" },
  Upcoming: { color: "text-primary", bg: "bg-primary/10" },
  Ongoing: { color: "text-secondary", bg: "bg-secondary/10" },
  Completed: { color: "text-available", bg: "bg-available/10" },
  Optimal: { color: "text-available", bg: "bg-available/10" },
  AlertTriangle: { color: "text-reserved", bg: "bg-reserved/10" },
  Critical: { color: "text-error", bg: "bg-error/10" },
  Success: { color: "text-available", bg: "bg-available/10" },
  Failed: { color: "text-error", bg: "bg-error/10" },
  Resolved: { color: "text-available", bg: "bg-available/10" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status] || { color: "text-on-surface-variant", bg: "bg-surface-container-low" };
  return (
    <span className={cn("status-badge", config.bg, config.color, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.color.replace("text-", "bg-"))} />
      {status}
    </span>
  );
}
