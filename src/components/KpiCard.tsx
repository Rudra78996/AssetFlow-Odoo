"use client";

import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: "up" | "down";
  color?: string;
  className?: string;
}

export function KpiCard({ label, value, icon, trend, trendDirection, color = "text-primary", className }: KpiCardProps) {
  return (
    <div className={cn("card card-hover p-5 flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-primary/5", color)}>
          {icon}
        </div>
        {trend && (
          <span className={cn("text-label-md font-bold", trendDirection === "up" ? "text-available" : "text-error")}>
            {trendDirection === "up" ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-outline text-label-md uppercase">{label}</p>
        <p className="text-[28px] font-bold mt-1 text-on-surface">{value}</p>
      </div>
    </div>
  );
}
