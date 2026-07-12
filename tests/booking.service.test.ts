import { describe, it, expect } from "vitest";
import { overlaps, computeStatus } from "@/modules/bookings/booking.service";

describe("booking overlap math", () => {
  it("detects overlapping intervals on the same day", () => {
    expect(overlaps({ startTime: "10:00", endTime: "11:00" }, { startTime: "10:30", endTime: "11:30" })).toBe(true);
  });
  it("treats back-to-back bookings as non-overlapping", () => {
    // end == start is allowed (touching, not overlapping)
    expect(overlaps({ startTime: "09:00", endTime: "10:00" }, { startTime: "10:00", endTime: "11:00" })).toBe(false);
  });
  it("non-overlapping windows return false", () => {
    expect(overlaps({ startTime: "09:00", endTime: "09:30" }, { startTime: "14:00", endTime: "16:00" })).toBe(false);
  });
  it("fully-contained windows overlap", () => {
    expect(overlaps({ startTime: "10:00", endTime: "12:00" }, { startTime: "10:30", endTime: "11:00" })).toBe(true);
  });
});

describe("booking status computed on read", () => {
  const today = new Date();
  const mk = (h1: string, h2: string) => ({ date: today, startTime: h1, endTime: h2, status: "UPCOMING" });
  it("cancelled stays cancelled", () => {
    expect(computeStatus({ date: today, startTime: "00:00", endTime: "23:59", status: "CANCELLED" })).toBe("CANCELLED");
  });
  it("a window earlier today is COMPLETED", () => {
    expect(computeStatus(mk("00:00", "00:01"))).toBe("COMPLETED");
  });
  it("a window later today is UPCOMING", () => {
    expect(computeStatus(mk("23:58", "23:59"))).toBe("UPCOMING");
  });
});
