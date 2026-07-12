"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Shield, Bell, Palette, Globe, Eye, EyeOff, CheckCircle2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "profile" | "security" | "notifications" | "appearance";

export default function SettingsPage() {
  const { user, addToast, setUser } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    department: user?.department ?? "",
    jobTitle: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    overdueAlerts: true,
    maintenanceReminders: true,
    allocationUpdates: true,
    auditNotifications: true,
    systemAnnouncements: false,
    emailDigest: true,
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    density: "comfortable",
    language: "en",
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
  ];

  const handleSaveProfile = async () => {
    setSaving(true);
    // In a full implementation this would call PATCH /api/auth/me or a profile update endpoint
    await new Promise((r) => setTimeout(r, 800));
    setUser({ ...user!, name: profileForm.name, email: profileForm.email, department: profileForm.department });
    addToast({ message: "Profile updated successfully", type: "success" });
    setSaving(false);
  };

  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({ message: "New passwords do not match", type: "error" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      addToast({ message: "Password must be at least 8 characters", type: "error" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    addToast({ message: "Password changed successfully", type: "success" });
    setSaving(false);
  };

  const handleSignOutAll = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.replace("/login");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display font-display text-on-surface">Settings</h1>
        <p className="text-body-lg text-on-surface-variant mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab list */}
        <nav className="flex md:flex-col gap-1 md:w-48 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-md text-body-md transition-colors text-left",
                activeTab === tab.id
                  ? "bg-primary/5 text-primary font-semibold border-l-[3px] border-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Profile Information</h2>
                <p className="text-body-md text-on-surface-variant">Update your personal details.</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold text-2xl">
                  {user?.name?.split(" ").map((n) => n[0]).join("") ?? "?"}
                </div>
                <div>
                  <p className="font-body-md font-semibold text-on-surface">{user?.name}</p>
                  <span className="text-label-md text-outline capitalize">{user?.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="input-field pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-field">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="input-field pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-field">Department</label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Engineering"
                  />
                </div>
                <div>
                  <label className="label-field">Job Title</label>
                  <input
                    type="text"
                    value={profileForm.jobTitle}
                    onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Senior Engineer"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="card p-6 space-y-5">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Change Password</h2>
                  <p className="text-body-md text-on-surface-variant">Use a strong unique password.</p>
                </div>

                <div>
                  <label className="label-field">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="input-field pl-9 pr-9"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label-field">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="input-field pl-9 pr-9"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label-field">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="input-field pl-9"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSavePassword} disabled={saving} className="btn-primary disabled:opacity-60">
                    <Lock className="w-4 h-4" />
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-secondary" />
                      <h3 className="font-headline-md text-headline-md text-on-surface">Active Sessions</h3>
                    </div>
                    <p className="text-body-md text-on-surface-variant">
                      Sign out of all other sessions if you suspect unauthorized access.
                    </p>
                  </div>
                  <button
                    onClick={handleSignOutAll}
                    className="btn-secondary text-error border-error/30 hover:bg-error/5 whitespace-nowrap"
                  >
                    Sign Out Everywhere
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Notification Preferences</h2>
                <p className="text-body-md text-on-surface-variant">Choose which alerts you want to receive.</p>
              </div>
              <div className="space-y-4">
                {[
                  { key: "overdueAlerts", label: "Overdue Return Alerts", desc: "Get notified when assets are overdue" },
                  { key: "maintenanceReminders", label: "Maintenance Reminders", desc: "Upcoming maintenance schedule alerts" },
                  { key: "allocationUpdates", label: "Allocation Updates", desc: "When assets are assigned or returned" },
                  { key: "auditNotifications", label: "Audit Notifications", desc: "Audit cycle updates and discrepancies" },
                  { key: "systemAnnouncements", label: "System Announcements", desc: "Platform updates and announcements" },
                  { key: "emailDigest", label: "Weekly Email Digest", desc: "Summary of activity sent every Monday" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg border border-outline-variant">
                    <div>
                      <p className="font-body-md font-semibold text-on-surface">{label}</p>
                      <p className="text-label-md text-on-surface-variant mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications((p) => ({ ...p, [key]: !p[key as keyof typeof notifications] }))}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        notifications[key as keyof typeof notifications] ? "bg-primary" : "bg-outline-variant"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                          notifications[key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => addToast({ message: "Notification preferences saved", type: "success" })}
                  className="btn-primary"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Appearance</h2>
                <p className="text-body-md text-on-surface-variant">Customize how AssetFlow looks for you.</p>
              </div>

              <div>
                <label className="label-field mb-3 block">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {["light", "dark", "system"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setAppearance({ ...appearance, theme: t })}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-colors capitalize text-body-md font-medium",
                        appearance.theme === t
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-outline-variant text-on-surface-variant hover:border-primary/30"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-field mb-3 block">Display Density</label>
                <div className="grid grid-cols-3 gap-3">
                  {["compact", "comfortable", "spacious"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setAppearance({ ...appearance, density: d })}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-colors capitalize text-body-md font-medium",
                        appearance.density === d
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-outline-variant text-on-surface-variant hover:border-primary/30"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-field">Language</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <select
                    value={appearance.language}
                    onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                    className="input-field pl-9 appearance-none"
                  >
                    <option value="en">English (US)</option>
                    <option value="en-gb">English (UK)</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => addToast({ message: "Appearance settings saved", type: "success" })}
                  className="btn-primary"
                >
                  <Save className="w-4 h-4" /> Save Appearance
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
