import { z } from "zod";

const conditionEnum = z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]);
const statusEnum = z.enum([
  "AVAILABLE",
  "ALLOCATED",
  "RESERVED",
  "UNDER_MAINTENANCE",
  "LOST",
  "RETIRED",
  "DISPOSED",
]);

export const createAssetSchema = z.object({
  name: z.string().trim().min(1),
  categoryId: z.string().min(1),
  serialNumber: z.string().trim().min(1),
  acquisitionDate: z.coerce.date(),
  acquisitionCost: z.number().nonnegative(),
  condition: conditionEnum.optional(),
  location: z.string().trim().min(1),
  shared: z.boolean().optional(),
  bookable: z.boolean().optional(),
  // Values keyed by the category's custom-field names. Scalars only.
  customFieldValues: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});
export type CreateAssetInput = z.infer<typeof createAssetSchema>;

export const updateAssetSchema = createAssetSchema.partial().extend({
  status: statusEnum.optional(),
});
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

export const listAssetQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  status: statusEnum.optional(),
  category: z.string().optional(), // category id or name
  location: z.string().optional(),
});
export type ListAssetQuery = z.infer<typeof listAssetQuerySchema>;
