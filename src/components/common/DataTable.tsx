import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from "@tanstack/react-table"

// Tabla genérica
export function DataTable({ data, columns, pageSize = 10 }: any) {

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: { pageSize }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <div className="">

      <table className="w-full border border-gray-900">
        <thead className="bg-blue-600 text-white italic text-sm text-left">
          {table.getHeaderGroups().map(h => (
            <tr key={h.id} className="">
              {h.headers.map(header => (
                <th key={header.id} className="p-1 last:w-[10%] first:pl-4">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-t bg-gray-200 odd:bg-gray-300 hover:bg-gray-400">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-1 text-sm first:pl-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>

      {/* Paginación */}
      <div className="flex items-center gap-3 mt-4">
        <button onClick={() => table.previousPage()}
         disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 border rounded hover:bg-green-300 text-sm"
          >Anterior</button>
         <span className="text-sm">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </span>
        <button onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 border rounded hover:bg-green-300 text-sm"
        >Siguiente</button>
      </div>

      

    </div>
  )
}