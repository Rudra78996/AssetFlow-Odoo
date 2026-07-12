import type { Role } from "@prisma/client";
import type { Logger } from "pino";
import type { NextRequest } from "next/server";

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
}

// Context handed to every route handler by defineRoute — fully typed body/query.
export interface RouteContext<B = unknown, Q = unknown> {
  req: NextRequest;
  params: Record<string, string>;
  query: Q;
  body: B;
  user: AuthUser | null;
  requestId: string;
  log: Logger;
  ip: string;
}
