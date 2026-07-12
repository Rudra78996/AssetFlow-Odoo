// Core type definitions for AssetFlow

export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type AssetStatus =
  | "Available"
  | "Allocated"
  | "Reserved"
  | "Under Maintenance"
  | "Lost"
  | "Retired"
  | "Disposed";

export type AssetCondition = "Excellent" | "Good" | "Fair" | "Poor";

export interface Asset {
  id: string;
  tag: string;
  name: string;
  category: string;
  serialNumber: string;
  acquisitionDate: string;
  acquisitionCost: number;
  condition: AssetCondition;
  location: string;
  status: AssetStatus;
  shared: boolean;
  bookable: boolean;
  allocationHistory: AllocationHistoryEntry[];
  maintenanceHistory: MaintenanceHistoryEntry[];
}

export interface AllocationHistoryEntry {
  id: string;
  type: "allocated" | "returned" | "procurement";
  person: string;
  department: string;
  date: string;
  notes: string;
}

export interface MaintenanceHistoryEntry {
  id: string;
  type: string;
  date: string;
  status: "completed" | "upcoming";
}

export interface Department {
  id: string;
  name: string;
  hierarchy: string;
  deptHead: string;
  staffCount: number;
  status: "Active" | "Inactive";
  parentId?: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  customFields: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: "Text" | "Numeric" | "Date" | "Boolean";
  required: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface Allocation {
  id: string;
  assetId: string;
  assetName: string;
  employee: string;
  department: string;
  status: "ACTIVE" | "PENDING" | "OVERDUE" | "RETURNED";
  date: string;
  expectedReturn?: string;
}

export interface TransferStep {
  label: string;
  status: "completed" | "current" | "upcoming";
  detail: string;
}

export interface Booking {
  id: string;
  resourceName: string;
  resourceIcon: string;
  bookedBy: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
  date: string;
}

export type MaintenancePriority = "Low" | "Medium" | "High";

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  assetName: string;
  issue: string;
  priority: MaintenancePriority;
  status: "Clock" | "Approved" | "Rejected" | "Technician Assigned" | "In Progress" | "Resolved";
  technician?: string;
  date: string;
  description: string;
}

export interface AuditAsset {
  id: string;
  name: string;
  tag: string;
  serialNumber: string;
  location: string;
  status: "pending" | "verified" | "missing" | "damaged";
}

export interface AuditDiscrepancy {
  id: string;
  assetName: string;
  issue: string;
  type: "missing" | "damaged";
}

export interface AuditCycle {
  id: string;
  scope: string;
  startDate: string;
  endDate: string;
  auditors: string[];
  progress: number;
  status: "active" | "closed";
  verifiedCount: number;
  discrepancyCount: number;
  complianceGauge: number;
}

export interface ActivityLog {
  id: string;
  user: string;
  userRole: string;
  action: string;
  objectId: string;
  timestamp: string;
  status: "Success" | "Failed";
}

export interface Notification {
  id: string;
  type: "overdue" | "audit" | "transfer" | "assignment" | "system" | "maintenance" | "booking";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface KPIData {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendDirection?: "up" | "down";
  color: string;
}
