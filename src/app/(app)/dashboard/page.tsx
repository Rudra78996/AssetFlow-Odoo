"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KpiCard } from "@/components/KpiCard";
import { useApp } from "@/contexts/AppContext";
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
  const router = useRouter();

  const handleExportReport = async () => {
    try {
      const res = await fetch("/api/reports?range=30&idleDays=30", { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data.data, null, 2))}`;
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute("download", `AssetFlow_Report_Q3_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        addToast({ message: "Report JSON exported successfully", type: "success" });
      } else {
        addToast({ message: "Failed to fetch report data from server", type: "error" });
      }
    } catch (err) {
      addToast({ message: "Network error exporting report", type: "error" });
    }
  };
  const [kpiList, setKpiList] = useState<any[]>([]);
  const [overdueList, setOverdueList] = useState<any[]>([]);
  const [activityList, setActivityList] = useState<any[]>([]);
  const [fleetStats, setFleetStats] = useState({
    optimalPct: 92,
    inServicePct: 75,
    reservePct: 15,
    repairPct: 8,
    retiredPct: 2,
    strokeDashoffset: 20,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await fetch("/api/dashboard", { credentials: "include" });
        const dashData = await dashRes.json();
        if (dashRes.ok && dashData.success) {
          if (dashData.data.kpis) {
            setKpiList(dashData.data.kpis);
          }
          const breakdown = dashData.data.assetStatusBreakdown || [];
          const total = breakdown.reduce((acc: number, curr: any) => acc + curr.count, 0) || 1;
          const allocated = breakdown.find((b: any) => b.label === "Allocated")?.count ?? 0;
          const available = breakdown.find((b: any) => b.label === "Available")?.count ?? 0;
          const reserved = breakdown.find((b: any) => b.label === "Reserved")?.count ?? 0;
          const maintenance = breakdown.find((b: any) => b.label === "Under Maintenance")?.count ?? 0;
          const retired = breakdown.find((b: any) => b.label === "Retired")?.count ?? 0;
          const lost = breakdown.find((b: any) => b.label === "Lost")?.count ?? 0;
          const disposed = breakdown.find((b: any) => b.label === "Disposed")?.count ?? 0;

          const inServ = Math.round((allocated / total) * 100);
          const res = Math.round(((available + reserved) / total) * 100);
          const rep = Math.round((maintenance / total) * 100);
          const ret = Math.round(((retired + lost + disposed) / total) * 100);
          const opt = inServ + res;
          const offset = 251.2 - (251.2 * opt) / 100;

          setFleetStats({
            optimalPct: opt,
            inServicePct: inServ,
            reservePct: res,
            repairPct: rep,
            retiredPct: ret,
            strokeDashoffset: offset,
          });
        }

        const overdueRes = await fetch("/api/allocations?status=OVERDUE", { credentials: "include" });
        const overdueData = await overdueRes.json();
        if (overdueRes.ok && overdueData.success) {
          const mapped = overdueData.data.map((item: any) => {
            const expected = item.expectedReturn ? new Date(item.expectedReturn).getTime() : Date.now();
            const days = Math.max(1, Math.ceil((Date.now() - expected) / (1000 * 60 * 60 * 24)));
            return {
              id: item.id,
              name: item.assetName,
              assetId: item.assetId,
              daysOverdue: days,
              person: item.employee,
              department: item.department,
            };
          });
          setOverdueList(mapped);
        }

        const actRes = await fetch("/api/activity", { credentials: "include" });
        const actData = await actRes.json();
        if (actRes.ok && actData.success) {
          const mappedAct = actData.data.slice(0, 5).map((act: any) => {
            let icon = "pending";
            let color = "text-secondary";
            if (act.action.includes("created") || act.action.includes("register") || act.action.includes("approved")) {
              icon = "check_circle";
              color = "text-available";
            } else if (act.action.includes("transfer") || act.action.includes("promoted")) {
              icon = "move_up";
              color = "text-primary";
            }
            return {
              id: act.id,
              icon,
              color,
              title: act.action.split(".").map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
              detail: ` on ${act.objectType} ${act.objectId}`,
              meta: `${act.userEmail || act.user || "System"} • ${new Date(act.createdAt).toLocaleString()}`,
            };
          });
          setActivityList(mappedAct);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [addToast]);
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
          <button className="btn-secondary" onClick={handleExportReport}>
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="btn-primary" onClick={() => router.push("/allocations")}>
            <Plus className="w-4 h-4" /> Quick Allocation
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiList.map((kpi) => (
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
              <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{overdueList.length} ASSETS</span>
            </div>
          </div>
          <div className="space-y-3">
            {overdueList.map((item) => (
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
                <button
                  className="text-primary hover:underline font-label-md"
                  onClick={() => {
                    window.location.href = `mailto:?subject=Overdue Asset Return Request&body=Hi ${item.person}, this is a friendly reminder to return the overdue asset ${item.name} (Tag: ${item.assetId}).`;
                  }}
                >
                  Contact
                </button>
              </div>
            ))}
          </div>
          <button className="text-primary font-bold text-[12px] mt-4 hover:underline" onClick={() => router.push("/allocations")}>
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
                onClick={() => router.push(action.href)}
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
            {activityList.map((activity) => (
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
                <circle cx="50" cy="50" r="40" fill="none" stroke="#16A34A" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={fleetStats.strokeDashoffset} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[20px] font-bold">{fleetStats.optimalPct}%</p>
                <p className="text-[10px] text-outline uppercase">Optimal</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "In Service", pct: fleetStats.inServicePct, color: "bg-available" },
              { label: "Reserve", pct: fleetStats.reservePct, color: "bg-primary" },
              { label: "Repair", pct: fleetStats.repairPct, color: "bg-under-maintenance" },
              { label: "Retired", pct: fleetStats.retiredPct, color: "bg-outline" },
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
