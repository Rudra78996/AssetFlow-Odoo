export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { UnauthorizedError } from "@/lib/errors";
import { allocationService } from "@/modules/allocations/allocation.service";
import { config } from "@/lib/config";

// Internal endpoint hit by the overdue worker or a platform Cron. Authorized by a
// shared secret header (not a user session) so it can run headless.
export const POST = defineRoute({}, async ({ req }) => {
  const provided = req.headers.get("x-cron-secret");
  if (provided !== config.CRON_SECRET) throw new UnauthorizedError("Invalid cron secret");
  return ok(await allocationService.flagOverdue());
});
