export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { auditService } from "@/modules/audits/audit.service";
export const GET = defineRoute({ auth: true }, async ({ params }) =>
  ok(await auditService.discrepancies(params.id)),
);
