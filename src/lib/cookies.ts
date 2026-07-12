import type { NextResponse } from "next/server";
import { config } from "./config";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/middleware/withAuth";
import type { TokenPair } from "@/modules/auth/auth.service";

// Tokens are delivered ONLY as httpOnly cookies — never in the JSON body — so
// client-side JS cannot read them (XSS-resistant).
const base = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: "lax" as const,
  domain: config.COOKIE_DOMAIN,
  path: "/",
};

export function setAuthCookies(res: NextResponse, tokens: TokenPair): void {
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...base, maxAge: 15 * 60 });
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: 7 * 24 * 60 * 60,
    path: "/api/auth", // refresh cookie only sent to auth endpoints
  });
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_COOKIE, "", { ...base, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { ...base, maxAge: 0, path: "/api/auth" });
}
