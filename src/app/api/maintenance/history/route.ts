export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { maintenanceService } from "@/modules/maintenance/maintenance.service";
import { listMaintenanceQuerySchema, type ListMaintenanceQuery } from "@/modules/maintenance/maintenance.schema";

// Resolved requests only — derived from status=RESOLVED, not a separate collection.
export const GET = defineRoute<unknown, ListMaintenanceQuery>(
  { auth: true, querySchema: listMaintenanceQuerySchema },
  async ({ query }) => {
    const { items, meta } = await maintenanceService.list(query, true);
    return ok(items, { meta });
  },
);
