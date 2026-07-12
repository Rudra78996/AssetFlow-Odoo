import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/modules/assets/asset.repository", () => ({
  assetRepository: {
    nextTagSeq: vi.fn(),
    create: vi.fn(),
    categoryExists: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    allocationHistory: vi.fn(),
    maintenanceHistory: vi.fn(),
  },
}));
vi.mock("@/modules/activity/activity.service", () => ({ logActivity: vi.fn() }));

import { assetService } from "@/modules/assets/asset.service";
import { assetRepository } from "@/modules/assets/asset.repository";

const repo = assetRepository as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe("race-safe asset tag generation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("formats the atomic counter value into a zero-padded AF- tag", async () => {
    repo.categoryExists.mockResolvedValue({ id: "c1" });
    repo.nextTagSeq.mockResolvedValue(42);
    repo.create.mockImplementation(async (data: { tag: string }) => ({
      id: "a1",
      ...data,
      category: { name: "Computing" },
      acquisitionDate: new Date("2024-01-01"),
      condition: "GOOD",
      status: "AVAILABLE",
      shared: false,
      bookable: false,
    }));

    const dto = await assetService.create(
      {
        name: "MacBook",
        categoryId: "c1",
        serialNumber: "SN-1",
        acquisitionDate: new Date("2024-01-01"),
        acquisitionCost: 1000,
        location: "HQ",
      },
      "admin",
    );

    expect(repo.nextTagSeq).toHaveBeenCalledOnce();
    expect(dto.tag).toBe("AF-0042");
    // The tag passed to the repository must be derived from the counter, not scanned.
    expect(repo.create.mock.calls[0][0].tag).toBe("AF-0042");
  });
});
