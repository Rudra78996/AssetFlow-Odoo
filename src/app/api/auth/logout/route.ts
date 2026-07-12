import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { clearAuthCookies } from "@/lib/cookies";
import { authService } from "@/modules/auth/auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = defineRoute({ auth: true }, async ({ user }) => {
  await authService.logout(user!.id);
  const res = ok({ loggedOut: true });
  clearAuthCookies(res);
  return res;
});
