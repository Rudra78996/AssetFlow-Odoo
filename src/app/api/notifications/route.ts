export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { resolvePagination, skipTake, buildMeta } from "@/lib/pagination";
import { notificationService } from "@/modules/notifications/notification.service";
import { notificationQuerySchema, type NotificationQuery } from "@/modules/notifications/notification.schema";

export const GET = defineRoute<unknown, NotificationQuery>(
  { auth: true, querySchema: notificationQuerySchema },
  async ({ query, user }) => {
    const p = resolvePagination(query);
    const { skip, take } = skipTake(p);
    const { items, total, unreadCount } = await notificationService.list(
      user!.id,
      skip,
      take,
      query.unread === "true",
    );
    const res = ok(items, { meta: buildMeta(total, p) });
    res.headers.set("x-unread-count", String(unreadCount));
    return res;
  },
);
