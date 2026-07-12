export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok, created } from "@/lib/apiResponse";
import { maintenanceService } from "@/modules/maintenance/maintenance.service";
import {
  createMaintenanceSchema,
  listMaintenanceQuerySchema,
  type CreateMaintenanceInput,
  type ListMaintenanceQuery,
} from "@/modules/maintenance/maintenance.schema";

export const GET = defineRoute<unknown, ListMaintenanceQuery>(
  { auth: true, querySchema: listMaintenanceQuerySchema },
  async ({ query }) => {
    const { items, meta } = await maintenanceService.list(query, false);
    return ok(items, { meta });
  },
);

// Any authenticated user may raise a maintenance request.
export const POST = defineRoute<CreateMaintenanceInput>(
  { auth: true, bodySchema: createMaintenanceSchema },
  async ({ body, user }) => created(await maintenanceService.create(body, user!.id)),
);
