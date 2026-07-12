"use client";

import { useState } from "react";
import { Tabs } from "@/components/Tabs";
import { Modal } from "@/components/Modal";
import { DataTable, type Column } from "@/components/DataTable";
import { useApp } from "@/contexts/AppContext";
import { departments, assetCategories, employees } from "@/lib/mockData";
import type { Department, Employee } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Building2, Tag, UserCircle, Plus, ChevronRight, GripVertical,
  Download, Filter, Search, ArrowDownRight, ShieldCheck,
} from "lucide-react";

export default function OrganizationSetupPage() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState("departments");
  const [deptList, setDeptList] = useState<Department[]>(departments);
  const [employeeList, setEmployeeList] = useState<Employee[]>(employees);
  const [showAddDept, setShowAddDept] = useState(false);
  const [showPromote, setShowPromote] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState<Employee | null>(null);
  const [newDept, setNewDept] = useState({ name: "", hierarchy: "", deptHead: "" });

  const tabs = [
    { id: "departments", label: "Department Management", icon: <Building2 className="w-4 h-4" /> },
    { id: "categories", label: "Asset Category Management", icon: <Tag className="w-4 h-4" /> },
    { id: "employees", label: "Employee Directory", icon: <UserCircle className="w-4 h-4" /> },
  ];

  const handleAddDept = () => {
    if (!newDept.name) { addToast({ message: "Department name is required", type: "error" }); return; }
    const dept: Department = {
      id: `d${Date.now()}`,
      name: newDept.name,
      hierarchy: newDept.hierarchy || "Core → New",
      deptHead: newDept.deptHead || "Unassigned",
      staffCount: 0,
      status: "Active",
    };
    setDeptList([...deptList, dept]);
    setNewDept({ name: "", hierarchy: "", deptHead: "" });
    setShowAddDept(false);
    addToast({ message: "Department created successfully", type: "success" });
  };

  const handlePromote = () => {
    if (!promoteTarget) return;
    setEmployeeList(employeeList.map(e => e.id === promoteTarget.id ? { ...e, role: "Department Manager" } : e));
    setShowPromote(false);
    setPromoteTarget(null);
    addToast({ message: `${promoteTarget.name} promoted to Department Manager`, type: "success" });
  };

  const deptColumns: Column<Department>[] = [
    {
      key: "name", label: "Department Name", sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.parentId && <ArrowDownRight className="w-4 h-4 text-outline" />}
          <span className="font-body-md font-semibold text-on-surface">{row.name}</span>
        </div>
      ),
    },
    {
      key: "hierarchy", label: "Hierarchy",
      render: (row) => <span className="text-xs bg-secondary-container/50 text-secondary px-2 py-1 rounded">{row.hierarchy}</span>,
    },
    { key: "deptHead", label: "Dept Head" },
    { key: "staffCount", label: "Staff Count", render: (row) => <span className="font-mono text-body-md">{row.staffCount}</span> },
    {
      key: "status", label: "Status",
      render: (row) => (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-md font-label-md",
          row.status === "Active" ? "bg-available/10 text-available" : "bg-outline/10 text-outline")}>
          <span className={cn("w-1.5 h-1.5 rounded-full", row.status === "Active" ? "bg-available" : "bg-outline")} />
          {row.status}
        </span>
      ),
    },
  ];

  const empColumns: Column<Employee>[] = [
    {
      key: "name", label: "Employee", sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-semibold text-body-md">
            {row.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className="font-bold text-on-surface">{row.name}</p>
            <p className="text-xs text-on-surface-variant">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", label: "Role" },
    {
      key: "department", label: "Department",
      render: (row) => <span className="px-2 py-1 bg-surface-container-high rounded text-body-md">{row.department}</span>,
    },
    {
      key: "actions", label: "Actions",
      render: (row) => (
        <div className="text-right">
          <button
            onClick={() => { setPromoteTarget(row); setShowPromote(true); }}
            className="text-primary font-bold text-xs hover:underline"
          >
            PROMOTE TO MANAGER
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display font-display text-on-surface">Organization Setup</h1>
          <p className="text-on-surface-variant text-body-lg mt-1">Configure structural hierarchy, asset classifications, and global permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => addToast({ message: "Config exported", type: "success" })}>
            <Download className="w-4 h-4" /> Export Config
          </button>
          {activeTab === "departments" && (
            <button className="btn-primary" onClick={() => setShowAddDept(true)}>
              <Plus className="w-4 h-4" /> New Department
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-on-surface-variant font-label-md uppercase text-label-md">Active Depts</p>
          <p className="text-3xl font-bold mt-1">{deptList.filter(d => d.status === "Active").length}</p>
          <p className="text-xs text-available font-bold mt-1">+2 this month</p>
        </div>
        <div className="card p-4">
          <p className="text-on-surface-variant font-label-md uppercase text-label-md">Total Assets</p>
          <p className="text-3xl font-bold mt-1">1,284</p>
          <p className="text-xs text-outline mt-1">Across {assetCategories.length} categories</p>
        </div>
        <div className="card p-4">
          <p className="text-on-surface-variant font-label-md uppercase text-label-md">System Health</p>
          <p className="text-lg font-semibold mt-1">99.8%</p>
          <p className="text-xs text-outline mt-1">Uptime</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "departments" && (
          <DataTable
            columns={deptColumns}
            data={deptList}
            searchable
            searchPlaceholder="Search departments..."
            searchKeys={["name", "deptHead", "hierarchy"]}
          />
        )}

        {activeTab === "categories" && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-headline-md text-headline-md">Category List</h4>
                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline" onClick={() => addToast({ message: "Add category form opened", type: "info" })}>
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>
              <div className="space-y-3">
                {assetCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-4 p-4 rounded-lg border border-outline-variant hover:border-primary/20 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-on-surface">{cat.name}</p>
                      <p className="text-xs text-on-surface-variant">{cat.customFields.length} custom fields defined</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-outline" />
                  </div>
                ))}
              </div>
            </div>

            {/* Field Configurator */}
            <div>
              <h4 className="font-headline-md text-headline-md mb-4">Field Configurator: Workstations</h4>
              <div className="space-y-2">
                {assetCategories[0].customFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant">
                    <GripVertical className="w-4 h-4 text-outline cursor-grab" />
                    <span className="text-body-md font-medium flex-1">{field.name}</span>
                    <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded",
                      field.required ? "bg-error/10 text-error" : "bg-surface-container-high text-outline")}>
                      {field.type}{field.required ? " (Required)" : ""}
                    </span>
                  </div>
                ))}
                <button className="w-full py-3 border-2 border-dashed border-outline-variant rounded-lg text-on-surface-variant hover:border-primary hover:text-primary transition-colors" onClick={() => addToast({ message: "Custom field editor opened", type: "info" })}>
                  + Add Custom Field
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "employees" && (
          <DataTable
            columns={empColumns}
            data={employeeList}
            searchable
            searchPlaceholder="Search employees..."
            searchKeys={["name", "email", "department", "role"]}
            pagination
            pageSize={5}
          />
        )}
      </div>

      {/* Add Department Modal */}
      <Modal
        open={showAddDept}
        onClose={() => setShowAddDept(false)}
        title="New Department"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setShowAddDept(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddDept}>Create Department</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label-field">Department Name</label>
            <input className="input-field" value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} placeholder="e.g. Quality Assurance" />
          </div>
          <div>
            <label className="label-field">Hierarchy Path</label>
            <input className="input-field" value={newDept.hierarchy} onChange={(e) => setNewDept({ ...newDept, hierarchy: e.target.value })} placeholder="e.g. Core → QA" />
          </div>
          <div>
            <label className="label-field">Department Head</label>
            <input className="input-field" value={newDept.deptHead} onChange={(e) => setNewDept({ ...newDept, deptHead: e.target.value })} placeholder="e.g. John Smith" />
          </div>
        </div>
      </Modal>

      {/* Promote Modal */}
      <Modal
        open={showPromote}
        onClose={() => setShowPromote(false)}
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">Confirm Promotion</h3>
          <p className="text-body-lg text-on-surface-variant mb-6">
            You are about to promote <span className="font-bold text-on-surface">{promoteTarget?.name}</span> to <span className="font-bold text-primary">Department Manager</span>. This will grant them budgetary approval rights and team oversight permissions.
          </p>
          <div className="space-y-3">
            <button className="btn-primary w-full justify-center py-3" onClick={handlePromote}>
              AUTHORIZE PROMOTION
            </button>
            <button className="w-full py-3 text-on-surface-variant hover:text-on-surface" onClick={() => setShowPromote(false)}>
              Cancel Action
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
