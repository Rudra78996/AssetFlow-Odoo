import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function generateAssetTag(existing: string[]): string {
  const maxNum = existing.reduce((max, tag) => {
    const num = parseInt(tag.replace("AF-", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `AF-${String(maxNum + 1).padStart(4, "0")}`;
}
