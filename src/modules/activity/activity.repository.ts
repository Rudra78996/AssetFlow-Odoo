import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ActivityFilter {
  objectType?: string;
  status?: string;
  userId?: string;
  from?: Date;
  to?: Date;
}

function whereFromFilter(f: ActivityFilter): Prisma.ActivityLogWhereInput {
  const where: Prisma.ActivityLogWhereInput = {};
  if (f.objectType) where.objectType = f.objectType;
  if (f.status) where.status = f.status;
  if (f.userId) where.userId = f.userId;
  if (f.from || f.to) where.createdAt = { gte: f.from, lte: f.to };
  return where;
}

export const activityRepository = {
  create(data: Prisma.ActivityLogUncheckedCreateInput) {
    return prisma.activityLog.create({ data });
  },
  async list(f: ActivityFilter, skip: number, take: number) {
    const where = whereFromFilter(f);
    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.activityLog.count({ where }),
    ]);
    return { items, total };
  },
  // Restrict a manager's activity view to their own department's users.
  async userIdsInDepartment(departmentId: string | null) {
    if (!departmentId) return [];
    const users = await prisma.user.findMany({ where: { departmentId }, select: { id: true } });
    return users.map((u) => u.id);
  },
};
