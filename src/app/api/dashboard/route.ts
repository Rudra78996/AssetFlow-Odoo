export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { dashboardService } from "@/modules/dashboard/dashboard.service";
export const GET = defineRoute({ auth: true }, async () => ok(await dashboardService.kpis()));
