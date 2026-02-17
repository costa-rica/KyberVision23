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
import { Settings2, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
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

  // Reset visible columns when columns change (table switch)
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

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey)
      return <ArrowUpDown className="size-3 opacity-40" />;
    if (sortDir === "asc") return <ArrowUp className="size-3" />;
    return <ArrowDown className="size-3" />;
  };

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
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={displayColumns.length + (onDelete ? 1 : 0)}
                  className="py-8 text-center text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, idx) => {
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

      {/* Row count */}
      <p className="text-xs text-muted-foreground">
        {sortedData.length} row{sortedData.length !== 1 ? "s" : ""}
        {selectedRowId != null && " | 1 selected"}
      </p>
    </div>
  );
}
