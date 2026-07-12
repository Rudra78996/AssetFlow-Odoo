import { Prisma } from "@prisma/client";
import { employeeRepository } from "./employee.repository";
import type { ListEmployeeQuery } from "./employee.schema";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { resolvePagination, skipTake, buildMeta } from "@/lib/pagination";
import { RoleLabel } from "@/modules/shared/presenters";
import { logActivity } from "@/modules/activity/activity.service";
import { notify } from "@/modules/notifications/notification.service";

type UserRow = Prisma.UserGetPayload<{ include: { department: { select: { name: true } } } }>;

function toDto(u: UserRow) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    // Frontend "role" column shows a job title when present, else the RBAC role.
    role: u.jobTitle ?? RoleLabel[u.role],
    rbacRole: RoleLabel[u.role],
    department: u.department?.name ?? "",
  };
}

export const employeeService = {
  async list(rawQuery: ListEmployeeQuery) {
    const p = resolvePagination(rawQuery);
    const where: Prisma.UserWhereInput = {};
    if (rawQuery.role) where.role = rawQuery.role;
    if (rawQuery.department) where.department = { name: rawQuery.department };
    if (p.search) {
      where.OR = [
        { name: { contains: p.search, mode: "insensitive" } },
        { email: { contains: p.search, mode: "insensitive" } },
      ];
    }
    const sortable = new Set(["name", "email", "createdAt"]);
    const orderBy: Prisma.UserOrderByWithRelationInput = sortable.has(p.sortBy ?? "")
      ? { [p.sortBy as string]: p.sortOrder }
      : { name: "asc" };
    const { skip, take } = skipTake(p);
    const { items, total } = await employeeRepository.list(where, skip, take, orderBy);
    return { items: items.map(toDto), meta: buildMeta(total, p) };
  },

  async promote(id: string, actorId: string) {
    const user = await employeeRepository.findById(id);
    if (!user) throw new NotFoundError("Employee not found");
    if (user.role === "MANAGER") return toDto(user); // idempotent
    if (user.role === "ADMIN") throw new ConflictError("Cannot demote an admin via promote");
    const updated = await employeeRepository.promote(id);
    await logActivity({
      userId: actorId,
      action: "employee.promoted",
      objectType: "User",
      objectId: id,
      metadata: { from: "EMPLOYEE", to: "MANAGER" },
    });
    await notify({
      userId: id,
      type: "system",
      title: "Role Updated",
      message: "You have been promoted to Manager.",
    });
    return toDto(updated);
  },
};
