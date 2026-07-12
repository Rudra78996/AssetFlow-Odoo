"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ToastContainer } from "@/components/Toast";
import { AppProvider } from "@/contexts/AppContext";
import { useApp } from "@/contexts/AppContext";
import { Package2, Shield } from "lucide-react";

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthLoading, user, setUser, addToast } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleRoleSwitch = async (newRole: "MANAGER" | "ADMIN") => {
    try {
      const res = await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.data);
        addToast({ message: `Switched to ${newRole} role`, type: "success" });
        window.location.reload();
      } else {
        addToast({ message: data.error?.message ?? "Failed to switch role", type: "error" });
      }
    } catch (err) {
      addToast({ message: "Error switching role", type: "error" });
    }
  };

  // Show loading spinner while checking auth
  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Package2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-body-md">
            <svg
              className="animate-spin w-4 h-4 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Verifying session...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar currentPath={pathname} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-on-surface/40" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar currentPath={pathname} onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Footer with role-switching options */}
        <footer className="bg-surface-container-lowest border-t border-outline-variant px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface-variant text-label-md">
              <Shield className="w-4 h-4" />
              <span>Logged in as <span className="font-bold text-on-surface">{user?.role}</span></span>
            </div>
            <div className="flex items-center gap-2">
              {user?.role !== "manager" && (
                <button
                  onClick={() => handleRoleSwitch("MANAGER")}
                  className="text-label-md text-primary hover:underline font-bold"
                >
                  Login as Manager
                </button>
              )}
              {user?.role !== "admin" && (
                <>
                  <span className="text-outline">|</span>
                  <button
                    onClick={() => handleRoleSwitch("ADMIN")}
                    className="text-label-md text-primary hover:underline font-bold"
                  >
                    Login as Admin
                  </button>
                </>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function AppShellClient({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthenticatedShell>{children}</AuthenticatedShell>
      <ToastContainer />
    </AppProvider>
  );
}
