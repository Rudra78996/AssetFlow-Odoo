export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { employeeService } from "@/modules/employees/employee.service";

export const PATCH = defineRoute({ auth: ["ADMIN"] }, async ({ params, user }) =>
  ok(await employeeService.promote(params.id, user!.id)),
);
