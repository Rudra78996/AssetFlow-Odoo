// Booking times are "HH:mm" strings (matches the frontend). These helpers keep
// all time math in one place so overlap detection and status computation agree.
export function parseHHmm(v: string): number {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}
