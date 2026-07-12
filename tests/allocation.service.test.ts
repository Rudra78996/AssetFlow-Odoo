import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/modules/allocations/allocation.repository", () => ({
  allocationRepository: {
    findActiveForAsset: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    approveTx: vi.fn(),
    returnTx: vi.fn(),
    setStatus: vi.fn(),
    findOverdueCandidates: vi.fn(),
    list: vi.fn(),
  },
}));
vi.mock("@/modules/activity/activity.service", () => ({ logActivity: vi.fn() }));
vi.mock("@/modules/notifications/notification.service", () => ({ notify: vi.fn() }));

import { allocationService } from "@/modules/allocations/allocation.service";
import { allocationRepository } from "@/modules/allocations/allocation.repository";
import { ConflictError } from "@/lib/errors";

const repo = allocationRepository as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe("allocation conflict detection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a new allocation when the asset already has an ACTIVE one", async () => {
    repo.findActiveForAsset.mockResolvedValue({ id: "al-1", recipient: { name: "Jane" } });
    await expect(
      allocationService.create({ assetId: "a1", recipientId: "u1" }, "admin"),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("creates a PENDING allocation when the asset is free", async () => {
    repo.findActiveForAsset.mockResolvedValue(null);
    repo.create.mockResolvedValue({
      id: "al-2",
      assetId: "a1",
      requestedAt: new Date("2024-01-01"),
      expectedReturn: null,
      status: "PENDING",
      asset: { name: "Laptop" },
      recipient: { name: "Jane", department: { name: "Ops" } },
    });
    const dto = await allocationService.create({ assetId: "a1", recipientId: "u1" }, "admin");
    expect(dto.status).toBe("PENDING");
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it("approve is idempotent when already ACTIVE", async () => {
    repo.findById.mockResolvedValue({
      id: "al-3",
      assetId: "a1",
      status: "ACTIVE",
      requestedAt: new Date("2024-01-01"),
      expectedReturn: null,
      asset: { name: "Laptop" },
      recipient: { name: "Jane", department: { name: "Ops" } },
    });
    await allocationService.approve("al-3", "admin");
    expect(repo.approveTx).not.toHaveBeenCalled();
  });
});
