import { z } from "zod";

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:mm");

export const createBookingSchema = z
  .object({
    assetId: z.string().min(1),
    purpose: z.string().trim().min(1),
    date: z.coerce.date(),
    startTime: hhmm,
    endTime: hhmm,
  })
  .refine((v) => v.startTime < v.endTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const listBookingQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
  view: z.enum(["Today", "Week", "Month"]).optional(),
});
export type ListBookingQuery = z.infer<typeof listBookingQuerySchema>;
