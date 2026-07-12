export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { ForbiddenError } from "@/lib/errors";
import { resolvePagination, skipTake, buildMeta } from "@/lib/pagination";
import { activityService } from "@/modules/activity/activity.service";
import { activityRepository } from "@/modules/activity/activity.repository";
import { authRepository } from "@/modules/auth/auth.repository";
import { activityQuerySchema, type ActivityQuery } from "@/modules/activity/activity.schema";

// Employees cannot view the log; managers see their own department; admins see all.
export const GET = defineRoute<unknown, ActivityQuery>(
  { auth: ["MANAGER", "ADMIN"], querySchema: activityQuerySchema },
  async ({ query, user }) => {
    const p = resolvePagination(query);
    const filter = {
      objectType: query.objectType,
      status: query.status,
      userId: query.userId,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    };
    if (user!.role === "MANAGER") {
      const me = await authRepository.findById(user!.id);
      const ids = await activityRepository.userIdsInDepartment(me?.departmentId ?? null);
      if (filter.userId && !ids.includes(filter.userId)) throw new ForbiddenError();
      // Constrain to department: if no specific user requested, scope to dept members.
      if (!filter.userId && ids.length === 0) return ok([], { meta: buildMeta(0, p) });
    }
    const { skip, take } = skipTake(p);
    const { items, total } = await activityService.list(filter, skip, take);
    return ok(items, { meta: buildMeta(total, p) });
  },
);
