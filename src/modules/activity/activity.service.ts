import { activityRepository, type ActivityFilter } from "./activity.repository";
import { RoleLabel } from "@/modules/shared/presenters";
import { logger } from "@/lib/logger";

interface LogInput {
  userId?: string | null;
  action: string; // dot-namespaced, e.g. "asset.created"
  objectType: string;
  objectId: string;
  status?: "Success" | "Failed";
  metadata?: Record<string, unknown>;
}

// Called from inside service write-methods (never from route handlers) so that
// audit logging is guaranteed and consistent. Logging failures are swallowed —
// an audit-trail write must never break the primary business operation.
export async function logActivity(input: LogInput): Promise<void> {
  try {
    await activityRepository.create({
      userId: input.userId ?? null,
      action: input.action,
      objectType: input.objectType,
      objectId: input.objectId,
      status: input.status ?? "Success",
      metadata: input.metadata as never,
    });
  } catch (err) {
    logger.warn({ err, action: input.action }, "logActivity failed (non-fatal)");
  }
}

function toDto(row: Awaited<ReturnType<typeof activityRepository.list>>["items"][number]) {
  return {
    id: row.id,
    user: row.user?.name ?? "System",
    userEmail: row.user?.email ?? null,
    userRole: row.user ? RoleLabel[row.user.role] : "system",
    action: row.action,
    objectType: row.objectType,
    objectId: row.objectId,
    timestamp: row.createdAt.toISOString(),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export const activityService = {
  logActivity,
  async list(filter: ActivityFilter, skip: number, take: number) {
    const { items, total } = await activityRepository.list(filter, skip, take);
    return { items: items.map(toDto), total };
  },
};
