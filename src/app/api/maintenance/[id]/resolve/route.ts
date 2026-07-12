export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { maintenanceService } from "@/modules/maintenance/maintenance.service";
import { resolveSchema, type ResolveInput } from "@/modules/maintenance/maintenance.schema";
export const PATCH = defineRoute<ResolveInput>(
  { auth: ["MANAGER", "ADMIN"], bodySchema: resolveSchema },
  async ({ params, body, user }) => ok(await maintenanceService.resolve(params.id, body, user!.id)),
);
