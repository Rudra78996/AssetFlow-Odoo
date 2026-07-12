import type {
  AssetStatus,
  AssetCondition,
  BookingStatus,
  MaintenanceStatus,
  MaintenancePriority,
  AuditAssetStatus,
  AuditCycleStatus,
  Role,
} from "@prisma/client";

// The frontend renders human labels ("Under Maintenance") while the DB stores
// enums (UNDER_MAINTENANCE). These maps are the single source of truth for the
// translation in both directions, so the API speaks the frontend's language
// without the frontend needing to change.

export const AssetStatusLabel: Record<AssetStatus, string> = {
  AVAILABLE: "Available",
  ALLOCATED: "Allocated",
  RESERVED: "Reserved",
  UNDER_MAINTENANCE: "Under Maintenance",
  LOST: "Lost",
  RETIRED: "Retired",
  DISPOSED: "Disposed",
};

export const AssetConditionLabel: Record<AssetCondition, string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

export const BookingStatusLabel: Record<BookingStatus, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const MaintenanceStatusLabel: Record<MaintenanceStatus, string> = {
  OPEN: "Clock", // frontend labels a fresh/open request with its clock indicator
  APPROVED: "Approved",
  REJECTED: "Rejected",
  TECHNICIAN_ASSIGNED: "Technician Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

export const MaintenancePriorityLabel: Record<MaintenancePriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const AuditAssetStatusLabel: Record<AuditAssetStatus, string> = {
  PENDING: "pending",
  VERIFIED: "verified",
  MISSING: "missing",
  DAMAGED: "damaged",
};

export const AuditCycleStatusLabel: Record<AuditCycleStatus, string> = {
  ACTIVE: "active",
  CLOSED: "closed",
};

export const RoleLabel: Record<Role, string> = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
};

// Reverse helper for query filters that arrive as frontend labels.
export function invert<T extends string>(map: Record<T, string>): Record<string, T> {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])) as Record<string, T>;
}
