import styles from "../../../styles/tables/Table02.module.css";
import ModalLoading from "../modals/ModalLoading";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useState } from "react";

export default function Table02AdminDb({
  data,
  columns,
  selectedRowId = null,
  loading = false,
}) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  if (!columns || columns.length === 0) {
    console.warn("No valid columns passed to Table01");
    return null;
  }
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    autoResetPageIndex: false, // ✅ ADD THIS
  });
  // {loading && <ModalLoading isVisible={true} sizeOfParent={true} />}
  // console.log("Header Groups:", table.getHeaderGroups());
  return loading ? (
    <div className={styles.divTableMain}>
      <ModalLoading isVisible={true} sizeOfParent={true} />
    </div>
  ) : (
    // <div className={styles.divRequestTableGroup}>
    <div className={styles.divTableMain}>
      <div className={styles.divTableButtonsAndInputs}>
        <div className={styles.divShowRows}>
          Show rows:{" "}
          {[5, 10, 20].map((size) => (
            <button
              key={size}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageSize: size,
                  pageIndex: 0,
                }))
              }
            >
              {size}
            </button>
          ))}
        </div>
        <div className={styles.divInputSearchbar}>
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={styles.inputSearchbar}
            placeholder="Search..."
          />
        </div>
        <div className={styles.divPagination}>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"} Prev
          </button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next {">"}
          </button>
        </div>
      </div>

      <table className={styles.tableRequest}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            // <tr key={headerGroup.id} className={styles.tableRequestHeader}>
            <tr key={headerGroup.id} className={styles.tableRequestHeader}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: "pointer" }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: " ▲",
                    desc: " ▼",
                  }[header.column.getIsSorted()] ?? ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {/* <div className={styles.divLine}></div> */}
        <tbody>
          {table.getPaginationRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`${
                row.original.id === selectedRowId ? styles.selectedRow : ""
              } ${row.original.isApproved && styles.approvedRow}`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
