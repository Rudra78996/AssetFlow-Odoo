import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/modules/maintenance/maintenance.repository", () => ({
  maintenanceRepository: {
    findById: vi.fn(),
    create: vi.fn(),
    list: vi.fn(),
    transitionTx: vi.fn(),
    simpleUpdate: vi.fn(),
  },
}));
vi.mock("@/modules/activity/activity.service", () => ({ logActivity: vi.fn() }));
vi.mock("@/modules/notifications/notification.service", () => ({ notify: vi.fn() }));

import { maintenanceService } from "@/modules/maintenance/maintenance.service";
import { maintenanceRepository } from "@/modules/maintenance/maintenance.repository";
import { UnprocessableTransitionError } from "@/lib/errors";

const repo = maintenanceRepository as unknown as Record<string, ReturnType<typeof vi.fn>>;
const base = (status: string) => ({
  id: "m1",
  assetId: "a1",
  issue: "x",
  description: "y",
  priority: "MEDIUM",
  status,
  technician: null,
  cost: null,
  requestedById: "u1",
  createdAt: new Date(),
  asset: { name: "Laptop", status: "UNDER_MAINTENANCE" },
});

describe("maintenance status-transition guard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an illegal OPEN -> RESOLVED jump", async () => {
    repo.findById.mockResolvedValue(base("OPEN"));
    await expect(maintenanceService.resolve("m1", {}, "admin")).rejects.toBeInstanceOf(
      UnprocessableTransitionError,
    );
    expect(repo.transitionTx).not.toHaveBeenCalled();
  });

  it("allows a legal IN_PROGRESS -> RESOLVED transition and frees the asset", async () => {
    repo.findById.mockResolvedValue(base("IN_PROGRESS"));
    repo.transitionTx.mockResolvedValue({ ...base("RESOLVED"), resolvedAt: new Date() });
    await maintenanceService.resolve("m1", { cost: 100 }, "admin");
    expect(repo.transitionTx).toHaveBeenCalledOnce();
    const assetChange = repo.transitionTx.mock.calls[0][2];
    expect(assetChange).toEqual({ assetId: "a1", status: "AVAILABLE" });
  });

  it("approve is idempotent when already APPROVED", async () => {
    repo.findById.mockResolvedValue(base("APPROVED"));
    await maintenanceService.approve("m1", "admin");
    expect(repo.transitionTx).not.toHaveBeenCalled();
  });
});
