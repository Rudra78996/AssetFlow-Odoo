import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/lib/time";

const withRelations = {
  asset: { select: { name: true } },
  bookedBy: { select: { name: true } },
} satisfies Prisma.BookingInclude;

export const bookingRepository = {
  // Same asset, same calendar day, not cancelled — candidates for overlap check.
  sameDayBookings(assetId: string, date: Date) {
    return prisma.booking.findMany({
      where: {
        assetId,
        date: { gte: startOfDay(date), lte: endOfDay(date) },
        status: { not: "CANCELLED" },
      },
    });
  },

  create(data: Prisma.BookingUncheckedCreateInput) {
    return prisma.booking.create({ data, include: withRelations });
  },

  findById(id: string) {
    return prisma.booking.findUnique({ where: { id }, include: withRelations });
  },

  async list(where: Prisma.BookingWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.booking.findMany({ where, include: withRelations, orderBy: [{ date: "desc" }, { startTime: "asc" }], skip, take }),
      prisma.booking.count({ where }),
    ]);
    return { items, total };
  },

  cancel(id: string) {
    return prisma.booking.update({ where: { id }, data: { status: "CANCELLED" }, include: withRelations });
  },
};
