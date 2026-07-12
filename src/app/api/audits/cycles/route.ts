export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok, created } from "@/lib/apiResponse";
import { auditService } from "@/modules/audits/audit.service";
import { createCycleSchema, type CreateCycleInput } from "@/modules/audits/audit.schema";

export const GET = defineRoute({ auth: true }, async () => ok(await auditService.listCycles()));

export const POST = defineRoute<CreateCycleInput>(
  { auth: ["MANAGER", "ADMIN"], bodySchema: createCycleSchema },
  async ({ body, user }) => created(await auditService.createCycle(body, user!.id)),
);
