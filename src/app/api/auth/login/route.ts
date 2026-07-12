import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { setAuthCookies } from "@/lib/cookies";
import { authService } from "@/modules/auth/auth.service";
import { loginSchema, type LoginInput } from "@/modules/auth/auth.schema";
import { config } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = defineRoute<LoginInput>(
  { bodySchema: loginSchema, rateLimit: config.authRateLimit },
  async ({ body }) => {
    const { user, tokens } = await authService.login(body);
    const res = ok(user);
    setAuthCookies(res, tokens);
    return res;
  },
);
