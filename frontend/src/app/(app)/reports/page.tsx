"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { reportsKPIs, utilizationTrendData, deptAllocationData, assetStatusBreakdown, performanceAuditData } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  Gauge, Timer, DollarSign, ListChecks, TrendingUp,
  Download, CalendarDays, FileText, Image as ImageIcon,
  MoreVertical, Filter,
} from "lucide-react";

const kpiIcons: Record<string, React.ReactNode> = {
  speed: <Gauge className="w-5 h-5" />,
  hourglass_empty: <Timer className="w-5 h-5" />,
  payments: <DollarSign className="w-5 h-5" />,
  fact_check: <ListChecks className="w-5 h-5" />,
};

export default function FileWarningsPage() {
  const { addToast } = useApp();
  const [timeRange, setTimeRange] = useState("Last 30 Days");

  // Generate booking heatmap data (7 days x 24 hours)
  const heatmapData = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      // Simulate higher activity during business hours
      const base = hour >= 9 && hour <= 17 ? 40 : 10;
      const variance = Math.sin(hour * 0.5) * 20 + Math.cos(day) * 15;
      return Math.max(0, Math.min(100, Math.round(base + variance + (hour === 14 ? 30 : 0))));
    })
  );
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getHeatColor = (value: number) => {
    if (value < 20) return "bg-primary/5";
    if (value < 40) return "bg-primary/15";
    if (value < 60) return "bg-primary/30";
    if (value < 80) return "bg-primary/50";
    return "bg-primary/70";
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase">
        <span>BarChart3</span>
        <span className="text-outline">›</span>
        <span className="text-primary">Enterprise Performance</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">FileWarnings & Insights</h1>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => addToast({ message: "Date range selector opened", type: "info" })}>
            <CalendarDays className="w-4 h-4" /> {timeRange}
          </button>
          <button className="btn-secondary" onClick={() => addToast({ message: "Report exported", type: "success" })}>
            <Download className="w-4 h-4" /> Export FileWarning
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportsKPIs.map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                {kpiIcons[kpi.icon]}
              </div>
              {kpi.trend && (
                <span className={cn("font-label-md text-label-md flex items-center gap-0.5", kpi.color)}>
                  <TrendingUp className="w-3.5 h-3.5" /> {kpi.trend}
                </span>
              )}
            </div>
            <p className="text-outline font-label-md text-label-md">{kpi.label}</p>
            <h3 className="text-display font-display text-on-surface mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Trend */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-headline-md text-headline-md text-on-surface">Utilization Trend</h4>
              <p className="text-outline font-body-md text-body-md">Daily activity tracking across all facilities</p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-surface-container rounded-lg" onClick={() => addToast({ message: "CSV exported", type: "success" })}>
                <FileText className="w-5 h-5 text-outline" />
              </button>
              <button className="p-2 hover:bg-surface-container rounded-lg" onClick={() => addToast({ message: "PDF exported", type: "success" })}>
                <ImageIcon className="w-5 h-5 text-outline" />
              </button>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-48 pt-4">
            {utilizationTrendData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end h-full">
                  <div
                    className="w-full bg-primary/70 rounded-t-md transition-all hover:bg-primary relative group"
                    style={{ height: `${d.value}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.value}%
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-outline font-mono">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Status Breakdown */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-headline-md text-headline-md text-on-surface">Asset Status</h4>
            <button className="text-outline hover:text-on-surface"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            {assetStatusBreakdown.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-on-surface font-body-md">{s.label}</span>
                  <span className={cn("font-bold", s.color)}>{s.percentage}%</span>
                </div>
                <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", s.color.replace("text-", "bg-"))}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-on-surface-variant text-body-md">{s.detail}</span>
                  <span className="text-outline text-label-md font-mono">{s.hours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dept Allocation & Booking Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dept Allocation */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-headline-md text-headline-md text-on-surface">Dept. Allocation</h4>
            <button className="text-primary font-label-md text-label-md hover:underline" onClick={() => addToast({ message: "Loading detailed list", type: "info" })}>
              View Detailed List
            </button>
          </div>
          <div className="space-y-4">
            {deptAllocationData.map((d) => (
              <div key={d.dept}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-on-surface font-body-md">{d.dept}</span>
                  <span className="font-mono text-on-surface-variant">{d.units} Units</span>
                </div>
                <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${(d.units / 1240) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Heatmap */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-headline-md text-headline-md text-on-surface">Booking Peak Windows</h4>
              <p className="text-outline font-label-md text-label-md">24-hour demand heat signature</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Hours header */}
              <div className="flex gap-0.5 mb-1">
                <div className="w-8" />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="flex-1 text-[8px] text-outline text-center font-mono">
                    {h % 3 === 0 ? `${h}` : ""}
                  </div>
                ))}
              </div>
              {/* Heatmap grid */}
              {heatmapData.map((row, dayIdx) => (
                <div key={dayIdx} className="flex gap-0.5 mb-0.5">
                  <div className="w-8 text-[10px] text-outline font-mono flex items-center">{days[dayIdx]}</div>
                  {row.map((value, hour) => (
                    <div
                      key={hour}
                      className={cn("flex-1 h-5 rounded-sm transition-colors hover:ring-2 hover:ring-primary cursor-pointer", getHeatColor(value))}
                      title={`${days[dayIdx]} ${hour}:00 - ${value}%`}
                    />
                  ))}
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] text-outline font-label-md">Low Demand</span>
                <div className="flex gap-0.5">
                  <div className="w-4 h-3 bg-primary/5 rounded-sm" />
                  <div className="w-4 h-3 bg-primary/15 rounded-sm" />
                  <div className="w-4 h-3 bg-primary/30 rounded-sm" />
                  <div className="w-4 h-3 bg-primary/50 rounded-sm" />
                  <div className="w-4 h-3 bg-primary/70 rounded-sm" />
                </div>
                <span className="text-[10px] text-outline font-label-md">Peak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Audit Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h4 className="font-headline-md text-headline-md text-on-surface">Asset Performance Audit</h4>
          <div className="relative">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input className="input-field pl-8 text-body-md" placeholder="Filter..." />
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-surface-container-lowest border-b border-outline-variant">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-body-md text-on-surface-variant">Asset ID</th>
              <th className="px-6 py-3 text-left font-semibold text-body-md text-on-surface-variant">Category</th>
              <th className="px-6 py-3 text-center font-semibold text-body-md text-on-surface-variant">Uptime</th>
              <th className="px-6 py-3 text-center font-semibold text-body-md text-on-surface-variant">MTTR</th>
              <th className="px-6 py-3 text-right font-semibold text-body-md text-on-surface-variant">Cost (MTD)</th>
              <th className="px-6 py-3 text-left font-semibold text-body-md text-on-surface-variant">Status</th>
            </tr>
          </thead>
          <tbody>
            {performanceAuditData.map((row) => (
              <tr key={row.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low">
                <td className="px-6 py-4 font-mono text-body-md">{row.id}</td>
                <td className="px-6 py-4 text-on-surface">{row.name}</td>
                <td className="px-6 py-4 text-center">{row.uptime}</td>
                <td className="px-6 py-4 text-center">{row.mttr}</td>
                <td className="px-6 py-4 text-right">{row.cost}</td>
                <td className="px-6 py-4">
                  <span className={cn("inline-flex items-center px-2 py-1 rounded text-xs font-bold",
                    row.status === "Optimal" ? "bg-available/10 text-available" :
                    row.status === "AlertTriangle" ? "bg-reserved/10 text-reserved" :
                    "bg-error/10 text-error")}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-4 border-t border-outline-variant">
          <p className="text-[12px] text-outline font-label-md">Showing 4 of 285 assets</p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded hover:bg-surface-container">‹</button>
            <button className="p-1.5 rounded hover:bg-surface-container">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
