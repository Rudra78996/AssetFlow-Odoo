"use client";

import { KpiCard } from "@/components/KpiCard";
import { useApp } from "@/contexts/AppContext";
import { dashboardKPIs, overdueReturns, recentActivity } from "@/lib/mockData";
import {
  Package, ArrowUpRight, Wrench, CalendarCheck, ArrowLeftRight, CornerUpLeft,
  Plus, Download, AlertTriangle, MoreHorizontal, CheckCircle2, MoveUp, Clock,
  Package2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  inventory: <Package className="w-5 h-5" />,
  outbound: <ArrowUpRight className="w-5 h-5" />,
  engineering: <Wrench className="w-5 h-5" />,
  book_online: <CalendarCheck className="w-5 h-5" />,
  sync_alt: <ArrowLeftRight className="w-5 h-5" />,
  keyboard_return: <CornerUpLeft className="w-5 h-5" />,
};

const activityIconMap: Record<string, React.ReactNode> = {
  check_circle: <CheckCircle2 className="w-5 h-5" />,
  move_up: <MoveUp className="w-5 h-5" />,
  pending: <Clock className="w-5 h-5" />,
};

export default function DashboardPage() {
  const { addToast } = useApp();

  const quickActions = [
    { label: "Register Asset", desc: "Add new item to inventory", icon: <Plus className="w-5 h-5" />, color: "text-primary", href: "/assets" },
    { label: "Book Resource", desc: "Schedule asset for use", icon: <CalendarCheck className="w-5 h-5" />, color: "text-secondary", href: "/bookings" },
    { label: "Raise Maintenance", desc: "Report damage or schedule service", icon: <Wrench className="w-5 h-5" />, color: "text-tertiary", href: "/maintenance" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display font-display text-on-surface">System Overview</h1>
          <p className="text-on-surface-variant text-body-lg mt-1">Tracking performance and resource distribution for Q3.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => addToast({ message: "Report exported successfully", type: "success" })}>
            <Download className="w-4 h-4" /> Export FileWarning
          </button>
          <button className="btn-primary" onClick={() => addToast({ message: "Opening allocation form...", type: "info" })}>
            <Plus className="w-4 h-4" /> Quick Allocation
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {dashboardKPIs.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={iconMap[kpi.icon]}
            trend={kpi.trend}
            trendDirection={kpi.trendDirection}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Returns */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-error" />
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Critical Overdue Returns</h3>
              <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">6 ASSETS</span>
            </div>
          </div>
          <div className="space-y-3">
            {overdueReturns.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-outline-variant hover:border-error/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-error/5 flex items-center justify-center text-error">
                  <Package2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface">{item.name}</p>
                  <p className="text-[12px] text-outline font-mono">ID: {item.assetId} • <span className="text-error font-bold">Overdue by {item.daysOverdue} days</span></p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="font-label-md text-label-md">{item.person}</p>
                  <p className="text-[11px] text-outline">{item.department}</p>
                </div>
                <button className="text-primary hover:underline font-label-md" onClick={() => addToast({ message: `Contact request sent to ${item.person}`, type: "info" })}>
                  Contact
                </button>
              </div>
            ))}
          </div>
          <button className="text-primary font-bold text-[12px] mt-4 hover:underline" onClick={() => addToast({ message: "Loading all overdue items...", type: "info" })}>
            View All Overdue Items
          </button>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h4 className="text-outline text-[12px] uppercase mb-4">Quick Actions</h4>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => addToast({ message: `Navigating to ${action.label}...`, type: "info" })}
                className="group flex items-center gap-4 w-full p-3 rounded-lg border border-outline-variant hover:border-primary/20 hover:bg-primary/5 transition-all text-left"
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-low group-hover:bg-primary group-hover:text-white transition-colors", action.color)}>
                  {action.icon}
                </div>
                <div>
                  <p className="font-bold text-on-surface">{action.label}</p>
                  <p className="text-[11px] text-outline">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h3>
            <button className="text-outline hover:text-primary transition-all">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={cn("flex-shrink-0", activity.color)}>
                  {activityIconMap[activity.icon]}
                </div>
                <div className="flex-1">
                  <p className="text-on-surface">
                    <span className="font-bold">{activity.title}</span>
                    {activity.detail}
                  </p>
                  <p className="text-[12px] text-outline mt-0.5">{activity.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Health */}
        <div className="card p-6">
          <h4 className="font-headline-md text-headline-md mb-4">Fleet Health</h4>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E0E3E5" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#16A34A" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="20" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[20px] font-bold">92%</p>
                <p className="text-[10px] text-outline uppercase">Optimal</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "In Service", pct: 75, color: "bg-available" },
              { label: "Reserve", pct: 15, color: "bg-primary" },
              { label: "Repair", pct: 8, color: "bg-under-maintenance" },
              { label: "Retired", pct: 2, color: "bg-outline" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-[11px] text-outline w-20">{s.label}</span>
                <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.pct}%` }} />
                </div>
                <span className="text-[11px] text-outline w-8 text-right">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
