import jwt from "jsonwebtoken";
import { config } from "./config";
import type { Role } from "@prisma/client";

export interface AccessTokenPayload {
  sub: string; // user id
  role: Role;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string; // rotation id — lets us detect refresh-token reuse
}

// TTLs come from env as strings (e.g. "15m"). Cast to the SignOptions expiresIn
// type — @types/jsonwebtoken v9 models it as a template-literal StringValue.
export function signAccessToken(payload: AccessTokenPayload): string {
  const opts: jwt.SignOptions = { expiresIn: config.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, opts);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const opts: jwt.SignOptions = { expiresIn: config.REFRESH_TOKEN_TTL as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
