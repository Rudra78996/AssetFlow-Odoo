import { notificationRepository } from "./notification.repository";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import type { Notification } from "@prisma/client";

type NotifType =
  | "overdue"
  | "audit"
  | "transfer"
  | "assignment"
  | "system"
  | "maintenance"
  | "booking";

// Emitted by domain events (overdue, maintenance change, assignment...). Best-effort:
// a failed notification never rolls back the triggering business operation.
export async function notify(input: {
  userId: string;
  type: NotifType;
  title: string;
  message: string;
}): Promise<void> {
  try {
    await notificationRepository.create(input);
  } catch {
    /* non-fatal */
  }
}

function toDto(n: Notification) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    time: n.createdAt.toISOString(),
    read: n.read,
  };
}

export const notificationService = {
  notify,
  async list(userId: string, skip: number, take: number, unreadOnly: boolean) {
    const { items, total, unreadCount } = await notificationRepository.listForUser(
      userId,
      skip,
      take,
      unreadOnly,
    );
    return { items: items.map(toDto), total, unreadCount };
  },
  async markRead(userId: string, id: string) {
    const n = await notificationRepository.findById(id);
    if (!n) throw new NotFoundError("Notification not found");
    if (n.userId !== userId) throw new ForbiddenError();
    if (n.read) return toDto(n); // idempotent
    return toDto(await notificationRepository.markRead(id));
  },
  async markAllRead(userId: string) {
    const res = await notificationRepository.markAllRead(userId);
    return { updated: res.count };
  },
  async remove(userId: string, id: string) {
    const n = await notificationRepository.findById(id);
    if (!n) throw new NotFoundError("Notification not found");
    if (n.userId !== userId) throw new ForbiddenError();
    await notificationRepository.delete(id);
    return { id };
  },
};
