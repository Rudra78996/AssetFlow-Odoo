export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { departmentService } from "@/modules/departments/department.service";
import { updateDepartmentSchema, type UpdateDepartmentInput } from "@/modules/departments/department.schema";

export const PATCH = defineRoute<UpdateDepartmentInput>(
  { auth: ["ADMIN"], bodySchema: updateDepartmentSchema },
  async ({ params, body, user }) => ok(await departmentService.update(params.id, body, user!.id)),
);
export const DELETE = defineRoute({ auth: ["ADMIN"] }, async ({ params, user }) =>
  ok(await departmentService.remove(params.id, user!.id)),
);
