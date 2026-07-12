import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const include = { department: { select: { name: true } } } satisfies Prisma.UserInclude;

export const employeeRepository = {
  async list(where: Prisma.UserWhereInput, skip: number, take: number, orderBy: Prisma.UserOrderByWithRelationInput) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, include, orderBy, skip, take }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include });
  },
  promote(id: string) {
    return prisma.user.update({ where: { id }, data: { role: "MANAGER" }, include });
  },
};
