export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { maintenanceService } from "@/modules/maintenance/maintenance.service";
import { assignTechnicianSchema, type AssignTechnicianInput } from "@/modules/maintenance/maintenance.schema";
export const PATCH = defineRoute<AssignTechnicianInput>(
  { auth: ["MANAGER", "ADMIN"], bodySchema: assignTechnicianSchema },
  async ({ params, body, user }) => ok(await maintenanceService.assignTechnician(params.id, body, user!.id)),
);
