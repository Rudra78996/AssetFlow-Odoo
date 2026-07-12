import type { PageMeta } from "./apiResponse";

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
  search?: string;
}

// Single shared implementation used by every list endpoint (no copy-paste).
export function resolvePagination(query: Record<string, string | undefined>): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const rawLimit = Number(query.limit) || 20;
  const limit = Math.min(100, Math.max(1, rawLimit)); // cap at 100
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
  return {
    page,
    limit,
    sortBy: query.sortBy || undefined,
    sortOrder,
    search: query.search?.trim() || undefined,
  };
}

export function skipTake(p: PaginationParams) {
  return { skip: (p.page - 1) * p.limit, take: p.limit };
}

export function buildMeta(total: number, p: PaginationParams): PageMeta {
  return { page: p.page, limit: p.limit, total, totalPages: Math.ceil(total / p.limit) || 0 };
}

// Case-insensitive contains filter across several fields (Prisma OR composition).
export function searchOr(fields: string[], search?: string) {
  if (!search) return undefined;
  return fields.map((f) => ({ [f]: { contains: search, mode: "insensitive" as const } }));
}
