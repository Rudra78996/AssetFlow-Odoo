import { Prisma } from "@prisma/client";

// Retry helper for the highest-contention write paths (allocation/booking).
// Mongo aborts one side of two concurrent transactions that touch the same doc;
// Prisma surfaces that as P2034. We retry a few times with jittered backoff.
export async function withTxRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const isConflict =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034";
      if (!isConflict || i === attempts - 1) throw err;
      lastErr = err;
      await new Promise((r) => setTimeout(r, 25 * (i + 1) + Math.random() * 25));
    }
  }
  throw lastErr;
}
