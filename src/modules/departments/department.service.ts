import { departmentRepository } from "./department.repository";
import type { CreateDepartmentInput, UpdateDepartmentInput } from "./department.schema";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { logActivity } from "@/modules/activity/activity.service";
import type { Department } from "@prisma/client";

function toDto(d: Department, staffCount: number) {
  return {
    id: d.id,
    name: d.name,
    hierarchy: d.hierarchy,
    deptHead: d.deptHead ?? "",
    staffCount,
    status: d.status as "Active" | "Inactive",
    parentId: d.parentId ?? undefined,
  };
}

export const departmentService = {
  async list() {
    const [departments, counts] = await Promise.all([
      departmentRepository.list(),
      departmentRepository.staffCounts(),
    ]);
    const countMap = new Map(counts.map((c) => [c.departmentId, c._count._all]));
    return departments.map((d) => toDto(d, countMap.get(d.id) ?? 0));
  },
  async create(input: CreateDepartmentInput, actorId: string) {
    const dept = await departmentRepository.create({
      name: input.name,
      hierarchy: input.hierarchy,
      deptHead: input.deptHead ?? null,
      status: input.status ?? "Active",
      parentId: input.parentId ?? null,
    });
    await logActivity({ userId: actorId, action: "department.created", objectType: "Department", objectId: dept.id });
    return toDto(dept, 0);
  },
  async update(id: string, input: UpdateDepartmentInput, actorId: string) {
    const existing = await departmentRepository.findById(id);
    if (!existing) throw new NotFoundError("Department not found");
    const dept = await departmentRepository.update(id, {
      ...input,
      deptHead: input.deptHead,
      parentId: input.parentId,
    });
    await logActivity({ userId: actorId, action: "department.updated", objectType: "Department", objectId: id });
    return toDto(dept, await departmentRepository.countUsers(id));
  },
  async remove(id: string, actorId: string) {
    const existing = await departmentRepository.findById(id);
    if (!existing) throw new NotFoundError("Department not found");
    const staff = await departmentRepository.countUsers(id);
    if (staff > 0) throw new ConflictError(`Cannot delete a department with ${staff} member(s)`);
    await departmentRepository.delete(id);
    await logActivity({ userId: actorId, action: "department.deleted", objectType: "Department", objectId: id });
    return { id };
  },
};
