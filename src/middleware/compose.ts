import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { Role } from "@prisma/client";
import type { ZodType, ZodTypeDef } from "zod";
import { childLogger } from "@/lib/logger";
import { handleError } from "./errorHandler";
import { authenticate } from "./withAuth";
import { validateBody, validateQuery } from "./withValidation";
import { rateLimit } from "@/lib/rateLimit";
import type { AuthUser, RouteContext } from "@/types";

interface RouteOptions<B, Q> {
  // true -> any authenticated user; Role[] -> those roles; undefined -> public.
  auth?: true | Role[];
  // Input generic is unknown because Zod defaults/transforms make the parsed
  // output type diverge from the raw request input type.
  bodySchema?: ZodType<B, ZodTypeDef, unknown>;
  querySchema?: ZodType<Q, ZodTypeDef, unknown>;
  rateLimit?: { windowMs: number; max: number };
}

type Handler<B, Q> = (ctx: RouteContext<B, Q>) => Promise<NextResponse> | NextResponse;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Composition helper: rate-limit -> auth/RBAC -> validation -> handler, wrapped
// in the global error handler. Route files stay a single declarative call.
export function defineRoute<B = unknown, Q = unknown>(
  opts: RouteOptions<B, Q>,
  handler: Handler<B, Q>,
) {
  return async (
    req: NextRequest,
    nextCtx?: { params?: Record<string, string | string[]> },
  ): Promise<NextResponse> => {
    const requestId = req.headers.get("x-request-id") ?? randomUUID();
    const log = childLogger(requestId);
    const ip = clientIp(req);
    try {
      if (opts.rateLimit) rateLimit(`${ip}:${new URL(req.url).pathname}`, opts.rateLimit);

      let user: AuthUser | null = null;
      if (opts.auth) user = authenticate(req, opts.auth === true ? undefined : opts.auth);

      const body = opts.bodySchema ? await validateBody(req, opts.bodySchema) : (undefined as B);
      const query = opts.querySchema ? validateQuery(req, opts.querySchema) : (undefined as Q);

      const params: Record<string, string> = {};
      for (const [k, v] of Object.entries(nextCtx?.params ?? {})) {
        params[k] = Array.isArray(v) ? v.join("/") : v;
      }

      const res = await handler({ req, params, query, body, user, requestId, log, ip });
      res.headers.set("x-request-id", requestId);
      return res;
    } catch (err) {
      const res = handleError(err, requestId, log);
      res.headers.set("x-request-id", requestId);
      return res;
    }
  };
}
