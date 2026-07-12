import { describe, it, expect } from "vitest";
import { computeStats } from "@/modules/audits/audit.service";

describe("audit compliance calculation", () => {
  it("computes progress, verified, discrepancies and compliance", () => {
    const stats = computeStats({ VERIFIED: 6, MISSING: 1, DAMAGED: 1, PENDING: 2 });
    expect(stats.total).toBe(10);
    expect(stats.verifiedCount).toBe(6);
    expect(stats.discrepancyCount).toBe(2);
    expect(stats.progress).toBe(80); // (6+1+1)/10
    expect(stats.complianceGauge).toBe(60); // 6/10
  });
  it("handles an empty cycle without dividing by zero", () => {
    const stats = computeStats({});
    expect(stats.total).toBe(0);
    expect(stats.progress).toBe(0);
    expect(stats.complianceGauge).toBe(0);
  });
});
