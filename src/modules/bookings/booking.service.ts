import { Prisma } from "@prisma/client";
import { bookingRepository } from "./booking.repository";
import type { CreateBookingInput, ListBookingQuery } from "./booking.schema";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { resolvePagination, skipTake, buildMeta } from "@/lib/pagination";
import { parseHHmm, startOfDay, endOfDay } from "@/lib/time";
import { withTxRetry } from "@/lib/tx";
import { logActivity } from "@/modules/activity/activity.service";
import { BookingStatusLabel } from "@/modules/shared/presenters";

type BookingRow = Prisma.BookingGetPayload<{
  include: { asset: { select: { name: true } }; bookedBy: { select: { name: true } } };
}>;

// Pure, unit-testable overlap check: two intervals on the same day overlap iff
// start < existingEnd && end > existingStart.
export function overlaps(
  candidate: { startTime: string; endTime: string },
  existing: { startTime: string; endTime: string },
): boolean {
  const cs = parseHHmm(candidate.startTime);
  const ce = parseHHmm(candidate.endTime);
  const es = parseHHmm(existing.startTime);
  const ee = parseHHmm(existing.endTime);
  return cs < ee && ce > es;
}

// Status computed on read from wall-clock time — cheaper than a cron and always
// correct. CANCELLED is terminal and never recomputed.
export function computeStatus(b: { date: Date; startTime: string; endTime: string; status: string }): string {
  if (b.status === "CANCELLED") return "CANCELLED";
  const now = Date.now();
  const dayStart = startOfDay(b.date).getTime();
  const start = dayStart + parseHHmm(b.startTime) * 60_000;
  const end = dayStart + parseHHmm(b.endTime) * 60_000;
  if (now < start) return "UPCOMING";
  if (now <= end) return "ONGOING";
  return "COMPLETED";
}

function toDto(b: BookingRow) {
  const status = computeStatus(b) as keyof typeof BookingStatusLabel;
  return {
    id: b.id,
    resourceName: b.asset?.name ?? "",
    resourceIcon: "inventory_2",
    bookedBy: b.bookedBy?.name ?? "",
    purpose: b.purpose,
    startTime: b.startTime,
    endTime: b.endTime,
    status: BookingStatusLabel[status],
    date: b.date.toISOString().slice(0, 10),
  };
}

export const bookingService = {
  toDto,
  overlaps,
  computeStatus,

  async list(rawQuery: ListBookingQuery) {
    const p = resolvePagination(rawQuery);
    const where: Prisma.BookingWhereInput = {};
    if (rawQuery.status) where.status = rawQuery.status;

    // Translate the frontend's Today/Week/Month toggle into a server-side range.
    if (rawQuery.view) {
      const now = new Date();
      if (rawQuery.view === "Today") {
        where.date = { gte: startOfDay(now), lte: endOfDay(now) };
      } else if (rawQuery.view === "Week") {
        const end = new Date(now);
        end.setDate(end.getDate() + 7);
        where.date = { gte: startOfDay(now), lte: endOfDay(end) };
      } else {
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1);
        where.date = { gte: startOfDay(now), lte: endOfDay(end) };
      }
    }
    if (p.search) {
      where.OR = [
        { purpose: { contains: p.search, mode: "insensitive" } },
        { asset: { name: { contains: p.search, mode: "insensitive" } } },
        { bookedBy: { name: { contains: p.search, mode: "insensitive" } } },
      ];
    }
    const { skip, take } = skipTake(p);
    const { items, total } = await bookingRepository.list(where, skip, take);
    return { items: items.map(toDto), meta: buildMeta(total, p) };
  },

  // Overlap detection is MANDATORY server-side: two users must never double-book.
  async create(input: CreateBookingInput, actorId: string) {
    return withTxRetry(async () => {
      const sameDay = await bookingRepository.sameDayBookings(input.assetId, input.date);
      const conflict = sameDay.find((b) => overlaps(input, b));
      if (conflict) {
        throw new ConflictError("This resource is already booked for the requested time", {
          conflictingBookingId: conflict.id,
          conflictWindow: { start: conflict.startTime, end: conflict.endTime },
        });
      }
      const booking = await bookingRepository.create({
        assetId: input.assetId,
        bookedById: actorId,
        purpose: input.purpose,
        date: startOfDay(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        status: "UPCOMING",
      });
      await logActivity({
        userId: actorId,
        action: "booking.created",
        objectType: "Booking",
        objectId: booking.id,
      });
      return toDto(booking);
    });
  },

  async cancel(id: string, actorId: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new NotFoundError("Booking not found");
    if (booking.status === "CANCELLED") return toDto(booking); // idempotent
    const updated = await bookingRepository.cancel(id);
    await logActivity({
      userId: actorId,
      action: "booking.cancelled",
      objectType: "Booking",
      objectId: id,
    });
    return toDto(updated);
  },
};
