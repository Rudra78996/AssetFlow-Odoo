"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useApp } from "@/contexts/AppContext";
import { auditAssets as initialAssets, auditDiscrepancies, currentAuditCycle } from "@/lib/mockData";
import type { AuditAsset } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Download, CheckCircle2, LockOpen, AlertTriangle, FileWarning,
  Construction, X, Plus, ChevronLeft, ChevronRight,
  Gauge, ListChecks,
} from "lucide-react";

export default function AuditsPage() {
  const { addToast } = useApp();
  const [assets, setAssets] = useState<AuditAsset[]>(initialAssets);
  const [filter, setFilter] = useState<"PENDING" | "COMPLETED">("PENDING");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [auditForm, setAuditForm] = useState({ scope: "", startDate: "", endDate: "", auditors: [] as string[] });

  const handleQuickAction = (id: string, status: AuditAsset["status"]) => {
    setAssets(assets.map(a => a.id === id ? { ...a, status } : a));
    addToast({ message: `Asset marked as ${status}`, type: status === "verified" ? "success" : status === "missing" || status === "damaged" ? "error" : "info" });
  };

  const filteredAssets = filter === "PENDING"
    ? assets.filter(a => a.status === "pending")
    : assets.filter(a => a.status !== "pending");

  const verifiedCount = assets.filter(a => a.status === "verified").length;
  const issueCount = assets.filter(a => a.status === "missing" || a.status === "damaged").length;
  const progress = Math.round((assets.filter(a => a.status !== "pending").length / assets.length) * 100);

  const actionButtons = (asset: AuditAsset) => {
    if (asset.status !== "pending") {
      return (
        <div className="flex items-center gap-2">
          {asset.status === "verified" && (
            <span className="text-available font-bold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Verified
            </span>
          )}
          {asset.status === "missing" && <span className="text-error font-bold text-xs">Missing</span>}
          {asset.status === "damaged" && <span className="text-tertiary font-bold text-xs">Damaged</span>}
          <button className="p-2 text-outline hover:text-primary" onClick={() => handleQuickAction(asset.id, "pending")}>
            <Construction className="w-4 h-4" />
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <button onClick={() => handleQuickAction(asset.id, "verified")} className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-available/10 text-available transition-colors">
          <CheckCircle2 className="w-4 h-4" /> Verified
        </button>
        <button onClick={() => handleQuickAction(asset.id, "missing")} className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-error/10 text-error transition-colors">
          <X className="w-4 h-4" /> Missing
        </button>
        <button onClick={() => handleQuickAction(asset.id, "damaged")} className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-tertiary/10 text-tertiary transition-colors">
          <Construction className="w-4 h-4" /> Damaged
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase">
        <span>Audits</span>
        <span className="text-outline">›</span>
        <span className="text-primary">Active Cycle #821</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display font-display text-on-surface">Asset Audit Cycle</h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg">Precision compliance and resource verification.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => addToast({ message: "Data exported", type: "success" })}>
            <Download className="w-4 h-4" /> Export Data
          </button>
          <button className="btn-primary" onClick={() => setShowCloseModal(true)}>
            <LockOpen className="w-4 h-4" /> Close Audit Cycle
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cycle Scope */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-5 h-5" />
            <h3 className="font-headline-md text-headline-md">Cycle Scope</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">Department / Location</label>
              <p className="text-body-md mt-1">{currentAuditCycle.scope}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-on-surface-variant">Start Date</label>
                <p className="text-body-md mt-1">{currentAuditCycle.startDate}</p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-on-surface-variant">End Date</label>
                <p className="text-body-md mt-1">{currentAuditCycle.endDate}</p>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">Auditor Selection</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentAuditCycle.auditors.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container/50 rounded-full text-body-md">
                    {a}
                    <button className="text-outline hover:text-error"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <button className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-low" onClick={() => addToast({ message: "Add auditor form opened", type: "info" })}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-body-md">Progress</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Discrepancies */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-error" />
            <h3 className="font-headline-md text-headline-md">Discrepancies</h3>
            <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-label-md">12 FLAGS</span>
          </div>
          <div className="space-y-3">
            {auditDiscrepancies.map((d) => (
              <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant">
                {d.type === "missing" ? (
                  <FileWarning className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                ) : (
                  <Construction className="w-5 h-5 text-tertiary flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{d.assetName}</p>
                  <p className="text-xs text-on-surface-variant italic mt-0.5">&quot;{d.issue}&quot;</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border border-outline-variant rounded-md text-body-md hover:bg-surface-container-low" onClick={() => addToast({ message: "Loading full discrepancy list", type: "info" })}>
            View Full Discrepancy List
          </button>
        </div>

        {/* Create New Cycle */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <ListChecks className="w-5 h-5" />
            <h3 className="font-headline-md text-headline-md">Create New Cycle</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">Scope</label>
              <input className="input-field mt-1" placeholder="e.g. Warehouse B" value={auditForm.scope} onChange={(e) => setAuditForm({ ...auditForm, scope: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-on-surface-variant">Start</label>
                <input type="date" className="input-field mt-1" value={auditForm.startDate} onChange={(e) => setAuditForm({ ...auditForm, startDate: e.target.value })} />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-on-surface-variant">End</label>
                <input type="date" className="input-field mt-1" value={auditForm.endDate} onChange={(e) => setAuditForm({ ...auditForm, endDate: e.target.value })} />
              </div>
            </div>
            <button className="btn-primary w-full justify-center" onClick={() => {
              if (!auditForm.scope) { addToast({ message: "Scope is required", type: "error" }); return; }
              addToast({ message: "New audit cycle created", type: "success" });
              setAuditForm({ scope: "", startDate: "", endDate: "", auditors: [] });
            }}>
              Create Audit Cycle
            </button>
          </div>
        </div>
      </div>

      {/* Asset Verification List */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <ListChecks className="w-5 h-5" />
            <h3 className="font-headline-md text-headline-md">Asset Verification List</h3>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-1">
            <button
              onClick={() => setFilter("PENDING")}
              className={cn("px-3 py-1 text-xs rounded-md", filter === "PENDING" ? "bg-surface-container-lowest shadow-ambient" : "text-on-surface-variant")}
            >
              PENDING
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={cn("px-3 py-1 text-xs rounded-md", filter === "COMPLETED" ? "bg-surface-container-lowest shadow-ambient" : "text-on-surface-variant")}
            >
              COMPLETED
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-surface-container-lowest border-b border-outline-variant">
            <tr>
              <th className="px-6 py-4 text-left font-label-md text-on-surface-variant">Asset Info</th>
              <th className="px-6 py-4 text-left font-label-md text-on-surface-variant">Tag / SN</th>
              <th className="px-6 py-4 text-left font-label-md text-on-surface-variant">Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className={cn("border-b border-outline-variant/50 hover:bg-surface-container-low", asset.status !== "pending" && "opacity-75")}>
                <td className="px-6 py-4">
                  <p className="font-label-md text-label-md text-on-surface">{asset.name}</p>
                  <p className="text-xs text-on-surface-variant">{asset.location}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-mono text-body-md text-on-surface-variant">{asset.tag}</p>
                  <p className="text-[10px] text-on-surface-variant">SN: {asset.serialNumber}</p>
                </td>
                <td className="px-6 py-4">{actionButtons(asset)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-4 border-t border-outline-variant">
          <p className="text-xs text-on-surface-variant">Showing 1-{filteredAssets.length} of {assets.length} items</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low"><ChevronLeft className="w-4 h-4" /></button>
            {[1, 2, 3].map(p => (
              <button key={p} className={cn("w-8 h-8 rounded text-body-md", p === 1 ? "bg-primary text-white" : "hover:bg-surface-container-low")}>{p}</button>
            ))}
            <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Close Audit Modal */}
      <Modal open={showCloseModal} onClose={() => setShowCloseModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LockOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">Finalize Audit Cycle?</h3>
          <p className="text-on-surface-variant font-body-md text-body-md mb-6">
            You are about to close Audit Cycle <span className="font-bold text-on-surface">#{currentAuditCycle.id}</span>. This action will finalize all verified asset states and trigger a discrepancy report.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-surface-container-low rounded-lg">
              <p className="text-on-surface-variant text-xs font-bold">VERIFIED ASSETS</p>
              <p className="text-available font-bold text-xl mt-1">{verifiedCount}</p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg">
              <p className="text-on-surface-variant text-xs font-bold">MISSING / DAMAGED</p>
              <p className="text-error font-bold text-xl mt-1">{issueCount}</p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg">
              <p className="text-on-surface uppercase tracking-widest text-xs">TOTAL SCORE</p>
              <p className="text-primary font-bold text-xl mt-1">{currentAuditCycle.complianceGauge}%</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-3 border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low" onClick={() => setShowCloseModal(false)}>
              XCircle
            </button>
            <button
              className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary/90"
              onClick={() => { setShowCloseModal(false); addToast({ message: "Audit cycle finalized. Report generated.", type: "success" }); }}
            >
              Finalize & FileWarning
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
