"use client";

import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import {
  LayoutDashboard,
  Settings2,
  Users,
  ClipboardCheck,
  CalendarCheck,
  Wrench,
  ListChecks,
  BarChart3,
  History,
  HelpCircle,
  Settings,
  Package2,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Org Setup", href: "/organization-setup", icon: <Settings2 className="w-5 h-5" />, roles: ["admin"] },
  { label: "Directory", href: "/assets", icon: <Users className="w-5 h-5" /> },
  { label: "Allocations", href: "/allocations", icon: <ClipboardCheck className="w-5 h-5" /> },
  { label: "Bookings", href: "/bookings", icon: <CalendarCheck className="w-5 h-5" /> },
  { label: "Maintenance", href: "/maintenance", icon: <Wrench className="w-5 h-5" /> },
  { label: "Audits", href: "/audits", icon: <ListChecks className="w-5 h-5" /> },
  { label: "FileWarnings", href: "/reports", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Logs", href: "/activity", icon: <History className="w-5 h-5" /> },
];

const bottomItems: NavItem[] = [
  { label: "Support", href: "#", icon: <HelpCircle className="w-5 h-5" /> },
  { label: "Settings", href: "#", icon: <Settings className="w-5 h-5" />, roles: ["admin"] },
];

interface SidebarProps {
  currentPath: string;
  onNavigate?: (href: string) => void;
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const { user } = useApp();
  const role = user.role;

  const visibleNav = navItems.filter((item) => !item.roles || item.roles.includes(role));
  const visibleBottom = bottomItems.filter((item) => !item.roles || item.roles.includes(role));

  const handleClick = (href: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <aside className="w-sidebar h-full bg-surface-container-lowest border-r border-outline-variant flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-topbar border-b border-outline-variant">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Package2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface leading-none">AssetFlow</h1>
          <p className="text-[10px] text-outline uppercase mt-0.5">Enterprise Resource</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="flex flex-col gap-1">
          {visibleNav.map((item) => {
            const active = currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href));
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleClick(item.href, e)}
                className={cn("nav-item", active && "nav-item-active")}
              >
                {item.icon}
                <span className="font-body-md text-body-md">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Bottom items */}
      <div className="border-t border-outline-variant py-4 px-3">
        <div className="flex flex-col gap-1">
          {visibleBottom.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleClick(item.href, e)}
              className="nav-item"
            >
              {item.icon}
              <span className="font-body-md text-body-md">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
