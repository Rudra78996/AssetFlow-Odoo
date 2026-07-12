export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { setAuthCookies } from "@/lib/cookies";
import { authService } from "@/modules/auth/auth.service";
import { z } from "zod";

const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
});

type ChangeRoleInput = z.infer<typeof changeRoleSchema>;

export const POST = defineRoute<ChangeRoleInput>(
  { auth: true, bodySchema: changeRoleSchema },
  async ({ body, user }) => {
    const { user: updatedUser, tokens } = await authService.changeRole(user!.id, body.role);
    const res = ok(updatedUser);
    setAuthCookies(res, tokens);
    return res;
  },
);
