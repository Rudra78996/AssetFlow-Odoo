import { z } from "zod";

export const reportQuerySchema = z.object({
  range: z.enum(["7", "30"]).optional(), // trailing days for utilization trend
  idleDays: z.string().optional(),
});
export type ReportQuery = z.infer<typeof reportQuerySchema>;
