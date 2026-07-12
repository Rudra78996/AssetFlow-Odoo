export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { auditService } from "@/modules/audits/audit.service";
import { closeCycleSchema, type CloseCycleInput } from "@/modules/audits/audit.schema";
export const PATCH = defineRoute<CloseCycleInput>(
  { auth: ["MANAGER", "ADMIN"], bodySchema: closeCycleSchema },
  async ({ params, body, user }) => ok(await auditService.closeCycle(params.id, body?.force ?? false, user!.id)),
);
