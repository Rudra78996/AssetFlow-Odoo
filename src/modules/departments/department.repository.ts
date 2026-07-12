import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const departmentRepository = {
  list() {
    return prisma.department.findMany({ orderBy: { name: "asc" } });
  },
  // staffCount is computed via aggregation, never stored (avoids counter drift).
  staffCounts() {
    return prisma.user.groupBy({ by: ["departmentId"], _count: { _all: true } });
  },
  findById(id: string) {
    return prisma.department.findUnique({ where: { id } });
  },
  create(data: Prisma.DepartmentUncheckedCreateInput) {
    return prisma.department.create({ data });
  },
  update(id: string, data: Prisma.DepartmentUpdateInput) {
    return prisma.department.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.department.delete({ where: { id } });
  },
  countUsers(id: string) {
    return prisma.user.count({ where: { departmentId: id } });
  },
};
