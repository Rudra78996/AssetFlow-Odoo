import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { setAuthCookies } from "@/lib/cookies";
import { authService } from "@/modules/auth/auth.service";
import { REFRESH_COOKIE } from "@/middleware/withAuth";
import { config } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = defineRoute(
  { rateLimit: config.authRateLimit },
  async ({ req }) => {
    const token = req.cookies.get(REFRESH_COOKIE)?.value;
    const { user, tokens } = await authService.refresh(token);
    const res = ok(user);
    setAuthCookies(res, tokens);
    return res;
  },
);
