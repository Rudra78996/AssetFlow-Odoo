import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1),
  hierarchy: z.string().trim().min(1),
  deptHead: z.string().trim().optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  parentId: z.string().optional(),
});
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = createDepartmentSchema.partial();
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
