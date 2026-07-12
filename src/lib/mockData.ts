import type {
  Asset,
  Department,
  AssetCategory,
  Employee,
  Allocation,
  Booking,
  MaintenanceRequest,
  AuditAsset,
  AuditDiscrepancy,
  AuditCycle,
  ActivityLog,
  Notification,
  User,
} from "./types";

export const currentUser: User = {
  id: "u1",
  name: "Alex Rivera",
  email: "alex.rivera@assetflow.com",
  role: "admin",
  department: "Operations",
};

export const departments: Department[] = [
  { id: "d1", name: "Product Wrench", hierarchy: "Core → R&D", deptHead: "Sarah Jenkins", staffCount: 42, status: "Active" },
  { id: "d2", name: "Global Marketing", hierarchy: "Growth → Comms", deptHead: "Marcus Thorne", staffCount: 18, status: "Active" },
  { id: "d3", name: "UI/UX Design", hierarchy: "R&D → Product", deptHead: "Leo Kazov", staffCount: 12, status: "Active", parentId: "d1" },
  { id: "d4", name: "Supply Chain", hierarchy: "Operations → Logistics", deptHead: "David Chen", staffCount: 24, status: "Active" },
  { id: "d5", name: "Finance", hierarchy: "Operations → Finance", deptHead: "Sarah Miller", staffCount: 8, status: "Active" },
  { id: "d6", name: "Creative Arts", hierarchy: "Growth → Creative", deptHead: "Priya Sharma", staffCount: 15, status: "Active" },
  { id: "d7", name: "IT Infrastructure", hierarchy: "Core → IT", deptHead: "James Wilson", staffCount: 20, status: "Active" },
  { id: "d8", name: "Research Lab", hierarchy: "Core → R&D", deptHead: "Elena Vance", staffCount: 10, status: "Inactive" },
];

export const assetCategories: AssetCategory[] = [
  {
    id: "c1",
    name: "Hardware: Workstations",
    icon: "laptop_mac",
    customFields: [
      { id: "f1", name: "Serial Number", type: "Text", required: true },
      { id: "f2", name: "Processor Gauge", type: "Numeric", required: false },
      { id: "f3", name: "Warranty Expiry", type: "Date", required: false },
    ],
  },
  {
    id: "c2",
    name: "Peripherals: Monitors",
    icon: "developer_board",
    customFields: [
      { id: "f4", name: "Screen Size", type: "Numeric", required: false },
      { id: "f5", name: "Resolution", type: "Text", required: false },
      { id: "f6", name: "Panel Type", type: "Text", required: false },
      { id: "f7", name: "Warranty Expiry", type: "Date", required: false },
    ],
  },
  {
    id: "c3",
    name: "Furniture: Ergonomic Armchairs",
    icon: "chair_alt",
    customFields: [
      { id: "f8", name: "Model Number", type: "Text", required: true },
      { id: "f9", name: "Warranty Expiry", type: "Date", required: false },
      { id: "f10", name: "Weight Capacity", type: "Numeric", required: false },
      { id: "f11", name: "Adjustable", type: "Boolean", required: false },
      { id: "f12", name: "Material", type: "Text", required: false },
      { id: "f13", name: "Color", type: "Text", required: false },
    ],
  },
];

export const employees: Employee[] = [
  { id: "e1", name: "Elena Vance", email: "elena.v@assetflow.com", role: "Senior Designer", department: "Product Wrench" },
  { id: "e2", name: "David Chen", email: "d.chen@assetflow.com", role: "Logistics Associate", department: "Supply Chain" },
  { id: "e3", name: "Sarah Miller", email: "smiller@assetflow.com", role: "Accountant", department: "Finance" },
  { id: "e4", name: "Marcus Thorne", email: "m.thorne@assetflow.com", role: "Marketing Lead", department: "Global Marketing" },
  { id: "e5", name: "Priya Sharma", email: "p.sharma@assetflow.com", role: "Creative Director", department: "Creative Arts" },
  { id: "e6", name: "James Wilson", email: "j.wilson@assetflow.com", role: "IT Specialist", department: "IT Infrastructure" },
  { id: "e7", name: "Leo Kazov", email: "l.kazov@assetflow.com", role: "UX Lead", department: "UI/UX Design" },
  { id: "e8", name: "Sarah Jenkins", email: "s.jenkins@assetflow.com", role: "Wrench Manager", department: "Product Wrench" },
];

export const assets: Asset[] = [
  {
    id: "a1",
    tag: "AF-0001",
    name: "MacBook Pro M2 Max",
    category: "Computing",
    serialNumber: "C02DW1X7MD6R",
    acquisitionDate: "2023-07-20",
    acquisitionCost: 3499,
    condition: "Excellent",
    location: "HQ - Floor 4",
    status: "Available",
    shared: false,
    bookable: true,
    allocationHistory: [
      { id: "ah1", type: "returned", person: "Sarah Johnson", department: "Product Design", date: "2023-10-24 10:45", notes: "Device returned in excellent condition. All data wiped as per protocol." },
      { id: "ah2", type: "allocated", person: "Sarah Johnson", department: "Product Design", date: "2023-08-12 09:00", notes: "Project: Alpha Redesign Phase 2" },
      { id: "ah3", type: "procurement", person: "Procurement Team", department: "Operations", date: "2023-07-20", notes: "Initial Procurement" },
    ],
    maintenanceHistory: [
      { id: "mh1", type: "Battery Calibration", date: "2023-08-10", status: "completed" },
      { id: "mh2", type: "Firmware RefreshCw v2.4", date: "2023-07-22", status: "completed" },
    ],
  },
  {
    id: "a2",
    tag: "AF-0002",
    name: "Herman Miller Aeron",
    category: "Furniture",
    serialNumber: "HM-44021-X",
    acquisitionDate: "2023-06-15",
    acquisitionCost: 1450,
    condition: "Good",
    location: "HQ - Floor 3",
    status: "Allocated",
    shared: false,
    bookable: false,
    allocationHistory: [
      { id: "ah4", type: "allocated", person: "Marcus Thorne", department: "Global Marketing", date: "2023-06-20 09:00", notes: "Assigned to new workstation" },
    ],
    maintenanceHistory: [],
  },
  {
    id: "a3",
    tag: "AF-0003",
    name: "Zebra ZT411 Printer",
    category: "Warehousing",
    serialNumber: "ZB-PR-9921",
    acquisitionDate: "2023-03-10",
    acquisitionCost: 890,
    condition: "Fair",
    location: "Warehouse B",
    status: "Under Maintenance",
    shared: true,
    bookable: true,
    allocationHistory: [],
    maintenanceHistory: [
      { id: "mh3", type: "Print Head Replacement", date: "2023-09-15", status: "completed" },
    ],
  },
  {
    id: "a4",
    tag: "AF-0004",
    name: "Sony Alpha A7R IV Kit",
    category: "Media Equipment",
    serialNumber: "SN-A7R4-4410",
    acquisitionDate: "2023-05-01",
    acquisitionCost: 3200,
    condition: "Excellent",
    location: "Creative Studio",
    status: "Allocated",
    shared: true,
    bookable: true,
    allocationHistory: [
      { id: "ah5", type: "allocated", person: "Marcus Thorne", department: "Marketing Dept", date: "2023-06-01 10:00", notes: "Marketing campaign shoot" },
    ],
    maintenanceHistory: [],
  },
  {
    id: "a5",
    tag: "AF-0005",
    name: "Dell UltraSharp U2723QE",
    category: "Peripherals",
    serialNumber: "DL-U27-5521",
    acquisitionDate: "2023-08-01",
    acquisitionCost: 580,
    condition: "Excellent",
    location: "HQ - Floor 2",
    status: "Available",
    shared: false,
    bookable: true,
    allocationHistory: [],
    maintenanceHistory: [],
  },
  {
    id: "a6",
    tag: "AF-0006",
    name: "Surface Laptop 5",
    category: "Computing",
    serialNumber: "MS-L5-002",
    acquisitionDate: "2023-04-15",
    acquisitionCost: 1599,
    condition: "Good",
    location: "HQ - Floor 4",
    status: "Allocated",
    shared: false,
    bookable: false,
    allocationHistory: [
      { id: "ah6", type: "allocated", person: "Marcus Vane", department: "Wrench Dept", date: "2023-04-20 09:00", notes: "Wrench workstation" },
    ],
    maintenanceHistory: [],
  },
  {
    id: "a7",
    tag: "AF-0007",
    name: "Wacom Cintiq Pro 24",
    category: "Media Equipment",
    serialNumber: "WCM-24-0091",
    acquisitionDate: "2023-02-10",
    acquisitionCost: 2100,
    condition: "Good",
    location: "Creative Studio",
    status: "Allocated",
    shared: true,
    bookable: true,
    allocationHistory: [
      { id: "ah7", type: "allocated", person: "Sarah Jenkins", department: "Creative Arts", date: "2023-02-15 10:00", notes: "Design workstation" },
    ],
    maintenanceHistory: [],
  },
  {
    id: "a8",
    tag: "AF-0008",
    name: "Enterprise Switch 48-Port",
    category: "Networking",
    serialNumber: "9283-XJ2-00",
    acquisitionDate: "2023-01-05",
    acquisitionCost: 4200,
    condition: "Excellent",
    location: "Data Center B",
    status: "Available",
    shared: false,
    bookable: false,
    allocationHistory: [],
    maintenanceHistory: [],
  },
];

export const allocations: Allocation[] = [
  { id: "al1", assetId: "a1", assetName: "MacBook Pro M2 Max", employee: "Anita Smith", department: "Product Design", status: "ACTIVE", date: "2023-10-12" },
  { id: "al2", assetId: "a2", assetName: "iPad Pro 12.9", employee: "Rahul Jethwa", department: "Creative Arts", status: "PENDING", date: "2023-10-15" },
  { id: "al3", assetId: "a3", assetName: "Wacom Tablet", employee: "Clara Moss", department: "Design", status: "OVERDUE", date: "2023-10-08" },
  { id: "al4", assetId: "a4", assetName: "Surface Laptop 5", employee: "Marcus Vane", department: "Wrench", status: "OVERDUE", date: "2023-10-01", expectedReturn: "2023-10-10" },
  { id: "al5", assetId: "a5", assetName: "Wacom Cintiq Pro", employee: "Sarah Jenkins", department: "Creative Arts", status: "OVERDUE", date: "2023-09-28", expectedReturn: "2023-10-05" },
];

export const bookings: Booking[] = [
  { id: "b1", resourceName: "Dev Standup", resourceIcon: "meeting_room", bookedBy: "Team Alpha", purpose: "Daily sync", startTime: "09:00", endTime: "09:30", status: "Completed", date: "2023-10-24" },
  { id: "b2", resourceName: "Conf. Room A", resourceIcon: "meeting_room", bookedBy: "Sarah Chen", purpose: "Sync with Marketing", startTime: "10:00", endTime: "11:00", status: "Ongoing", date: "2023-10-24" },
  { id: "b3", resourceName: "Microscope X", resourceIcon: "precision_manufacturing", bookedBy: "Lab Team", purpose: "Final calibration", startTime: "11:00", endTime: "12:00", status: "Completed", date: "2023-10-24" },
  { id: "b4", resourceName: "EV Sprinter 04", resourceIcon: "directions_car", bookedBy: "Sarah Chen", purpose: "Client visit", startTime: "14:00", endTime: "16:00", status: "Upcoming", date: "2023-10-24" },
  { id: "b5", resourceName: "Meeting Room B", resourceIcon: "meeting_room", bookedBy: "J. Miller", purpose: "Logistics Overlap", startTime: "13:30", endTime: "15:45", status: "Upcoming", date: "2023-10-24" },
  { id: "b6", resourceName: "Studio Space", resourceIcon: "event", bookedBy: "Creative Team", purpose: "Evening Workshop", startTime: "17:00", endTime: "19:00", status: "Upcoming", date: "2023-10-24" },
];

export const maintenanceRequests: MaintenanceRequest[] = [
  { id: "mr1", assetId: "a8", assetName: "Server Rack B2-4", issue: "Overheating incident reported", priority: "High", status: "Clock", date: "2h ago", description: "Temperature spike detected in rack B2-4. Cooling system may need inspection." },
  { id: "mr2", assetId: "a3", assetName: "Industrial CNC Unit", issue: "Spindle replacement approved", priority: "Medium", status: "Approved", date: "Yesterday", description: "Spindle has been making unusual noises. Replacement approved by manager." },
  { id: "mr3", assetId: "a5", assetName: "HVAC System Central", issue: "Routine maintenance", priority: "Low", status: "Technician Assigned", date: "2 days ago", description: "Scheduled quarterly maintenance. Assigned to Marcus V.", technician: "Marcus V." },
  { id: "mr4", assetId: "a7", assetName: "Logistics Drone #04", issue: "Battery calibration complete", priority: "Low", status: "Resolved", date: "4h ago", description: "Battery calibration completed successfully. Drone back in service." },
];

export const maintenanceHistory = [
  { id: "mhi1", assetId: "#AST-9821", issue: "Cooling Fan Replacement", technician: "Sarah Jenkins", date: "Oct 12, 2023", status: "Resolved" },
  { id: "mhi2", assetId: "#AST-4520", issue: "Hydraulic Leak Fixed", technician: "David Chen", date: "Oct 10, 2023", status: "Resolved" },
  { id: "mhi3", assetId: "#AST-1102", issue: "Software Patch V4.2", technician: "System Auto", date: "Oct 08, 2023", status: "Resolved" },
];

export const auditAssets: AuditAsset[] = [
  { id: "au1", name: "Enterprise Switch 48-Port", tag: "AF-88219-SW", serialNumber: "9283-XJ2-00", location: "Rack A-12 • Data Center B", status: "pending" },
  { id: "au2", name: "External RAID Storage", tag: "AF-1102-STO", serialNumber: "RD-9001-FF", location: "Creative Suite • Floor 2", status: "pending" },
  { id: "au3", name: "Ergo-Task Armchair V3", tag: "AF-FURN-21", serialNumber: "CH-2022-X1", location: "Office 104 • Operations", status: "verified" },
  { id: "au4", name: "Server Node AX-192", tag: "AF-AX192-SV", serialNumber: "AX-192-00", location: "Rack 04 • Data Center A", status: "missing" },
  { id: "au5", name: "UPS Module Z-01", tag: "AF-UPS-Z01", serialNumber: "UPS-Z-01", location: "Rack 04 • Data Center A", status: "damaged" },
  { id: "au6", name: "Microscope X-200", tag: "AF-MIC-200", serialNumber: "MC-200-X", location: "Lab 3 • Research", status: "pending" },
  { id: "au7", name: "Industrial Mixer 2.0", tag: "AF-MIX-20", serialNumber: "MX-20-00", location: "Warehouse B", status: "verified" },
  { id: "au8", name: "Logistics Truck 04", tag: "AF-TRK-04", serialNumber: "TR-04-00", location: "Loading Dock", status: "pending" },
];

export const auditDiscrepancies: AuditDiscrepancy[] = [
  { id: "ad1", assetName: "Server Node AX-192", issue: "Missing from Rack 04. Last seen Oct 12.", type: "missing" },
  { id: "ad2", assetName: "UPS Module Z-01", issue: "Physical damage on external casing.", type: "damaged" },
];

export const currentAuditCycle: AuditCycle = {
  id: "821",
  scope: "Data Center B + Creative Suite",
  startDate: "2023-10-20",
  endDate: "2023-10-30",
  auditors: ["Sarah Jenkins", "Marcus King", "Elena Vance"],
  progress: 64,
  status: "active",
  verifiedCount: 128,
  discrepancyCount: 12,
  complianceGauge: 91.4,
};

export const activityLogs: ActivityLog[] = [
  { id: "log1", user: "Sarah Jenkins", userRole: "Admin", action: "Asset Creation", objectId: "#ASSET-9921-X", timestamp: "Oct 24, 2023 14:32:01", status: "Success" },
  { id: "log2", user: "Marcus King", userRole: "Auditor", action: "Permission Modification", objectId: "#ROLE-AUDIT-01", timestamp: "Oct 24, 2023 13:11:55", status: "Success" },
  { id: "log3", user: "System Manager", userRole: "Automated", action: "API Auth Failure", objectId: "#GATEWAY-MAIN", timestamp: "Oct 24, 2023 11:05:22", status: "Failed" },
  { id: "log4", user: "Elena Lopez", userRole: "Manager", action: "Batch Transfer", objectId: "#TX-11822-B", timestamp: "Oct 23, 2023 17:55:00", status: "Success" },
  { id: "log5", user: "Sarah Jenkins", userRole: "Admin", action: "Bulk Delete", objectId: "#TEMP-CACHE-X", timestamp: "Oct 23, 2023 09:12:44", status: "Success" },
];

export const notifications: Notification[] = [
  { id: "n1", type: "overdue", title: "Overdue Alert", message: "Asset #7721 (MacBook Pro) is 3 days overdue from employee John Doe.", time: "2 mins ago", read: false },
  { id: "n2", type: "audit", title: "Audit Discrepancy", message: "Warehouse B manual count for Switch Catalysts differs by -4 units.", time: "45 mins ago", read: false },
  { id: "n3", type: "transfer", title: "Transfer Approved", message: "Asset Transfer #882-P approved by Admin Sarah Jenkins.", time: "2 hours ago", read: false },
  { id: "n4", type: "assignment", title: "Asset Assigned", message: "Workstation #42 assigned to new hire Emily Blunt.", time: "5 hours ago", read: false },
  { id: "n5", type: "system", title: "System RefreshCw Complete", message: "Database maintenance and backup completed successfully.", time: "Yesterday", read: true },
];

export const recentActivity = [
  { id: "ra1", icon: "check_circle", color: "text-available", title: "Maintenance Completed", detail: "for Heavy Drill Unit #12", meta: "Today at 10:45 AM • Technician: David K." },
  { id: "ra2", icon: "move_up", color: "text-primary", title: "Transfer Initiated", detail: " - 24x Monitors moved to Warehouse B", meta: "Today at 09:12 AM • Approved by Admin" },
  { id: "ra3", icon: "pending", color: "text-under-maintenance", title: "New Booking Request", detail: "from Creative Team for VR Suite", meta: "Yesterday at 4:30 PM • 3 items requested" },
];

export const overdueReturns = [
  { id: "or1", icon: "laptop_mac", name: 'MacBook Pro 16" - M2 Max', assetId: "ASSET-8829", daysOverdue: 4, person: "Sarah Jenkins", department: "Product Design" },
  { id: "or2", icon: "camera_enhance", name: "Sony Alpha A7R IV Kit", assetId: "ASSET-4410", daysOverdue: 2, person: "Marcus Thorne", department: "Marketing Dept" },
];

export const dashboardKPIs = [
  { label: "Available", value: 1284, icon: "inventory", trend: "+12%", trendDirection: "up" as const, color: "text-primary" },
  { label: "Allocated", value: 892, icon: "outbound", color: "text-secondary" },
  { label: "Maintenance", value: 14, icon: "engineering", color: "text-tertiary" },
  { label: "Bookings", value: 45, icon: "book_online", color: "text-secondary" },
  { label: "Transfers", value: 29, icon: "sync_alt", color: "text-on-surface-variant" },
  { label: "Returns", value: 18, icon: "keyboard_return", color: "text-secondary" },
];

export const reportsKPIs = [
  { label: "Average Utilization", value: "78.4%", icon: "speed", trend: "+4.2%", trendDirection: "up" as const, color: "text-available" },
  { label: "Idle Asset Count", value: "124", icon: "hourglass_empty", trend: "+1.8%", trendDirection: "up" as const, color: "text-error" },
  { label: "Operational Cost", value: "$42.8k", icon: "payments", color: "text-on-surface-variant" },
  { label: "Compliance Gauge", value: "99.2%", icon: "fact_check", color: "text-available" },
];

export const utilizationTrendData = [
  { day: "Mon", value: 72 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 65 },
  { day: "Thu", value: 82 },
  { day: "Fri", value: 88 },
  { day: "Sat", value: 45 },
  { day: "Sun", value: 38 },
];

export const deptAllocationData = [
  { dept: "Operations", units: 1240 },
  { dept: "Logistics & Supply", units: 980 },
  { dept: "R&D / Lab Ops", units: 450 },
];

export const assetStatusBreakdown = [
  { label: "Most-Used Assets", percentage: 65, color: "text-primary", detail: "High Priority Fleet", hours: "8,420 hrs" },
  { label: "Active Assets", percentage: 25, color: "text-secondary", detail: "Standard Operations", hours: "2,105 hrs" },
  { label: "Idle / Standby", percentage: 10, color: "text-tertiary", detail: "Awaiting Maintenance", hours: "850 hrs" },
];

export const performanceAuditData = [
  { id: "#XF-9021", name: "Industrial Mixer 2.0", uptime: "98.2%", mttr: "1.2 hrs", cost: "$2,450", status: "Optimal" },
  { id: "#HV-1024", name: "HVAC Main Unit - East", uptime: "84.5%", mttr: "4.8 hrs", cost: "$1,120", status: "AlertTriangle" },
  { id: "#LT-4420", name: "Server Cluster Alpha", uptime: "99.9%", mttr: "0.2 hrs", cost: "$8,900", status: "Optimal" },
  { id: "#TR-8812", name: "Logistics Truck - 04", uptime: "62.1%", mttr: "22.5 hrs", cost: "$540", status: "Critical" },
];

export const activityStats = [
  { label: "Daily Events", value: "1,204", trend: "12%", trendDirection: "up" as const },
  { label: "Active Users", value: "88", trend: "4%", trendDirection: "down" as const },
  { label: "Storage Used", value: "4.2 GB", trend: "84% Capacity", trendDirection: "up" as const },
];
