export interface ColumnConfig {
  key: string;
  label: string;
  type: "text" | "number" | "email" | "date" | "select";
  visibleByDefault: boolean;
  selectOptions?: string[];
}
