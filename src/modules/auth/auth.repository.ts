import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, include: { department: true } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: { department: true } });
  },
  create(data: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({ data, include: { department: true } });
  },
  setRefreshTokenHash(id: string, hash: string | null) {
    return prisma.user.update({ where: { id }, data: { refreshTokenHash: hash } });
  },
  findDepartmentByName(name: string) {
    return prisma.department.findUnique({ where: { name } });
  },
};
