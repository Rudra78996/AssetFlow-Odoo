import { RateLimitError } from "./errors";

// Lightweight fixed-window limiter backed by an in-process Map. Adequate for a
// single-node deploy and for blunting credential stuffing in dev; the README
// notes swapping in Redis (INCR + EXPIRE) for multi-instance production.
interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, opts: { windowMs: number; max: number }): void {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > opts.max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    throw new RateLimitError(`Rate limit exceeded. Retry in ${retryAfter}s`, { retryAfter });
  }
}

// Periodically drop expired buckets so the map does not grow unbounded.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }, 60_000);
  // Do not keep the event loop alive purely for cleanup.
  (timer as unknown as { unref?: () => void }).unref?.();
}
