/**
 * Seed mirroring the frontend's src/lib/mockData.ts so the existing UI renders
 * meaningfully against this backend on day one. Idempotent: it resets the
 * mutable collections and reseeds deterministically, and resets the tag Counter.
 *
 * Run: npm run seed   (requires a running Mongo replica set, see docker-compose.yml)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  type AssetStatus,
  type AssetCondition,
  type AllocationStatus,
  type BookingStatus,
  type MaintenancePriority,
  type MaintenanceStatus,
  type AuditAssetStatus,
  type CustomFieldType,
} from "@prisma/client";

// Minimal .env loader so `tsx prisma/seed.ts` works without extra deps.
try {
  const env = readFileSync(join(process.cwd(), ".env"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* .env optional */
}

const prisma = new PrismaClient();

const ASSET_STATUS: Record<string, AssetStatus> = {
  Available: "AVAILABLE",
  Allocated: "ALLOCATED",
  Reserved: "RESERVED",
  "Under Maintenance": "UNDER_MAINTENANCE",
  Lost: "LOST",
  Retired: "RETIRED",
  Disposed: "DISPOSED",
};
const CONDITION: Record<string, AssetCondition> = {
  Excellent: "EXCELLENT",
  Good: "GOOD",
  Fair: "FAIR",
  Poor: "POOR",
};
const ALLOC_STATUS: Record<string, AllocationStatus> = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  OVERDUE: "OVERDUE",
  RETURNED: "RETURNED",
  REJECTED: "REJECTED",
};
const BOOKING_STATUS: Record<string, BookingStatus> = {
  Upcoming: "UPCOMING",
  Ongoing: "ONGOING",
  Completed: "COMPLETED",
  Cancelled: "CANCELLED",
};
const PRIORITY: Record<string, MaintenancePriority> = { Low: "LOW", Medium: "MEDIUM", High: "HIGH" };
const MAINT_STATUS: Record<string, MaintenanceStatus> = {
  Clock: "OPEN",
  Approved: "APPROVED",
  Rejected: "REJECTED",
  "Technician Assigned": "TECHNICIAN_ASSIGNED",
  "In Progress": "IN_PROGRESS",
  Resolved: "RESOLVED",
};
const AUDIT_STATUS: Record<string, AuditAssetStatus> = {
  pending: "PENDING",
  verified: "VERIFIED",
  missing: "MISSING",
  damaged: "DAMAGED",
};
const FIELD_TYPE: Record<string, CustomFieldType> = {
  Text: "TEXT",
  Numeric: "NUMERIC",
  Date: "DATE",
  Boolean: "BOOLEAN",
};

async function reset() {
  // Delete in dependency order.
  await prisma.auditAsset.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.$runCommandRaw({ delete: "Counter", deletes: [{ q: {}, limit: 0 }] }).catch(() => {});
}

async function main() {
  await reset();
  const passwordHash = await bcrypt.hash("Password123", 12);

  // ---- Departments ----
  const deptSeed = [
    { name: "Product Wrench", hierarchy: "Core \u2192 R&D", deptHead: "Sarah Jenkins", status: "Active" },
    { name: "Global Marketing", hierarchy: "Growth \u2192 Comms", deptHead: "Marcus Thorne", status: "Active" },
    { name: "UI/UX Design", hierarchy: "R&D \u2192 Product", deptHead: "Leo Kazov", status: "Active", parent: "Product Wrench" },
    { name: "Supply Chain", hierarchy: "Operations \u2192 Logistics", deptHead: "David Chen", status: "Active" },
    { name: "Finance", hierarchy: "Operations \u2192 Finance", deptHead: "Sarah Miller", status: "Active" },
    { name: "Creative Arts", hierarchy: "Growth \u2192 Creative", deptHead: "Priya Sharma", status: "Active" },
    { name: "IT Infrastructure", hierarchy: "Core \u2192 IT", deptHead: "James Wilson", status: "Active" },
    { name: "Research Lab", hierarchy: "Core \u2192 R&D", deptHead: "Elena Vance", status: "Inactive" },
    { name: "Operations", hierarchy: "Core \u2192 Ops", deptHead: "Alex Rivera", status: "Active" },
  ];
  const deptByName = new Map<string, string>();
  for (const d of deptSeed) {
    const created = await prisma.department.create({
      data: { name: d.name, hierarchy: d.hierarchy, deptHead: d.deptHead, status: d.status },
    });
    deptByName.set(d.name, created.id);
  }
  for (const d of deptSeed.filter((x) => x.parent)) {
    await prisma.department.update({
      where: { name: d.name },
      data: { parentId: deptByName.get(d.parent!) },
    });
  }

  // ---- Categories (reconciled: rich Org-Setup categories + asset-directory kinds) ----
  const richCategories = [
    {
      name: "Hardware: Workstations",
      icon: "laptop_mac",
      customFields: [
        { name: "Serial Number", type: "Text", required: true },
        { name: "Processor Gauge", type: "Numeric", required: false },
        { name: "Warranty Expiry", type: "Date", required: false },
      ],
    },
    {
      name: "Peripherals: Monitors",
      icon: "developer_board",
      customFields: [
        { name: "Screen Size", type: "Numeric", required: false },
        { name: "Resolution", type: "Text", required: false },
        { name: "Panel Type", type: "Text", required: false },
        { name: "Warranty Expiry", type: "Date", required: false },
      ],
    },
    {
      name: "Furniture: Ergonomic Armchairs",
      icon: "chair_alt",
      customFields: [
        { name: "Model Number", type: "Text", required: true },
        { name: "Warranty Expiry", type: "Date", required: false },
        { name: "Weight Capacity", type: "Numeric", required: false },
        { name: "Adjustable", type: "Boolean", required: false },
        { name: "Material", type: "Text", required: false },
        { name: "Color", type: "Text", required: false },
      ],
    },
  ];
  const simpleKinds = ["Computing", "Furniture", "Warehousing", "Media Equipment", "Peripherals", "Networking"];
  const catByName = new Map<string, string>();
  for (const c of richCategories) {
    const created = await prisma.assetCategory.create({
      data: {
        name: c.name,
        icon: c.icon,
        customFields: c.customFields.map((f) => ({ name: f.name, type: FIELD_TYPE[f.type], required: f.required })),
      },
    });
    catByName.set(c.name, created.id);
  }
  for (const k of simpleKinds) {
    const created = await prisma.assetCategory.create({ data: { name: k, icon: "category", customFields: [] } });
    catByName.set(k, created.id);
  }

  // ---- Users (admin + employees) ----
  const employees = [
    { name: "Alex Rivera", email: "alex.rivera@assetflow.com", role: "ADMIN", jobTitle: "Operations Admin", department: "Operations" },
    { name: "David Chen", email: "d.chen@assetflow.com", role: "MANAGER", jobTitle: "Logistics Associate", department: "Supply Chain" },
    { name: "Sarah Miller", email: "smiller@assetflow.com", role: "EMPLOYEE", jobTitle: "Accountant", department: "Finance" },
    { name: "Marcus Thorne", email: "m.thorne@assetflow.com", role: "MANAGER", jobTitle: "Marketing Lead", department: "Global Marketing" },
    { name: "Priya Sharma", email: "p.sharma@assetflow.com", role: "MANAGER", jobTitle: "Creative Director", department: "Creative Arts" },
    { name: "James Wilson", email: "j.wilson@assetflow.com", role: "EMPLOYEE", jobTitle: "IT Specialist", department: "IT Infrastructure" },
    { name: "Leo Kazov", email: "l.kazov@assetflow.com", role: "MANAGER", jobTitle: "UX Lead", department: "UI/UX Design" },
    { name: "Sarah Jenkins", email: "s.jenkins@assetflow.com", role: "MANAGER", jobTitle: "Wrench Manager", department: "Product Wrench" },
  ] as const;
  const userByName = new Map<string, string>();
  for (const e of employees) {
    const u = await prisma.user.create({
      data: {
        name: e.name,
        email: e.email,
        passwordHash,
        role: e.role,
        jobTitle: e.jobTitle,
        departmentId: deptByName.get(e.department) ?? null,
      },
    });
    userByName.set(e.name, u.id);
  }
  const adminId = userByName.get("Alex Rivera")!;

  // ---- Assets ----
  const assetSeed = [
    { tag: "AF-0001", name: "MacBook Pro M2 Max", category: "Computing", serial: "C02DW1X7MD6R", date: "2023-07-20", cost: 3499, cond: "Excellent", loc: "HQ - Floor 4", status: "Available", shared: false, bookable: true },
    { tag: "AF-0002", name: "Herman Miller Aeron", category: "Furniture", serial: "HM-44021-X", date: "2023-06-15", cost: 1450, cond: "Good", loc: "HQ - Floor 3", status: "Allocated", shared: false, bookable: false },
    { tag: "AF-0003", name: "Zebra ZT411 Printer", category: "Warehousing", serial: "ZB-PR-9921", date: "2023-03-10", cost: 890, cond: "Fair", loc: "Warehouse B", status: "Under Maintenance", shared: true, bookable: true },
    { tag: "AF-0004", name: "Sony Alpha A7R IV Kit", category: "Media Equipment", serial: "SN-A7R4-4410", date: "2023-05-01", cost: 3200, cond: "Excellent", loc: "Creative Studio", status: "Allocated", shared: true, bookable: true },
    { tag: "AF-0005", name: "Dell UltraSharp U2723QE", category: "Peripherals", serial: "DL-U27-5521", date: "2023-08-01", cost: 580, cond: "Excellent", loc: "HQ - Floor 2", status: "Available", shared: false, bookable: true },
    { tag: "AF-0006", name: "Surface Laptop 5", category: "Computing", serial: "MS-L5-002", date: "2023-04-15", cost: 1599, cond: "Good", loc: "HQ - Floor 4", status: "Allocated", shared: false, bookable: false },
    { tag: "AF-0007", name: "Wacom Cintiq Pro 24", category: "Media Equipment", serial: "WCM-24-0091", date: "2023-02-10", cost: 2100, cond: "Good", loc: "Creative Studio", status: "Allocated", shared: true, bookable: true },
    { tag: "AF-0008", name: "Enterprise Switch 48-Port", category: "Networking", serial: "9283-XJ2-00", date: "2023-01-05", cost: 4200, cond: "Excellent", loc: "Data Center B", status: "Available", shared: false, bookable: false },
  ];
  const assetByTag = new Map<string, string>();
  for (const a of assetSeed) {
    const created = await prisma.asset.create({
      data: {
        tag: a.tag,
        name: a.name,
        categoryId: catByName.get(a.category)!,
        serialNumber: a.serial,
        acquisitionDate: new Date(a.date),
        acquisitionCost: a.cost,
        condition: CONDITION[a.cond],
        location: a.loc,
        status: ASSET_STATUS[a.status],
        shared: a.shared,
        bookable: a.bookable,
      },
    });
    assetByTag.set(a.tag, created.id);
  }
  // Advance the tag counter so future registrations continue at AF-0009.
  await prisma.counter.create({ data: { id: "asset_tag", seq: assetSeed.length } });

  // ---- Allocations ----
  const allocSeed = [
    { tag: "AF-0001", employee: "Sarah Miller", dept: "Finance", status: "ACTIVE", date: "2023-10-12" },
    { tag: "AF-0002", employee: "Marcus Thorne", dept: "Global Marketing", status: "PENDING", date: "2023-10-15" },
    { tag: "AF-0004", employee: "Priya Sharma", dept: "Creative Arts", status: "OVERDUE", date: "2023-10-01", expected: "2023-10-10" },
    { tag: "AF-0006", employee: "Leo Kazov", dept: "UI/UX Design", status: "OVERDUE", date: "2023-09-28", expected: "2023-10-05" },
    { tag: "AF-0007", employee: "Sarah Jenkins", dept: "Product Wrench", status: "ACTIVE", date: "2023-10-08" },
  ];
  for (const al of allocSeed) {
    await prisma.allocation.create({
      data: {
        assetId: assetByTag.get(al.tag)!,
        recipientId: userByName.get(al.employee) ?? adminId,
        departmentId: deptByName.get(al.dept) ?? null,
        type: "allocated",
        status: ALLOC_STATUS[al.status],
        requestedAt: new Date(al.date),
        approvedAt: al.status === "ACTIVE" || al.status === "OVERDUE" ? new Date(al.date) : null,
        expectedReturn: al.expected ? new Date(al.expected) : null,
      },
    });
  }

  // ---- Bookings ----
  const bookable = assetSeed.filter((a) => a.bookable).map((a) => a.tag);
  const bookingSeed = [
    { purpose: "Daily sync", start: "09:00", end: "09:30", status: "Completed", by: "Sarah Jenkins" },
    { purpose: "Sync with Marketing", start: "10:00", end: "11:00", status: "Ongoing", by: "Marcus Thorne" },
    { purpose: "Final calibration", start: "11:00", end: "12:00", status: "Completed", by: "James Wilson" },
    { purpose: "Client visit", start: "14:00", end: "16:00", status: "Upcoming", by: "David Chen" },
    { purpose: "Logistics Overlap", start: "13:30", end: "15:45", status: "Upcoming", by: "Sarah Miller" },
    { purpose: "Evening Workshop", start: "17:00", end: "19:00", status: "Upcoming", by: "Priya Sharma" },
  ];
  bookingSeed.forEach(async (b, i) => {
    await prisma.booking.create({
      data: {
        assetId: assetByTag.get(bookable[i % bookable.length])!,
        bookedById: userByName.get(b.by) ?? adminId,
        purpose: b.purpose,
        date: new Date("2023-10-24"),
        startTime: b.start,
        endTime: b.end,
        status: BOOKING_STATUS[b.status],
      },
    });
  });

  // ---- Maintenance ----
  const maintSeed = [
    { tag: "AF-0008", issue: "Overheating incident reported", priority: "High", status: "Clock", desc: "Temperature spike detected in rack B2-4." },
    { tag: "AF-0003", issue: "Spindle replacement approved", priority: "Medium", status: "Approved", desc: "Spindle has been making unusual noises." },
    { tag: "AF-0005", issue: "Routine maintenance", priority: "Low", status: "Technician Assigned", desc: "Scheduled quarterly maintenance.", tech: "Marcus V." },
    { tag: "AF-0007", issue: "Battery calibration complete", priority: "Low", status: "Resolved", desc: "Battery calibration completed successfully.", cost: 120 },
  ];
  for (const m of maintSeed) {
    await prisma.maintenanceRequest.create({
      data: {
        assetId: assetByTag.get(m.tag)!,
        issue: m.issue,
        description: m.desc,
        priority: PRIORITY[m.priority],
        status: MAINT_STATUS[m.status],
        technician: m.tech ?? null,
        cost: m.cost ?? null,
        requestedById: adminId,
        resolvedAt: m.status === "Resolved" ? new Date("2023-10-24") : null,
      },
    });
  }

  // ---- Audit cycle + audit assets ----
  const auditorIds = ["Sarah Jenkins", "Marcus Thorne", "Elena Vance"]
    .map((n) => userByName.get(n))
    .filter((x): x is string => Boolean(x));
  const cycle = await prisma.auditCycle.create({
    data: {
      scope: "Data Center B + Creative Suite",
      startDate: new Date("2023-10-20"),
      endDate: new Date("2023-10-30"),
      status: "ACTIVE",
      auditorIds,
    },
  });
  const auditStatuses = ["pending", "pending", "verified", "missing", "damaged", "pending", "verified", "pending"];
  await prisma.auditAsset.createMany({
    data: assetSeed.map((a, i) => ({
      auditCycleId: cycle.id,
      assetId: assetByTag.get(a.tag)!,
      status: AUDIT_STATUS[auditStatuses[i] ?? "pending"],
      verifiedAt: auditStatuses[i] === "verified" ? new Date() : null,
    })),
  });

  // ---- Activity logs ----
  const logSeed = [
    { user: "Sarah Jenkins", action: "asset.created", objectType: "Asset", objectId: "AF-0009", status: "Success" },
    { user: "Marcus Thorne", action: "employee.promoted", objectType: "User", objectId: "ROLE-AUDIT-01", status: "Success" },
    { user: null, action: "auth.failure", objectType: "Gateway", objectId: "GATEWAY-MAIN", status: "Failed" },
    { user: "Leo Kazov", action: "allocation.approved", objectType: "Allocation", objectId: "TX-11822-B", status: "Success" },
    { user: "Sarah Jenkins", action: "asset.deleted", objectType: "Asset", objectId: "TEMP-CACHE-X", status: "Success" },
  ];
  for (const l of logSeed) {
    await prisma.activityLog.create({
      data: {
        userId: l.user ? (userByName.get(l.user) ?? null) : null,
        action: l.action,
        objectType: l.objectType,
        objectId: l.objectId,
        status: l.status,
      },
    });
  }

  // ---- Notifications (for the admin) ----
  const notifSeed = [
    { type: "overdue", title: "Overdue Alert", message: "Asset AF-0004 is overdue from Priya Sharma." },
    { type: "audit", title: "Audit Discrepancy", message: "Server Node AX-192 flagged as missing." },
    { type: "transfer", title: "Transfer Approved", message: "Asset Transfer approved by Admin." },
    { type: "assignment", title: "Asset Assigned", message: "Workstation assigned to a new hire.", read: false },
    { type: "system", title: "System Refresh Complete", message: "Database maintenance completed successfully.", read: true },
  ];
  await prisma.notification.createMany({
    data: notifSeed.map((n) => ({
      userId: adminId,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read ?? false,
    })),
  });

  console.log("Seed complete: users, departments, categories, assets, allocations, bookings, maintenance, audit cycle, activity, notifications.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
