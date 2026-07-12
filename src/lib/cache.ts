// Tiny TTL cache for read-heavy dashboard/reports aggregates. In-memory is fine
// for single-node; README notes Redis for horizontal scale.
interface Entry<T> {
  value: T;
  expiresAt: number;
}
const store = new Map<string, Entry<unknown>>();

export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  const now = Date.now();
  if (hit && hit.expiresAt > now) return hit.value as T;
  const value = await fn();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidate(prefix?: string): void {
  if (!prefix) return store.clear();
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
}
