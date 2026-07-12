"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { activityLogs, notifications, activityStats } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  Download, RefreshCw, AlertTriangle, ListChecks, ArrowRightLeft, UserPlus,
  X, Filter, TrendingUp, TrendingDown, Bell,
} from "lucide-react";

const notifIcons: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  overdue: { icon: <AlertTriangle className="w-5 h-5" />, color: "text-on-error-container", bg: "bg-error-container/20" },
  audit: { icon: <ListChecks className="w-5 h-5" />, color: "text-on-tertiary-container", bg: "bg-tertiary-container/10" },
  transfer: { icon: <ArrowRightLeft className="w-5 h-5" />, color: "text-on-primary-container", bg: "bg-primary-container/10" },
  assignment: { icon: <UserPlus className="w-5 h-5" />, color: "text-on-secondary-container", bg: "bg-secondary-container/10" },
  system: { icon: <RefreshCw className="w-5 h-5" />, color: "text-on-surface", bg: "bg-surface-container-low" },
};

export default function ActivityPage() {
  const { addToast, markAllRead, dismissNotification } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Success" | "Failed">("all");

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = !search ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.objectId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Activity Logs & Notifications</h1>
          <p className="text-on-surface-variant mt-1">Monitor real-time system events and historical audit trails.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => addToast({ message: "CSV exported", type: "success" })}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="btn-primary" onClick={() => addToast({ message: "Live feed refreshed", type: "info" })}>
            <RefreshCw className="w-4 h-4" /> Live Feed
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Alerts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-headline-md text-on-surface">Live Alerts</h3>
            <span className="px-2 py-0.5 bg-error/10 text-error text-xs rounded">4 Critical</span>
          </div>
          <div className="space-y-3">
            {notifications.map((n) => {
              const config = notifIcons[n.type] || notifIcons['system'];
              return (
                <div key={n.id} className={cn("relative p-3 rounded-lg border border-outline-variant", !n.read && "bg-primary/5")}>
                  <button
                    onClick={() => dismissNotification(n.id)}
                    className="absolute top-2 right-2 text-outline hover:text-error"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-start gap-3 pr-6">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", config.bg, config.color)}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-bold text-sm", config.color)}>{n.title}</p>
                      <p className="text-sm mt-1 text-on-surface-variant">{n.message}</p>
                      <p className="text-[10px] text-outline mt-2">{n.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="text-primary text-xs font-bold mt-4 hover:underline" onClick={markAllRead}>
            Mark all as read
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="card overflow-hidden lg:col-span-2">
          {/* Filters */}
          <div className="flex items-center gap-3 p-4 border-b border-outline-variant">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user, action, or object ID..."
                className="input-field"
              />
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-1">
              {(["all", "Success", "Failed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn("px-3 py-1 text-xs rounded-md transition-colors", statusFilter === s ? "bg-surface-container-lowest shadow-ambient" : "text-on-surface-variant")}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
            <button className="p-2 border border-outline-variant rounded-md hover:bg-surface-container-low">
              <Filter className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>

          <table className="w-full">
            <thead className="bg-surface-container-lowest border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-body-md text-on-surface">User</th>
                <th className="px-6 py-4 text-left font-bold text-body-md text-on-surface">Action</th>
                <th className="px-6 py-4 text-left font-bold text-body-md text-on-surface">Object ID</th>
                <th className="px-6 py-4 text-left font-bold text-body-md text-on-surface">Timestamp</th>
                <th className="px-6 py-4 text-left font-bold text-body-md text-on-surface">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary text-[10px] font-bold">
                        {log.user.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{log.user}</p>
                        <p className="text-xs text-on-surface-variant">{log.userRole}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("text-sm font-medium", log.status === "Failed" ? "text-error" : "text-on-surface")}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{log.objectId}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-on-surface-variant">{log.timestamp.split(" ").slice(0, 3).join(" ")}</p>
                    <p className="text-xs text-outline">{log.timestamp.split(" ").slice(3).join(" ")}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("text-xs font-bold", log.status === "Success" ? "text-on-surface" : "text-error")}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between p-4 border-t border-outline-variant">
            <p className="text-xs text-on-surface-variant">Showing 1-{filteredLogs.length} of 2,842 activities</p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded">‹</button>
              {[1, 2, 3].map(p => (
                <button key={p} className={cn("w-8 h-8 flex items-center justify-center rounded", p === 1 ? "bg-primary text-white" : "hover:bg-surface-container-low")}>{p}</button>
              ))}
              <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {activityStats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-on-surface-variant text-xs font-bold">{stat.label}</p>
            <h4 className="text-2xl font-bold mt-1">{stat.value}</h4>
            <div className="flex items-center gap-1 mt-2">
              {stat.trendDirection === "up" ? (
                <TrendingUp className="w-4 h-4 text-available" />
              ) : (
                <TrendingDown className="w-4 h-4 text-error" />
              )}
              <span className={cn("text-xs font-bold", stat.trendDirection === "up" ? "text-available" : "text-error")}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
