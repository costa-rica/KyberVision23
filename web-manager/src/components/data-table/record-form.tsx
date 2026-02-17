"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Plus, Save, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnConfig } from "@/lib/types";

interface RecordFormProps {
  columns: ColumnConfig[];
  selectedRow: Record<string, string | number | null> | null;
  onAdd: (record: Record<string, string | number | null>) => void;
  onUpdate: (record: Record<string, string | number | null>) => void;
  onClear: () => void;
}

export function RecordForm({
  columns,
  selectedRow,
  onAdd,
  onUpdate,
  onClear,
}: RecordFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState<
    Record<string, string | number | null>
  >({});

  // Populate form when a row is selected
  useEffect(() => {
    if (selectedRow) {
      setFormData({ ...selectedRow });
      setIsOpen(true);
    }
  }, [selectedRow]);

  // Reset form when columns change (table switch)
  const columnsKey = columns.map((c) => c.key).join(",");
  const [prevColumnsKey, setPrevColumnsKey] = useState(columnsKey);
  if (columnsKey !== prevColumnsKey) {
    setPrevColumnsKey(columnsKey);
    setFormData({});
  }

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClear = () => {
    setFormData({});
    onClear();
  };

  const handleAdd = () => {
    onAdd(formData);
    setFormData({});
  };

  const handleUpdate = () => {
    onUpdate(formData);
  };

  const isEditing = selectedRow != null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/30">
          <span className="text-sm font-medium text-foreground">
            {isEditing ? "Edit Record" : "Add Record"}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border px-4 pb-4 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {columns.map((col) => {
                const value = formData[col.key];
                const isIdField = col.key === "id";

                return (
                  <div key={col.key} className="flex flex-col gap-1.5">
                    <Label
                      htmlFor={`form-${col.key}`}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {col.label}
                    </Label>
                    {col.type === "select" && col.selectOptions ? (
                      <Select
                        value={value != null ? String(value) : ""}
                        onValueChange={(v) => handleFieldChange(col.key, v)}
                      >
                        <SelectTrigger
                          id={`form-${col.key}`}
                          className="h-9 border-border bg-secondary/30 text-foreground"
                        >
                          <SelectValue placeholder={`Select ${col.label}`} />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-card">
                          {col.selectOptions.map((opt) => (
                            <SelectItem
                              key={opt}
                              value={opt}
                              className="text-foreground focus:bg-kyber-purple/15 focus:text-foreground"
                            >
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={`form-${col.key}`}
                        type={
                          col.type === "number"
                            ? "number"
                            : col.type === "email"
                              ? "email"
                              : col.type === "date"
                                ? "date"
                                : "text"
                        }
                        value={value != null ? String(value) : ""}
                        onChange={(e) =>
                          handleFieldChange(col.key, e.target.value)
                        }
                        disabled={isIdField && isEditing}
                        placeholder={col.label}
                        className="border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {!isEditing ? (
                <Button
                  onClick={handleAdd}
                  size="sm"
                  className="rounded-full bg-kyber-purple text-primary-foreground hover:bg-kyber-purple-hover"
                >
                  <Plus className="size-4" />
                  Add Row
                </Button>
              ) : (
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="rounded-full bg-kyber-purple text-primary-foreground hover:bg-kyber-purple-hover"
                >
                  <Save className="size-4" />
                  Update Row
                </Button>
              )}
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="rounded-full border-border text-muted-foreground hover:text-foreground"
              >
                <Eraser className="size-4" />
                Clear
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
