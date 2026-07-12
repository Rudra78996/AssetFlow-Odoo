export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { notificationService } from "@/modules/notifications/notification.service";
export const DELETE = defineRoute({ auth: true }, async ({ params, user }) =>
  ok(await notificationService.remove(user!.id, params.id)),
);
