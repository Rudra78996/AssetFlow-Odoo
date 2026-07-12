export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { employeeService } from "@/modules/employees/employee.service";
import { listEmployeeQuerySchema, type ListEmployeeQuery } from "@/modules/employees/employee.schema";

export const GET = defineRoute<unknown, ListEmployeeQuery>(
  { auth: true, querySchema: listEmployeeQuerySchema },
  async ({ query }) => {
    const { items, meta } = await employeeService.list(query);
    return ok(items, { meta });
  },
);
