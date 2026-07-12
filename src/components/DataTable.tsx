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

export interface FilterDropdown {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  density?: "compact" | "standard" | "relaxed";
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filters?: React.ReactNode;
  filterDropdowns?: FilterDropdown[];
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  density = "standard",
  searchable = false,
  searchPlaceholder = "Search...",
  searchKeys,
  filters,
  filterDropdowns,
  pagination = false,
  pageSize = 10,
  emptyMessage = "No data available",
  onRowClick,
  loading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  let filtered = data;
  if (searchable && search) {
    filtered = data.filter((row) => {
      const keys = searchKeys || (Object.keys(row) as (keyof T)[]);
      return keys.some((key) =>
        String(row[key] || "").toLowerCase().includes(search.toLowerCase())
      );
    });
  }

  if (filterDropdowns) {
    filtered = filtered.filter((row) => {
      return Object.entries(selectedFilters).every(([key, val]) => {
        if (!val) return true;
        const rowValue = String((row as Record<string, unknown>)[key] || "");
        return rowValue.toLowerCase() === val.toLowerCase();
      });
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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 3; i <= totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col">
      {(searchable || filters || filterDropdowns) && (
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-outline-variant">
          {searchable && (
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="input-field pl-9"
              />
            </div>
          )}
          {filterDropdowns &&
            filterDropdowns.map((filter) => (
              <select
                key={filter.key}
                value={selectedFilters[filter.key] || ""}
                onChange={(e) => {
                  setSelectedFilters((prev) => ({ ...prev, [filter.key]: e.target.value }));
                  setCurrentPage(1);
                }}
                className="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer"
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}
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
            {loading ? (
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <tr key={`skeleton-row-${rowIndex}`} className="border-b border-outline-variant/30 animate-pulse">
                  {columns.map((col) => (
                    <td key={`skeleton-cell-${col.key}`} className={densityClass}>
                      <div className="h-4 bg-surface-container-high rounded w-2/3" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
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
            {getPageNumbers().map((page, idx) => {
              if (page === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-outline select-none">
                    &hellip;
                  </span>
                );
              }
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page as number)}
                  className={cn(
                    "w-8 h-8 rounded-md text-body-md transition-colors",
                    page === currentPage ? "bg-primary text-on-primary font-semibold" : "hover:bg-surface-container-low text-on-surface-variant"
                  )}
                >
                  {page}
                </button>
              );
            })}
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

