import { z } from "zod";

const customFieldSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["TEXT", "NUMERIC", "DATE", "BOOLEAN"]),
  required: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1),
  icon: z.string().optional(),
  customFields: z.array(customFieldSchema).default([]),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
