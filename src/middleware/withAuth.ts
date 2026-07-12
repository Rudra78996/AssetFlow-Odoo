import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";
import { verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { AuthUser } from "@/types";

export const ACCESS_COOKIE = "af_access";
export const REFRESH_COOKIE = "af_refresh";

// Verifies the access-token cookie, returns the authenticated user, and enforces
// the RBAC matrix. All role checks funnel through here — never scattered ad hoc.
export function authenticate(req: NextRequest, roles?: Role[]): AuthUser {
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) throw new UnauthorizedError();

  let payload: ReturnType<typeof verifyAccessToken>;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }

  const user: AuthUser = { id: payload.sub, role: payload.role, email: payload.email };
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    throw new ForbiddenError(`Requires one of roles: ${roles.join(", ")}`);
  }
  return user;
}
