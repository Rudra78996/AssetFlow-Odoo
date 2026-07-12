import { z } from "zod";

export const createAllocationSchema = z.object({
  assetId: z.string().min(1),
  recipientId: z.string().min(1),
  departmentId: z.string().optional(),
  type: z.enum(["allocated", "returned", "procurement"]).optional(),
  expectedReturn: z.coerce.date().optional(),
  notes: z.string().optional(),
});
export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;

export const listAllocationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "OVERDUE", "RETURNED", "REJECTED"]).optional(),
  department: z.string().optional(),
});
export type ListAllocationQuery = z.infer<typeof listAllocationQuerySchema>;
