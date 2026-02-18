"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Settings2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnConfig } from "@/lib/types";

interface DataTableProps {
  columns: ColumnConfig[];
  data: Record<string, string | number | null>[];
  selectedRowId: number | null;
  onRowSelect: (row: Record<string, string | number | null>) => void;
  onDelete?: (row: Record<string, string | number | null>) => void;
}

type SortDirection = "asc" | "desc" | null;

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function DataTable({
  columns,
  data,
  selectedRowId,
  onRowSelect,
  onDelete,
}: DataTableProps) {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    columns.forEach((col) => {
      if (col.visibleByDefault) defaults.add(col.key);
    });
    return defaults;
  });

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  // Reset state when table changes (columns change)
  const columnsKey = columns.map((c) => c.key).join(",");
  const [prevColumnsKey, setPrevColumnsKey] = useState(columnsKey);
  if (columnsKey !== prevColumnsKey) {
    setPrevColumnsKey(columnsKey);
    const defaults = new Set<string>();
    columns.forEach((col) => {
      if (col.visibleByDefault) defaults.add(col.key);
    });
    setVisibleColumns(defaults);
    setSortKey(null);
    setSortDir(null);
    setPage(0);
  }

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const displayColumns = columns.filter((col) => visibleColumns.has(col.key));

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedData = sortedData.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey)
      return <ArrowUpDown className="size-3 opacity-40" />;
    if (sortDir === "asc") return <ArrowUp className="size-3" />;
    return <ArrowDown className="size-3" />;
  };

  const rowStart = sortedData.length === 0 ? 0 : safePage * pageSize + 1;
  const rowEnd = Math.min((safePage + 1) * pageSize, sortedData.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Column Visibility Toggle */}
      <div className="flex items-center justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:text-foreground"
            >
              <Settings2 className="size-4" />
              <span>Columns</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56 border-border bg-card p-3"
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Toggle columns
            </p>
            <div className="flex flex-col gap-2">
              {columns.map((col) => (
                <label
                  key={col.key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <Checkbox
                    checked={visibleColumns.has(col.key)}
                    onCheckedChange={() => toggleColumn(col.key)}
                    className="border-border data-[state=checked]:border-kyber-purple data-[state=checked]:bg-kyber-purple"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
              {displayColumns.map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none text-muted-foreground"
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    <SortIcon columnKey={col.key} />
                  </span>
                </TableHead>
              ))}
              {onDelete && (
                <TableHead className="w-12 text-muted-foreground" />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={displayColumns.length + (onDelete ? 1 : 0)}
                  className="py-8 text-center text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              pagedData.map((row, idx) => {
                const rowId = row.id as number;
                const isSelected = selectedRowId === rowId;
                return (
                  <TableRow
                    key={rowId ?? idx}
                    className={cn(
                      "cursor-pointer border-border transition-colors",
                      isSelected
                        ? "bg-kyber-purple/15 hover:bg-kyber-purple/20"
                        : "hover:bg-secondary/40",
                    )}
                    onClick={() => onRowSelect(row)}
                    data-state={isSelected ? "selected" : undefined}
                  >
                    {displayColumns.map((col) => (
                      <TableCell key={col.key} className="text-foreground">
                        {row[col.key] != null ? String(row[col.key]) : "—"}
                      </TableCell>
                    ))}
                    {onDelete && (
                      <TableCell className="w-12">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                          }}
                          aria-label="Delete row"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {sortedData.length === 0
            ? "0 rows"
            : `Showing ${rowStart}–${rowEnd} of ${sortedData.length} row${sortedData.length !== 1 ? "s" : ""}`}
          {selectedRowId != null && " | 1 selected"}
        </p>

        <div className="flex items-center gap-4">
          {/* Rows per page */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Rows per page:</span>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setPageSize(size);
                  setPage(0);
                }}
                className={cn(
                  "rounded px-1.5 py-0.5 text-xs transition-colors",
                  pageSize === size
                    ? "bg-kyber-purple/20 text-foreground"
                    : "hover:text-foreground",
                )}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Prev / page count / Next */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 border-border px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setPage((p) => p - 1)}
              disabled={safePage === 0}
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </Button>
            <span className="min-w-[4rem] text-center text-xs text-muted-foreground">
              {safePage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 border-border px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setPage((p) => p + 1)}
              disabled={safePage >= totalPages - 1}
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
