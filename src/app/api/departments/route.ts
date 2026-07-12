export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok, created } from "@/lib/apiResponse";
import { departmentService } from "@/modules/departments/department.service";
import { createDepartmentSchema, type CreateDepartmentInput } from "@/modules/departments/department.schema";

export const GET = defineRoute({ auth: true }, async () => ok(await departmentService.list()));

export const POST = defineRoute<CreateDepartmentInput>(
  { auth: ["ADMIN"], bodySchema: createDepartmentSchema },
  async ({ body, user }) => created(await departmentService.create(body, user!.id)),
);
