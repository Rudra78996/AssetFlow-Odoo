export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { reportService } from "@/modules/reports/report.service";
import { reportQuerySchema, type ReportQuery } from "@/modules/reports/report.schema";
export const GET = defineRoute<unknown, ReportQuery>(
  { auth: true, querySchema: reportQuerySchema },
  async ({ query }) => {
    const range = query.range === "30" ? 30 : 7;
    const idleDays = Math.max(1, Number(query.idleDays) || 30);
    return ok(await reportService.summary(range, idleDays));
  },
);
