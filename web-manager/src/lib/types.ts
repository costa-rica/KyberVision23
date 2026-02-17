export interface ColumnConfig {
  key: string;
  label: string;
  type: "text" | "number" | "email" | "date" | "select" | "boolean";
  visibleByDefault: boolean;
  selectOptions?: string[];
}
