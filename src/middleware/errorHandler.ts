import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import type { Logger } from "pino";
import { AppError } from "@/lib/errors";
import { fail } from "@/lib/apiResponse";

// Single place that converts any thrown value into the error envelope.
// - AppError subclasses -> their statusCode/code
// - ZodError -> 400 with flattened field errors
// - Prisma known errors -> mapped (P2002 unique -> 409, P2025 -> 404, P2034 -> 409)
// - anything else -> 500, stack logged but never leaked in prod
export function handleError(err: unknown, requestId: string, log: Logger) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) log.error({ err }, err.message);
    else log.warn({ code: err.code }, err.message);
    return fail(err.code, err.message, err.statusCode, err.details);
  }

  if (err instanceof ZodError) {
    return fail("VALIDATION_ERROR", "Request validation failed", 400, err.flatten());
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      return fail("CONFLICT", `A record with this ${target} already exists`, 409);
    }
    if (err.code === "P2025") return fail("NOT_FOUND", "Resource not found", 404);
    if (err.code === "P2034") {
      return fail("CONFLICT", "Write conflict, please retry", 409);
    }
    log.error({ err, code: err.code }, "Prisma known error");
    return fail("DB_ERROR", "Database error", 500);
  }

  log.error({ err }, "Unhandled error");
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error";
  return fail("INTERNAL_ERROR", message, 500);
}
