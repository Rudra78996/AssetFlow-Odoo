export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { created } from "@/lib/apiResponse";
import { z } from "zod";
import { allocationService } from "@/modules/allocations/allocation.service";

const bodySchema = z.object({
  recipientId: z.string().min(1),
  departmentId: z.string().optional(),
  expectedReturn: z.coerce.date().optional(),
  notes: z.string().optional(),
});
type Body = z.infer<typeof bodySchema>;

// Shortcut that creates a pending allocation for this asset.
export const POST = defineRoute<Body>(
  { auth: true, bodySchema },
  async ({ params, body, user }) =>
    created(await allocationService.create({ assetId: params.id, ...body }, user!.id)),
);
