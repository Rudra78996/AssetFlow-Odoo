"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { Search, Bell, HelpCircle, Menu, ChevronDown } from "lucide-react";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, notifications, unreadCount, markAllRead, markNotificationRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleLabel = user.role === "admin" ? "Super Administrator" : user.role === "manager" ? "Manager" : "Employee";

  return (
    <header className="h-topbar bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4 flex-1">
        {onMenuClick && (
          <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-surface-container rounded-md">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Search assets, people, departments..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-md pl-9 pr-4 py-2 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-surface-container rounded-full hidden sm:block">
          <HelpCircle className="w-5 h-5 text-on-surface-variant" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-surface-container rounded-full relative"
          >
            <Bell className="w-5 h-5 text-on-surface-variant" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-ambient z-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between p-3 border-b border-outline-variant">
                <span className="font-body-md font-semibold">Notifications</span>
                <button onClick={markAllRead} className="text-primary text-label-md font-bold hover:underline">
                  Mark all as read
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-on-surface-variant text-body-md">No notifications</p>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={cn(
                      "p-3 border-b border-outline-variant/50 cursor-pointer hover:bg-surface-container-low",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <p className="font-body-md font-semibold text-on-surface">{n.title}</p>
                    <p className="text-body-md text-on-surface-variant mt-0.5">{n.message}</p>
                    <p className="text-label-md text-outline mt-1">{n.time}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 pr-2 hover:bg-surface-container rounded-full"
          >
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-semibold text-body-md">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-label-md text-label-md text-on-surface leading-none">{user.name}</p>
              <p className="text-[10px] text-outline mt-0.5">{roleLabel}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-outline hidden sm:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-ambient z-50">
              <div className="p-3 border-b border-outline-variant">
                <p className="font-body-md font-semibold text-on-surface">{user.name}</p>
                <p className="text-body-md text-on-surface-variant">{user.email}</p>
                <p className="text-label-md text-outline mt-1">{roleLabel}</p>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-surface-container-low text-body-md">
                  Profile Settings
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-surface-container-low text-body-md">
                  Preferences
                </button>
                <a href="/login" className="block w-full text-left px-3 py-2 rounded-md hover:bg-surface-container-low text-body-md text-error">
                  Sign Out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
