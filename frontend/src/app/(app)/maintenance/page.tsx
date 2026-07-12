"use client";

import { useState } from "react";
import { Stepper, type Step } from "@/components/Stepper";
import { Modal } from "@/components/Modal";
import { useApp } from "@/contexts/AppContext";
import { maintenanceRequests, maintenanceHistory } from "@/lib/mockData";
import type { MaintenanceRequest, MaintenancePriority } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Plus, AlertTriangle, CloudUpload, X, Lock,
  CheckCircle2, XCircle, Wrench,
} from "lucide-react";

const priorityColors: Record<MaintenancePriority, string> = {
  High: "bg-error/10 text-error",
  Medium: "bg-primary/10 text-primary",
  Low: "bg-secondary-container text-on-secondary-container",
};

const statusSteps: Record<string, Step[]> = {
  Clock: [
    { label: "Clock", status: "current", detail: "Awaiting review" },
    { label: "Approved", status: "upcoming" },
    { label: "Technician Assigned", status: "upcoming" },
    { label: "In Progress", status: "upcoming" },
    { label: "Resolved", status: "upcoming" },
  ],
  Approved: [
    { label: "Clock", status: "completed" },
    { label: "Approved", status: "current", detail: "Approved" },
    { label: "Technician Assigned", status: "upcoming" },
    { label: "In Progress", status: "upcoming" },
    { label: "Resolved", status: "upcoming" },
  ],
  "Technician Assigned": [
    { label: "Clock", status: "completed" },
    { label: "Approved", status: "completed" },
    { label: "Technician Assigned", status: "current", detail: "In progress" },
    { label: "In Progress", status: "upcoming" },
    { label: "Resolved", status: "upcoming" },
  ],
  Resolved: [
    { label: "Clock", status: "completed" },
    { label: "Approved", status: "completed" },
    { label: "Technician Assigned", status: "completed" },
    { label: "In Progress", status: "completed" },
    { label: "Resolved", status: "completed", detail: "Completed" },
  ],
};

const workflowColumns = [
  { status: "Clock", label: "Clock", count: "12", color: "bg-surface-variant text-on-surface-variant" },
  { status: "Approved", label: "Approved", count: "05", color: "bg-surface-variant text-on-surface-variant" },
  { status: "Technician Assigned", label: "Technician Assigned", count: "08", color: "bg-surface-variant text-on-surface-variant" },
  { status: "Resolved", label: "Resolved", count: "42", color: "bg-surface-variant text-on-surface-variant" },
];

export default function MaintenancePage() {
  const { addToast } = useApp();
  const [requestList, setRequestList] = useState<MaintenanceRequest[]>(maintenanceRequests);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset: "", priority: "Medium" as MaintenancePriority, issue: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!form.asset) e.asset = "Please select an asset";
    if (!form.issue) e.issue = "Please describe the issue";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const newReq: MaintenanceRequest = {
      id: `mr${Date.now()}`,
      assetId: "a-new",
      assetName: form.asset,
      issue: form.issue,
      priority: form.priority,
      status: "Clock",
      date: "Just now",
      description: form.issue,
    };
    setRequestList([newReq, ...requestList]);
    setShowForm(false);
    setForm({ asset: "", priority: "Medium", issue: "" });
    addToast({ message: "Maintenance request submitted", type: "success" });
  };

  const handleApprove = (id: string) => {
    setRequestList(requestList.map(r => r.id === id ? { ...r, status: "Approved" } : r));
    addToast({ message: "Maintenance request approved", type: "success" });
  };

  const handleReject = (id: string) => {
    setRequestList(requestList.map(r => r.id === id ? { ...r, status: "Rejected" } : r));
    addToast({ message: "Maintenance request rejected", type: "info" });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold">Maintenance Management</h1>
          <p className="text-on-surface-variant font-body-md">Schedule, track, and approve enterprise asset repairs.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5" /> Raise Request
        </button>
      </div>

      {/* Active Workflows */}
      <div>
        <h2 className="font-headline-md text-headline-md mb-4">Active Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowColumns.map((col) => {
            const items = requestList.filter(r => r.status === col.status);
            return (
              <div key={col.status} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-md uppercase tracking-wider text-on-surface-variant">{col.label}</span>
                  <span className={cn("px-2 text-xs font-bold rounded", col.color)}>{col.count}</span>
                </div>
                <div className="space-y-3">
                  {items.length > 0 ? items.map((req) => (
                    <div key={req.id} className="p-3 rounded-lg border border-outline-variant hover:border-primary/20 transition-colors">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-label-md font-bold text-on-surface">{req.assetName}</p>
                        {req.priority === "High" && <AlertTriangle className="w-4 h-4 text-error" />}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">{req.issue}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", priorityColors[req.priority])}>
                          {req.priority.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-outline">{req.date}</span>
                      </div>
                      {req.status === "Clock" && (
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 py-1.5 bg-primary text-white rounded-md text-xs hover:bg-primary/90" onClick={() => handleApprove(req.id)}>Approve</button>
                          <button className="flex-1 py-1.5 border border-outline-variant rounded-md text-xs hover:bg-surface-container-low" onClick={() => handleReject(req.id)}>Reject</button>
                        </div>
                      )}
                      {req.technician && (
                        <p className="text-[11px] text-on-surface-variant mt-2">Assigned to: {req.technician}</p>
                      )}
                    </div>
                  )) : (
                    <p className="text-xs text-outline text-center py-4">No items</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfer Stepper for selected request */}
      {requestList[0] && (
        <div className="card p-6">
          <h3 className="font-headline-md text-headline-md mb-6">
            Workflow: {requestList[0].assetName}
          </h3>
          <Stepper steps={statusSteps[requestList[0].status] || statusSteps["Clock"]} />
        </div>
      )}

      {/* Maintenance History & Asset Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History Table */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-4 border-b border-outline-variant">
            <h2 className="font-headline-md text-headline-md">Maintenance History</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-outline">Showing: last 30 days</span>
              <button className="text-primary hover:underline font-label-md" onClick={() => addToast({ message: "CSV exported", type: "success" })}>Export CSV</button>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-surface-container-lowest border-b border-outline-variant">
              <tr>
                <th className="px-4 py-3 text-left font-label-md text-on-surface-variant">Asset ID</th>
                <th className="px-4 py-3 text-left font-label-md text-on-surface-variant">Issue Description</th>
                <th className="px-4 py-3 text-left font-label-md text-on-surface-variant">Technician</th>
                <th className="px-4 py-3 text-left font-label-md text-on-surface-variant">Date</th>
                <th className="px-4 py-3 text-left font-label-md text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceHistory.map((h) => (
                <tr key={h.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-mono text-body-md">{h.assetId}</td>
                  <td className="px-4 py-3 text-body-md">{h.issue}</td>
                  <td className="px-4 py-3 text-body-md">{h.technician}</td>
                  <td className="px-4 py-3 text-body-md">{h.date}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold text-on-surface inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-available" />
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Asset Spotlight */}
        <div className="card p-6">
          <h2 className="font-headline-md text-headline-md mb-4">Asset Spotlight</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-headline-md text-on-surface">Node-7 High Density</h3>
              <p className="text-xs font-mono text-outline">SN: ASSET-77-VX-2023</p>
            </div>
            <div className="p-3 bg-tertiary-container/10 rounded-lg flex items-start gap-3">
              <Lock className="w-5 h-5 text-tertiary flex-shrink-0" />
              <div>
                <p className="font-label-md font-bold">APPROVAL MANDATORY</p>
                <p className="text-xs text-on-surface-variant">Asset state is locked. Manager approval required before setting status to &apos;In Service&apos;.</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
              <span className="text-outline">Health Gauge</span>
              <span className="text-on-surface font-bold">64%</span>
            </div>
            <div className="flex gap-3">
              <button className="btn-primary flex-1 justify-center" onClick={() => addToast({ message: "Fix approved", type: "success" })}>
                Approve Fix
              </button>
              <button className="btn-secondary flex-1 justify-center" onClick={() => addToast({ message: "Fix rejected", type: "info" })}>
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Raise Request Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Raise Maintenance Request"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>Submit Request</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label-field">Select Asset</label>
            <select className="input-field" value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })}>
              <option value="">Choose an asset...</option>
              <option>MacBook Pro M2 Max</option>
              <option>Server Rack B2-4</option>
              <option>Industrial CNC Unit</option>
              <option>HVAC System Central</option>
              <option>Zebra ZT411 Printer</option>
            </select>
            {errors.asset && <p className="text-label-md text-error mt-1">{errors.asset}</p>}
          </div>
          <div>
            <label className="label-field">Priority Level</label>
            <div className="flex gap-2">
              {(["Low", "Medium", "High"] as MaintenancePriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, priority: p })}
                  className={cn("flex-1 py-2 px-3 rounded-md text-body-md transition-colors border",
                    form.priority === p ? "bg-primary text-white border-primary" : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low")}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-field">Issue Details</label>
            <textarea
              className="input-field min-h-[100px] resize-y"
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
              placeholder="Describe the issue in detail..."
            />
            {errors.issue && <p className="text-label-md text-error mt-1">{errors.issue}</p>}
          </div>
          <div>
            <label className="label-field">Evidence/Photos</label>
            <div className="border-2 border-dashed border-outline-variant rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <CloudUpload className="w-8 h-8 text-outline mx-auto mb-2" />
              <p className="text-body-md text-on-surface-variant">Drag and drop or <span className="text-primary font-bold">browse</span></p>
              <p className="text-[10px] text-outline mt-1">JPG, PNG or WEBP (Max 10MB)</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
