export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { allocationService } from "@/modules/allocations/allocation.service";

export const PATCH = defineRoute({ auth: ["MANAGER", "ADMIN"] }, async ({ params, user }) =>
  ok(await allocationService.returnAsset(params.id, user!.id)),
);
