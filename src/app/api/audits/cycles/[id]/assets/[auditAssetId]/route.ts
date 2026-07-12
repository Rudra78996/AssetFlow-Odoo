export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { auditService } from "@/modules/audits/audit.service";
import { markAuditAssetSchema, type MarkAuditAssetInput } from "@/modules/audits/audit.schema";
export const PATCH = defineRoute<MarkAuditAssetInput>(
  { auth: true, bodySchema: markAuditAssetSchema },
  async ({ params, body, user }) =>
    ok(await auditService.markAsset(params.id, params.auditAssetId, body, user!.id)),
);
