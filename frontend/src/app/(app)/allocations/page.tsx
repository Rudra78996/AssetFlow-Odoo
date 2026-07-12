"use client";

import { useState } from "react";
import { Stepper, type Step } from "@/components/Stepper";
import { StatusBadge } from "@/components/StatusBadge";
import { useApp } from "@/contexts/AppContext";
import { allocations } from "@/lib/mockData";
import type { Allocation } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Plus, Download, Edit, AlertTriangle, ArrowRightLeft, XCircle, Filter,
  MoreHorizontal, BarChart3, TrendingUp,
} from "lucide-react";

export default function AllocationsPage() {
  const { addToast } = useApp();
  const [allocList, setAllocList] = useState<Allocation[]>(allocations);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset: "", recipient: "", returnDate: "" });
  const [conflict, setConflict] = useState(false);

  const transferSteps: Step[] = [
    { label: "Requested", status: "completed", detail: "Today, 10:45 AM" },
    { label: "Approved", status: "current", detail: "Awaiting Manager" },
    { label: "Re-allocated", status: "upcoming", detail: "Clock Approval" },
  ];

  const handleAssetSelect = (assetName: string) => {
    setForm({ ...form, asset: assetName });
    // Simulate conflict for certain assets
    setConflict(assetName === "MacBook Pro M2 Max" || assetName === "Surface Laptop 5");
  };

  const handleSubmit = () => {
    if (!form.asset || !form.recipient) {
      addToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }
    const newAlloc: Allocation = {
      id: `al${Date.now()}`,
      assetId: "a-new",
      assetName: form.asset,
      employee: form.recipient,
      department: "Operations",
      status: "PENDING",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      expectedReturn: form.returnDate || undefined,
    };
    setAllocList([newAlloc, ...allocList]);
    setShowForm(false);
    setForm({ asset: "", recipient: "", returnDate: "" });
    setConflict(false);
    addToast({ message: "Allocation request submitted", type: "success" });
  };

  const handleMarkReturned = (id: string) => {
    setAllocList(allocList.map(a => a.id === id ? { ...a, status: "RETURNED" } : a));
    addToast({ message: "Asset marked as returned", type: "success" });
  };

  const overdueItems = [
    { id: "od1", name: "Surface Laptop 5", assetId: "MS-L5-002", daysLate: 4, person: "Marcus Vane", dept: "Wrench Dept" },
    { id: "od2", name: "Wacom Cintiq Pro", assetId: "WCM-24", daysLate: 12, person: "Sarah Jenkins", dept: "Creative Arts" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Asset Allocation & Transfer</h1>
          <p className="text-on-surface-variant mt-1">Manage lifecycle movement and departmental resource distribution.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => addToast({ message: "Report exported", type: "success" })}>
            <Download className="w-4 h-4" /> Export FileWarning
          </button>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" /> New Allocation
          </button>
        </div>
      </div>

      {/* Allocation Form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Edit className="w-5 h-5 text-primary" />
            <h3 className="font-headline-md text-headline-md">Initiate Transfer</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Select Asset</label>
              <select className="input-field" value={form.asset} onChange={(e) => handleAssetSelect(e.target.value)}>
                <option value="">Choose an asset...</option>
                <option>MacBook Pro M2 Max</option>
                <option>Dell UltraSharp U2723QE</option>
                <option>Surface Laptop 5</option>
                <option>Herman Miller Aeron</option>
              </select>
            </div>
            <div>
              <label className="label-field">Target Recipient</label>
              <input className="input-field" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="Employee or Department" />
            </div>
            <div>
              <label className="label-field">Expected Return Date</label>
              <input type="date" className="input-field" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} />
            </div>
          </div>

          {/* Conflict State */}
          {conflict && (
            <div className="mt-4 p-4 bg-error-container/20 border border-error/30 rounded-lg flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-headline-md text-headline-md text-error">Asset Unavailable</h4>
                <p className="text-on-surface-variant text-body-md mb-4">
                  Currently held by <span className="font-bold text-on-surface">Priya Sharma</span> (Product Design).
                </p>
                <div className="flex gap-3">
                  <button className="btn-primary" onClick={() => addToast({ message: "Transfer request initiated", type: "success" })}>
                    <ArrowRightLeft className="w-4 h-4" /> Request Transfer
                  </button>
                  <button className="btn-secondary" onClick={() => addToast({ message: "Loading current allocation log", type: "info" })}>
                    View Current Log
                  </button>
                </div>
              </div>
            </div>
          )}

          {!conflict && form.asset && (
            <div className="flex gap-3 mt-4">
              <button className="btn-primary" onClick={handleSubmit}>Submit Allocation</button>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* Transfer Workflow */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-headline-md text-headline-md">Transfer Workflow: TP-441</h3>
            <span className="px-3 py-1 bg-primary-fixed text-primary rounded-full text-label-md font-label-md">In Progress</span>
          </div>
          <button className="text-error font-label-md hover:underline" onClick={() => addToast({ message: "Transfer cancelled", type: "info" })}>
            Cancel Transfer
          </button>
        </div>
        <Stepper steps={transferSteps} />
        <div className="mt-6 p-4 bg-surface-container-low rounded-lg flex items-center gap-2">
          <span className="font-body-md text-on-surface">Priya Sharma</span>
          <span className="text-on-surface-variant">transferring to</span>
          <span className="font-body-md text-on-surface">David Kim</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation History Table */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-4 border-b border-outline-variant">
            <h3 className="font-label-md uppercase tracking-wider text-on-surface">Recent Allocation History</h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-surface-container rounded"><Filter className="w-5 h-5" /></button>
              <button className="p-1.5 hover:bg-surface-container rounded"><MoreHorizontal className="w-5 h-5" /></button>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-surface-container-lowest border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-label-md text-on-surface-variant">Asset ID</th>
                <th className="px-6 py-3 text-left font-medium text-label-md text-on-surface-variant">Employee</th>
                <th className="px-6 py-3 text-left font-medium text-label-md text-on-surface-variant">Status</th>
                <th className="px-6 py-3 text-left font-medium text-label-md text-on-surface-variant">Date</th>
                <th className="px-6 py-3 text-left font-medium text-label-md text-on-surface-variant">Action</th>
              </tr>
            </thead>
            <tbody>
              {allocList.map((alloc) => (
                <tr key={alloc.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low">
                  <td className="px-6 py-4 font-mono text-body-md">{alloc.assetName.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-secondary text-[10px] font-bold">
                        {alloc.employee.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-body-md">{alloc.employee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={alloc.status} /></td>
                  <td className="px-6 py-4 text-on-surface-variant">{alloc.date}</td>
                  <td className="px-6 py-4">
                    {alloc.status === "OVERDUE" ? (
                      <button className="text-primary font-label-md hover:underline" onClick={() => handleMarkReturned(alloc.id)}>
                        Mark Returned
                      </button>
                    ) : (
                      <button className="text-primary font-label-md hover:underline" onClick={() => addToast({ message: "Viewing details", type: "info" })}>
                        Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Overdue Alerts */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-error" />
            <h3 className="font-headline-md text-headline-md">Overdue Alerts</h3>
            <span className="text-[10px] bg-error text-white px-2 py-0.5 rounded">3 Items</span>
          </div>
          <div className="space-y-3">
            {overdueItems.map((item) => (
              <div key={item.id} className="group p-4 rounded-lg border border-outline-variant hover:border-error/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-on-surface">{item.name}</h4>
                    <p className="text-xs text-on-surface-variant font-mono">ID: {item.assetId}</p>
                  </div>
                  <span className="text-[10px] font-black text-error">{item.daysLate} DAYS LATE</span>
                </div>
                <p className="text-body-md font-medium">{item.person}</p>
                <p className="text-[10px] text-on-surface-variant">{item.dept}</p>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-1.5 bg-error text-white rounded-md text-label-md hover:bg-error/90" onClick={() => addToast({ message: `Reminder sent to ${item.person}`, type: "success" })}>
                    Send Reminder
                  </button>
                  <button className="p-1.5 border border-outline-variant rounded-md"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Pulse & Dept Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-headline-md">Quick Pulse</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-primary text-label-md">Total Assets</p>
              <p className="text-display font-display leading-none">1,248</p>
            </div>
            <div>
              <p className="text-primary text-label-md">In Rotation</p>
              <p className="text-headline-lg font-headline-lg">82%</p>
            </div>
            <p className="text-[11px] text-primary/80">Asset rotation is 5% higher than last quarter. Optimize storage for remaining 18% idle units.</p>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="font-label-md uppercase tracking-wider mb-4">Allocation by Dept</h3>
          <div className="space-y-3">
            {[
              { dept: "Product & Design", count: 342, pct: 27 },
              { dept: "Wrench", count: 411, pct: 33 },
              { dept: "Marketing", count: 198, pct: 16 },
              { dept: "Operations", count: 297, pct: 24 },
            ].map((d) => (
              <div key={d.dept} className="flex items-center gap-4">
                <span className="flex-1 font-body-md text-on-surface">{d.dept}</span>
                <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="font-mono text-on-surface-variant w-12 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
