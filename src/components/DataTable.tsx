"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  density?: "compact" | "standard" | "relaxed";
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filters?: React.ReactNode;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  density = "standard",
  searchable = false,
  searchPlaceholder = "Search...",
  searchKeys,
  filters,
  pagination = false,
  pageSize = 10,
  emptyMessage = "No data available",
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  let filtered = data;
  if (searchable && search) {
    filtered = data.filter((row) => {
      const keys = searchKeys || (Object.keys(row) as (keyof T)[]);
      return keys.some((key) =>
        String(row[key] || "").toLowerCase().includes(search.toLowerCase())
      );
    });
  }

  if (sortKey) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = String((a as Record<string, unknown>)[sortKey] || "");
      const bVal = String((b as Record<string, unknown>)[sortKey] || "");
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = pagination ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize) : filtered;

  const densityClass = {
    compact: "px-3 py-2 text-[13px]",
    standard: "px-6 py-4 text-body-md",
    relaxed: "px-6 py-6 text-body-lg",
  }[density];

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="flex flex-col">
      {(searchable || filters) && (
        <div className="flex items-center gap-3 p-4 border-b border-outline-variant">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="input-field pl-9"
              />
            </div>
          )}
          {filters}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-surface-container-lowest z-10">
            <tr className="border-b border-outline-variant">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-left font-label-md text-label-md text-on-surface-variant whitespace-nowrap",
                    densityClass,
                    col.sortable && "cursor-pointer hover:text-on-surface",
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-on-surface-variant">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-outline-variant/50 transition-colors",
                    density === "compact" && i % 2 === 1 && "bg-surface-container-low/50",
                    onRowClick && "cursor-pointer hover:bg-surface-container-low"
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn(densityClass, col.className)}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] || "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-outline-variant">
          <p className="text-body-md text-on-surface-variant">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-outline-variant rounded-md disabled:opacity-40 hover:bg-surface-container-low"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-8 h-8 rounded-md text-body-md",
                  page === currentPage ? "bg-primary text-on-primary" : "hover:bg-surface-container-low"
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-outline-variant rounded-md disabled:opacity-40 hover:bg-surface-container-low"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

