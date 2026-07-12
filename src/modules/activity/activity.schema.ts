import { z } from "zod";

export const activityQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  objectType: z.string().optional(),
  status: z.enum(["Success", "Failed"]).optional(),
  userId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
export type ActivityQuery = z.infer<typeof activityQuerySchema>;
