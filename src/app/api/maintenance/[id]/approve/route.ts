export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { maintenanceService } from "@/modules/maintenance/maintenance.service";
export const PATCH = defineRoute({ auth: ["MANAGER", "ADMIN"] }, async ({ params, user }) =>
  ok(await maintenanceService.approve(params.id, user!.id)),
);
