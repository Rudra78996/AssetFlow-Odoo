"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { useApp } from "@/contexts/AppContext";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Plus, Filter, TrendingUp, Timer, AlertTriangle, XCircle,
  CalendarCheck, DoorOpen, Car, Microscope, Clock,
} from "lucide-react";

const resourceIcons: Record<string, React.ReactNode> = {
  meeting_room: <DoorOpen className="w-5 h-5" />,
  directions_car: <Car className="w-5 h-5" />,
  precision_manufacturing: <Microscope className="w-5 h-5" />,
};

const timelineSlots = [
  { time: "09:00", label: "Dev Standup", status: "Completed", color: "bg-available/20 text-available" },
  { time: "10:00", label: "Project Sync", status: "Ongoing", color: "bg-secondary-container text-secondary" },
  { time: "11:00", label: "Sample Analysis", status: "Ongoing", color: "bg-primary text-white" },
  { time: "13:30", label: "LOGISTICS OVERLAP", status: "Conflict", color: "bg-error/20 text-error" },
  { time: "14:00", label: "Standard Route 22", status: "Upcoming", color: "bg-surface-container-high text-on-surface-variant" },
  { time: "17:00", label: "Morning Yoga", status: "Upcoming", color: "bg-primary/10 text-primary" },
  { time: "18:00", label: "Evening Workshop", status: "Upcoming", color: "bg-secondary/10 text-secondary" },
];

export default function BookingsPage() {
  const { addToast } = useApp();
  const [bookingList, setBookingList] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"Today" | "Week" | "Month">("Today");
  const [form, setForm] = useState({ resource: "", startTime: "", endTime: "", note: "" });
  const [overlap, setOverlap] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const bookingsRes = await fetch("/api/bookings", { credentials: "include" });
        const bookingsData = await bookingsRes.json();
        if (bookingsRes.ok && bookingsData.success) {
          setBookingList(bookingsData.data);
        }

        const assetsRes = await fetch("/api/assets", { credentials: "include" });
        const assetsData = await assetsRes.json();
        if (assetsRes.ok && assetsData.success) {
          setAssets(assetsData.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleBooking = async () => {
    if (!form.resource || !form.startTime || !form.endTime) {
      addToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }
    try {
      const body = {
        assetId: form.resource,
        purpose: form.note || "Booking",
        date: new Date().toISOString().split("T")[0],
        startTime: form.startTime,
        endTime: form.endTime,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ message: "Booking confirmed successfully", type: "success" });
        const bookingsRes = await fetch("/api/bookings", { credentials: "include" });
        const bookingsData = await bookingsRes.json();
        if (bookingsRes.ok && bookingsData.success) {
          setBookingList(bookingsData.data);
        }
        setForm({ resource: "", startTime: "", endTime: "", note: "" });
        setOverlap(false);
      } else {
        addToast({ message: data.error?.message ?? "Failed to book resource", type: "error" });
      }
    } catch (err) {
      addToast({ message: "Network error creating booking", type: "error" });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ message: "Booking cancelled successfully", type: "success" });
        const bookingsRes = await fetch("/api/bookings", { credentials: "include" });
        const bookingsData = await bookingsRes.json();
        if (bookingsRes.ok && bookingsData.success) {
          setBookingList(bookingsData.data);
        }
      } else {
        addToast({ message: data.error?.message ?? "Failed to cancel booking", type: "error" });
      }
    } catch (err) {
      addToast({ message: "Network error cancelling booking", type: "error" });
    }
  };

  const handleReschedule = (id: string) => {
    addToast({ message: "Reschedule form opened", type: "info" });
  };

  const stats = [
    { label: "Total Bookings", value: bookingList.length.toString(), icon: <TrendingUp className="w-4 h-4" />, color: "text-primary" },
    { label: "Active Now", value: bookingList.filter(b => b.status === "ONGOING" || b.status === "Ongoing").length.toString(), icon: <Timer className="w-4 h-4" />, color: "text-tertiary" },
    { label: "Clock Approval", value: bookingList.filter(b => b.status === "UPCOMING" || b.status === "Upcoming").length.toString(), icon: <Clock className="w-4 h-4" />, color: "text-on-surface" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Resource Booking</h1>
          <p className="text-on-surface-variant font-body-md">Manage and schedule high-value enterprise assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary"><Filter className="w-4 h-4" /> Filter</button>
          <button className="btn-primary" onClick={() => addToast({ message: "Booking form opened", type: "info" })}>
            <Plus className="w-4 h-4" /> Book New Slot
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-on-surface-variant text-xs font-bold">{s.label}</p>
              <span className={s.color}>{s.icon}</span>
            </div>
            <p className={cn("text-display font-display", s.color === "text-primary" ? "text-primary" : s.color === "text-tertiary" ? "text-tertiary" : "text-on-surface")}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Overlap AlertTriangle */}
      <div className="card p-4 bg-error-container/20 border-error/30 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-error" />
        </div>
        <div>
          <p className="font-bold text-xs uppercase text-error">Overlap Detected</p>
          <p className="text-xs text-on-error-container">Conflict: Meeting Room B has a schedule overlap at 14:00 - 15:30 today.</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline View */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-headline-md">Timeline View</h3>
            <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-1">
              {(["Today", "Week", "Month"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn("px-4 py-1 text-xs rounded-md transition-colors", view === v ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface")}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {timelineSlots.map((slot, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-outline w-12">{slot.time}</span>
                <div className={cn("flex-1 px-4 py-2.5 rounded-lg text-[10px] font-bold", slot.color)}>
                  {slot.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slot Picker */}
        <div className="card p-6">
          <h3 className="font-headline-md text-headline-md mb-4">Slot Picker</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold block mb-1">Resource</label>
              <select className="input-field" value={form.resource} onChange={(e) => setForm({ ...form, resource: e.target.value })}>
                <option value="">Select resource...</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Start Time</label>
                <input type="time" className="input-field" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">End Time</label>
                <input type="time" className="input-field" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Booking Note</label>
              <input className="input-field" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Purpose of booking" />
            </div>

            {overlap && (
              <div className="p-3 bg-error-container/20 border border-error/30 rounded-lg flex items-start gap-3">
                <XCircle className="w-5 h-5 text-error flex-shrink-0" />
                <div>
                  <p className="text-on-error-container text-xs font-bold">Booking Rejected: Conflict Detected</p>
                  <p className="text-[11px] text-on-error-container mt-1">This slot overlaps with &quot;Logistics Overlap&quot; by User J. Miller (13:30 - 15:45). Please choose a different time.</p>
                </div>
              </div>
            )}

            <button className="btn-primary w-full justify-center py-3" onClick={handleBooking}>
              Confirm Booking
            </button>
          </div>
        </div>
      </div>

      {/* Status Key & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h4 className="text-xs font-bold text-on-surface-variant mb-4">Status Key</h4>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="Upcoming" />
            <StatusBadge status="Ongoing" />
            <StatusBadge status="Completed" />
            <StatusBadge status="Cancelled" />
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="font-headline-md text-headline-md mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {bookingList.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center gap-4 p-3 rounded-lg border border-outline-variant hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                  {resourceIcons[b.resourceIcon] || <CalendarCheck className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-bold">{b.resourceName}</p>
                  <p className="text-xs text-on-surface-variant">{b.bookedBy} • {b.startTime} - {b.endTime}</p>
                </div>
                <StatusBadge status={b.status} />
                {b.status === "Upcoming" && (
                  <div className="flex gap-1">
                    <button className="text-xs text-primary hover:underline" onClick={() => handleReschedule(b.id)}>Reschedule</button>
                    <button className="text-xs text-error hover:underline" onClick={() => handleCancel(b.id)}>Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
