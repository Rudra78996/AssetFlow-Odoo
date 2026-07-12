import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const notificationRepository = {
  create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data });
  },
  createMany(data: Prisma.NotificationUncheckedCreateInput[]) {
    return prisma.notification.createMany({ data });
  },
  async listForUser(userId: string, skip: number, take: number, unreadOnly: boolean) {
    const where: Prisma.NotificationWhereInput = { userId, ...(unreadOnly ? { read: false } : {}) };
    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
    return { items, total, unreadCount };
  },
  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },
  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },
  markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  },
  delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  },
};
