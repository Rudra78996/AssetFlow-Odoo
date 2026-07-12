import { defineRoute } from "@/middleware/compose";
import { created } from "@/lib/apiResponse";
import { setAuthCookies } from "@/lib/cookies";
import { authService } from "@/modules/auth/auth.service";
import { signupSchema, type SignupInput } from "@/modules/auth/auth.schema";
import { config } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = defineRoute<SignupInput>(
  { bodySchema: signupSchema, rateLimit: config.authRateLimit },
  async ({ body }) => {
    const { user, tokens } = await authService.signup(body);
    const res = created(user);
    setAuthCookies(res, tokens);
    return res;
  },
);
