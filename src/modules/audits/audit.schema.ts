import { z } from "zod";

export const createCycleSchema = z.object({
  scope: z.string().trim().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  auditorIds: z.array(z.string()).default([]),
  // Optional explicit scope; when omitted, every non-deleted asset is enrolled.
  assetIds: z.array(z.string()).optional(),
});
export type CreateCycleInput = z.infer<typeof createCycleSchema>;

export const markAuditAssetSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "MISSING", "DAMAGED"]),
  note: z.string().optional(),
});
export type MarkAuditAssetInput = z.infer<typeof markAuditAssetSchema>;

export const closeCycleSchema = z.object({
  force: z.boolean().optional(),
});
export type CloseCycleInput = z.infer<typeof closeCycleSchema>;
