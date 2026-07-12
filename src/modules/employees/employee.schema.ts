import { z } from "zod";

export const listEmployeeQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).optional(),
  department: z.string().optional(),
});
export type ListEmployeeQuery = z.infer<typeof listEmployeeQuerySchema>;
