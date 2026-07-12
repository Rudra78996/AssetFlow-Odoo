import { z } from "zod";

export const createMaintenanceSchema = z.object({
  assetId: z.string().min(1),
  issue: z.string().trim().min(1),
  description: z.string().trim().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;

export const assignTechnicianSchema = z.object({
  technicianId: z.string().optional(),
  technician: z.string().trim().min(1), // display name shown in the UI
});
export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>;

export const resolveSchema = z.object({
  cost: z.number().nonnegative().optional(),
  note: z.string().optional(),
});
export type ResolveInput = z.infer<typeof resolveSchema>;

export const listMaintenanceQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  status: z
    .enum(["OPEN", "APPROVED", "REJECTED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});
export type ListMaintenanceQuery = z.infer<typeof listMaintenanceQuerySchema>;
