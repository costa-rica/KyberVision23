"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { RecordForm } from "@/components/data-table/record-form";
import { LoadingOverlay } from "@/components/loading-overlay";
import { Database } from "lucide-react";
import apiClient from "@/lib/api/client";
import type { ColumnConfig } from "@/lib/types";

type RowData = Record<string, string | number | null>;

const HIDDEN_COLUMNS = new Set(["createdAt", "updatedAt", "deletedAt", "password"]);

type ColumnMeta = { key: string; sequelizeType: string };

function sequelizeTypeToColumnType(seqType: string): ColumnConfig["type"] {
  switch (seqType) {
    case "boolean": return "boolean";
    case "integer":
    case "float":
    case "double":
    case "decimal":
    case "bigint":
      return "number";
    case "date":
    case "dateonly":
      return "date";
    default:
      return "text";
  }
}

function deriveColumns(rows: RowData[], columnMeta?: ColumnMeta[]): ColumnConfig[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  const typeMap = columnMeta
    ? Object.fromEntries(columnMeta.map((m) => [m.key, sequelizeTypeToColumnType(m.sequelizeType)]))
    : {};
  return keys.map((key) => ({
    key,
    label: key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim(),
    type: typeMap[key] ?? "text",
    visibleByDefault: !HIDDEN_COLUMNS.has(key),
  }));
}

export default function DashboardPage() {
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string>("");
  const [rows, setRows] = useState<RowData[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading tables...");
  const [error, setError] = useState<string | null>(null);

  // Fetch table names on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchTables() {
      try {
        const { data } = await apiClient.get("/admin-db/db-row-counts-by-table");
        if (cancelled) return;
        const names = (data.arrayRowCountsByTable as { tableName: string }[]).map(
          (t) => t.tableName
        );
        setTableNames(names);
        if (names.length > 0) {
          setActiveTable(names[0]);
        } else {
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load table list.");
          setLoading(false);
        }
      }
    }
    fetchTables();
    return () => { cancelled = true; };
  }, []);

  // Fetch table data when activeTable changes
  useEffect(() => {
    if (!activeTable) return;
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setLoadingMessage(`Loading ${activeTable}...`);
      setError(null);
      try {
        const { data } = await apiClient.get(`/admin-db/table/${activeTable}`);
        if (cancelled) return;
        const tableData = data.data as RowData[];
        setRows(tableData);
        setColumns(deriveColumns(tableData, data.columnMeta));
        setSelectedRow(null);
      } catch {
        if (!cancelled) setError(`Failed to load ${activeTable}.`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [activeTable]);

  const refreshTable = useCallback(async () => {
    if (!activeTable) return;
    setLoading(true);
    setLoadingMessage(`Refreshing ${activeTable}...`);
    try {
      const { data } = await apiClient.get(`/admin-db/table/${activeTable}`);
      const tableData = data.data as RowData[];
      setRows(tableData);
      setColumns(deriveColumns(tableData, data.columnMeta));
    } catch {
      setError(`Failed to refresh ${activeTable}.`);
    } finally {
      setLoading(false);
    }
  }, [activeTable]);

  const handleTableChange = (table: string) => {
    setActiveTable(table);
    setSelectedRow(null);
  };

  const handleRowSelect = useCallback(
    (row: RowData) => {
      if (selectedRow && selectedRow.id === row.id) {
        setSelectedRow(null);
      } else {
        setSelectedRow(row);
      }
    },
    [selectedRow]
  );

  const handleAdd = useCallback(
    async (record: RowData) => {
      setLoading(true);
      setLoadingMessage("Adding row...");
      try {
        await apiClient.put(`/admin-db/table-row/${activeTable}/null`, record);
        await refreshTable();
      } catch {
        setError("Failed to add row.");
        setLoading(false);
      }
    },
    [activeTable, refreshTable]
  );

  const handleUpdate = useCallback(
    async (record: RowData) => {
      setLoading(true);
      setLoadingMessage("Updating row...");
      try {
        await apiClient.put(
          `/admin-db/table-row/${activeTable}/${record.id}`,
          record
        );
        setSelectedRow(null);
        await refreshTable();
      } catch {
        setError("Failed to update row.");
        setLoading(false);
      }
    },
    [activeTable, refreshTable]
  );

  const handleDelete = useCallback(
    async (row: RowData) => {
      const confirmed = window.confirm(
        `Delete row with id ${row.id} from ${activeTable}?`
      );
      if (!confirmed) return;
      setLoading(true);
      setLoadingMessage("Deleting row...");
      try {
        await apiClient.delete(
          `/admin-db/table-row/${activeTable}/${row.id}`
        );
        if (selectedRow?.id === row.id) setSelectedRow(null);
        await refreshTable();
      } catch {
        setError("Failed to delete row.");
        setLoading(false);
      }
    },
    [activeTable, selectedRow, refreshTable]
  );

  const handleClear = useCallback(() => {
    setSelectedRow(null);
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <LoadingOverlay visible={loading} message={loadingMessage} />

      {/* Page header and table selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Database className="size-5 text-kyber-purple-light" />
          <h1 className="text-xl font-semibold text-foreground">
            {activeTable || "Database"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Table:</span>
          <Select value={activeTable} onValueChange={handleTableChange}>
            <SelectTrigger className="w-44 border-border bg-secondary/30 text-foreground">
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card">
              {tableNames.map((name) => (
                <SelectItem
                  key={name}
                  value={name}
                  className="text-foreground focus:bg-kyber-purple/15 focus:text-foreground"
                >
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      {/* CRUD Form */}
      <RecordForm
        columns={columns}
        selectedRow={selectedRow}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onClear={handleClear}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={rows}
        selectedRowId={selectedRow ? (selectedRow.id as number) : null}
        onRowSelect={handleRowSelect}
        onDelete={handleDelete}
      />
    </div>
  );
}
