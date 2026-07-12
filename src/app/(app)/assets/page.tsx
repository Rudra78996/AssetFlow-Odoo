"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { Tabs } from "@/components/Tabs";
import { useApp } from "@/contexts/AppContext";
import type { Asset } from "@/lib/types";
import { cn, generateAssetTag, formatCurrency } from "@/lib/utils";
import {
  Plus, Search, Filter, Download, QrCode, MoreVertical,
  Laptop, Armchair, Printer, Camera, Monitor, Network, X,
  BookOpen, Wrench, CheckCircle2, Clock, Edit, Sparkles,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  Computing: <Laptop className="w-5 h-5" />,
  Furniture: <Armchair className="w-5 h-5" />,
  Warehousing: <Printer className="w-5 h-5" />,
  "Media Equipment": <Camera className="w-5 h-5" />,
  Peripherals: <Monitor className="w-5 h-5" />,
  Networking: <Network className="w-5 h-5" />,
};

const conditionColors: Record<string, string> = {
  Excellent: "bg-available/10 text-available",
  Good: "bg-primary/10 text-primary",
  Fair: "bg-reserved/10 text-reserved",
  Poor: "bg-error/10 text-error",
};

export default function AssetsPage() {
  const { addToast } = useApp();
  const router = useRouter();
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [drawerTab, setDrawerTab] = useState("allocation");
  const [form, setForm] = useState({
    name: "", category: "", serialNumber: "", acquisitionDate: "",
    acquisitionCost: "", condition: "Excellent", location: "", shared: false, bookable: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const catRes = await fetch("/api/categories", { credentials: "include" });
        const catData = await catRes.json();
        if (catRes.ok && catData.success) {
          setCategories(catData.data);
          if (catData.data.length > 0) {
            setForm((prev) => ({ ...prev, category: catData.data[0].id }));
          }
        }
        const assetsRes = await fetch("/api/assets", { credentials: "include" });
        const assetsData = await assetsRes.json();
        if (assetsRes.ok && assetsData.success) {
          setAssetList(assetsData.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleRowClick = async (row: Asset) => {
    setSelectedAsset(row as any);
    setDrawerTab("allocation");
    try {
      const res = await fetch(`/api/assets/${row.id}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedAsset(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Esc key handler for Drawer
  useEffect(() => {
    if (!selectedAsset) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedAsset(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAsset]);

  // Focus trap, autofocus, and restore focus on drawer close
  useEffect(() => {
    if (selectedAsset) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      const focusable = Array.from(
        drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || []
      ) as HTMLElement[];

      if (focusable.length > 0) {
        focusable[0].focus();
      }

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        const currentFocusable = Array.from(
          drawerRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) || []
        ) as HTMLElement[];

        if (currentFocusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = currentFocusable[0];
        const last = currentFocusable[currentFocusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      window.addEventListener("keydown", handleTabKey);
      return () => {
        window.removeEventListener("keydown", handleTabKey);
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [selectedAsset]);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      addToast({ message: "Invalid file type. Only JPG, PNG, and PDF are allowed.", type: "error" });
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      addToast({ message: "File exceeds 10MB limit.", type: "error" });
      return;
    }
    setUploadedFile(file);
    addToast({ message: `File "${file.name}" uploaded successfully`, type: "success" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRegister = async () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Asset name is required";
    if (!form.serialNumber) e.serialNumber = "Serial number is required";
    if (!form.location) e.location = "Location is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      const body = {
        name: form.name,
        categoryId: form.category,
        serialNumber: form.serialNumber,
        acquisitionDate: form.acquisitionDate || new Date().toISOString().split("T")[0],
        acquisitionCost: parseInt(form.acquisitionCost) || 0,
        condition: form.condition.toUpperCase(),
        location: form.location,
        shared: form.shared,
        bookable: form.bookable,
      };

      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ message: `Asset registered successfully`, type: "success" });
        const assetsRes = await fetch("/api/assets", { credentials: "include" });
        const assetsData = await assetsRes.json();
        if (assetsRes.ok && assetsData.success) {
          setAssetList(assetsData.data);
        }
        setShowRegister(false);
        setForm({
          name: "",
          category: categories[0]?.id || "",
          serialNumber: "",
          acquisitionDate: "",
          acquisitionCost: "",
          condition: "Excellent",
          location: "",
          shared: false,
          bookable: false,
        });
        setUploadedFile(null);
      } else {
        addToast({ message: data.error?.message ?? "Failed to register asset", type: "error" });
      }
    } catch (err) {
      addToast({ message: "Network error registering asset", type: "error" });
    }
  };

  const columns: Column<Asset>[] = [
    {
      key: "name", label: "Asset Details", sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant">
            {categoryIcons[row.category] || <Laptop className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-body-md font-semibold text-on-surface">{row.name}</p>
            <p className="text-xs text-on-surface-variant font-mono">SN: {row.serialNumber}</p>
          </div>
        </div>
      ),
    },
    { key: "category", label: "Category" },
    {
      key: "condition", label: "Condition",
      render: (row) => <span className={cn("text-xs px-2 py-1 rounded", conditionColors[row.condition])}>{row.condition}</span>,
    },
    {
      key: "status", label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions", label: "Actions",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setSelectedAsset(row); setDrawerTab("allocation"); }} className="p-2 hover:bg-surface-container rounded-full">
            <MoreVertical className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    { label: "Total Assets", value: assetList.length, icon: null },
    { label: "Available", value: assetList.filter(a => a.status === "Available").length, icon: null },
    { label: "Allocated", value: assetList.filter(a => a.status === "Allocated").length, icon: null },
    { label: "Maintenance", value: assetList.filter(a => a.status === "Under Maintenance").length, icon: null },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
        <span>Resources</span>
        <span>›</span>
        <span className="text-primary">Directory</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-display font-display">Asset Directory</h1>
        <button className="btn-primary" onClick={() => setShowRegister(true)}>
          <Plus className="w-4 h-4" /> Register Asset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-on-surface-variant text-label-md mb-1">{s.label}</p>
            <p className="text-headline-lg font-headline-lg">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={assetList}
          searchable
          searchPlaceholder="Search assets..."
          searchKeys={["name", "serialNumber", "tag", "category", "location"]}
          pagination
          pageSize={5}
          onRowClick={handleRowClick}
          loading={loading}
        />
      </div>

      {/* Detail Drawer */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setSelectedAsset(null)} />
          <div ref={drawerRef} className="relative w-full max-w-md bg-surface-container-lowest h-full overflow-y-auto shadow-ambient">
            <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-on-surface-variant">{selectedAsset.tag}</p>
                  <h3 className="text-headline-md font-headline-md mt-1">{selectedAsset.name}</h3>
                </div>
                <button onClick={() => setSelectedAsset(null)} className="p-2 hover:bg-surface-container rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[10px] uppercase text-on-surface-variant">Current Status</p>
                  <div className="mt-1"><StatusBadge status={selectedAsset.status} /></div>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-on-surface-variant">Location</p>
                  <p className="text-body-md mt-1">{selectedAsset.location}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <Tabs
                tabs={[
                  { id: "allocation", label: "Allocation History" },
                  { id: "maintenance", label: "Maintenance" },
                ]}
                activeTab={drawerTab}
                onChange={setDrawerTab}
                className="mb-4"
              />

              {drawerTab === "allocation" && (
                <div className="space-y-4">
                  {selectedAsset.allocationHistory.map((h) => (
                    <div key={h.id} className="border-l-2 border-primary/30 pl-4 relative">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary" />
                      <p className="text-body-md font-bold">{h.type === "returned" ? `Returned by ${h.person}` : h.type === "allocated" ? `Allocated to ${h.person}` : "Initial Procurement"}</p>
                      <p className="text-xs text-on-surface-variant mb-2">{h.date}</p>
                      <p className="text-body-md text-on-surface-variant bg-surface-container-low p-3 rounded-lg">{h.notes}</p>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === "maintenance" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-tertiary-container/10 rounded-lg">
                    <Clock className="w-5 h-5 text-tertiary" />
                    <div>
                      <p className="font-bold">Next Service Due</p>
                      <p className="text-body-md text-tertiary">Scheduled hardware diagnostics and cleaning on Dec 15, 2023.</p>
                    </div>
                  </div>
                  {selectedAsset.maintenanceHistory.map((m) => (
                    <div key={m.id} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-available flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-body-md font-medium">{m.type}</p>
                        <p className="text-xs text-on-surface-variant">{m.date}</p>
                      </div>
                    </div>
                  ))}
                  {selectedAsset.maintenanceHistory.length === 0 && (
                    <p className="text-on-surface-variant text-body-md text-center py-8">No maintenance history</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-6 border-t border-outline-variant">
                <button
                  className="btn-primary flex-1 justify-center"
                  onClick={() => {
                    setSelectedAsset(null);
                    router.push(`/allocations?assetId=${selectedAsset.id}`);
                  }}
                >
                  Allocate Asset
                </button>
                <button
                  className="p-3 border border-outline-variant rounded-md hover:bg-surface-container-low"
                  onClick={() => {
                    // TODO: Implement Edit Modal to capture name, condition, location, serial number.
                    // Expected API Endpoint: PATCH /api/assets/[id]
                    // Payload: { name?: string, condition?: AssetCondition, location?: string, serialNumber?: string }
                    addToast({
                      message: "Edit modal placeholder. The real API expects PATCH /api/assets/" + selectedAsset.id,
                      type: "info"
                    });
                  }}
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      <Modal
        open={showRegister}
        onClose={() => setShowRegister(false)}
        title="Register New Asset"
        size="lg"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setShowRegister(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleRegister}>Complete Registration</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Asset Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. MacBook Pro M3" />
              {errors.name && <p className="text-label-md text-error mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="label-field">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Serial Number</label>
              <input className="input-field" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} placeholder="e.g. C02DW1X7MD6R" />
              {errors.serialNumber && <p className="text-label-md text-error mt-1">{errors.serialNumber}</p>}
            </div>
            <div>
              <label className="label-field">Asset Tag (Auto-gen)</label>
              <div className="relative">
                <input className="input-field bg-surface-container-low pr-9" value={generateAssetTag(assetList.map(a => a.tag))} readOnly />
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Acquisition Date</label>
              <input type="date" className="input-field" value={form.acquisitionDate} onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Acquisition Cost (USD)</label>
              <input type="number" className="input-field" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Condition</label>
              <select className="input-field" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
              </select>
            </div>
            <div>
              <label className="label-field">Primary Location</label>
              <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. HQ - Floor 4" />
              {errors.location && <p className="text-label-md text-error mt-1">{errors.location}</p>}
            </div>
          </div>
          <div>
            <label className="label-field">File Upload</label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
              {uploadedFile ? (
                <div>
                  <p className="text-body-md font-bold text-primary">Selected File: {uploadedFile.name}</p>
                  <p className="text-[11px] text-outline">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="mt-2 text-xs text-error font-bold hover:underline"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-body-md text-on-surface-variant">Drag and drop or <span className="text-primary font-bold">browse</span></p>
                  <p className="text-[10px] text-outline mt-1">JPG, PNG, PDF (Max 10MB)</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <div>
                <p className="text-body-md font-bold">Shared/Bookable Asset</p>
                <p className="text-xs text-on-surface-variant">Allow employees to reserve this asset via the portal</p>
              </div>
            </div>
            <button
              onClick={() => setForm({ ...form, bookable: !form.bookable })}
              className={cn("w-12 h-6 rounded-full transition-colors relative", form.bookable ? "bg-primary" : "bg-outline-variant")}
            >
              <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform", form.bookable ? "translate-x-6" : "translate-x-0.5")} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
