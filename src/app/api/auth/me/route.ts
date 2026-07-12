import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { authService } from "@/modules/auth/auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = defineRoute({ auth: true }, async ({ user }) => {
  return ok(await authService.me(user!.id));
});
