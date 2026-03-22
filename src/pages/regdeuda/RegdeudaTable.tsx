import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from "@tanstack/react-table"

import { Pencil, Eye } from "lucide-react"

type Regdeuda = {
  id: number
  created_at: string

  // Relaciones (FK)
  id_type_transaction?: { id: number; description: string }
  id_branch?: { id: number; name_branch: string }
  id_team?: { ci: string; name: string }    
  id_status?: { id: number; status: string }
  // Campos simples
  amount: number    
  detail: string
}

const columnHelper = createColumnHelper<Regdeuda>()

export default function RegdeudaTable({
  data,
  onView,
  onEdit,  
}: {
  data: Regdeuda[]
  onView: (row: Regdeuda) => void
  onEdit: (row: Regdeuda) => void  
}) {

  // Columnas a mostrar
  const columns = [

    columnHelper.accessor("id", {
      header: "ID",
    }),   

    columnHelper.accessor((row) => row.id_branch?.name_branch, {
      id: "branch",
      header: "Sucursal",
    }),

    columnHelper.accessor((row) => row.id_team?.name, {
      id: "deudor",
      header: "Personal",
    }),

    columnHelper.accessor("amount", {
      header: "Monto",
    }),

    columnHelper.accessor("detail", {
      header: "Detalle",
    }),

    columnHelper.display({
      id: "acciones",
      header: "Acciones",

      cell: ({ row }) => (

        <div className="flex gap-5">
          {/* BOTON PARA VER */}
          <button
            onClick={() => onView(row.original)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye size={18}/>
          </button>
          {/* BOTON PARA EDITAR */}
          <button
            onClick={() => onEdit(row.original)}
            className="text-green-600 hover:text-green-800"
          >
            <Pencil size={18}/>
          </button>       
        </div>
      )
    })

  ]

  const table = useReactTable({

    data,
    columns,

    initialState: {
      pagination: {
        pageSize: 5
      }
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()

  })

  return (

    <div className="mt-6">

      <table className="w-full border border-gray-200">

        <thead className="bg-gray-100">

          {table.getHeaderGroups().map((headerGroup) => (

            <tr key={headerGroup.id}>

              {headerGroup.headers.map((header) => (

                <th key={header.id} className="p-3 text-left font-semibold">

                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}

                </th>

              ))}

            </tr>

          ))}

        </thead>

        <tbody>

          {table.getRowModel().rows.map((row) => (

            <tr key={row.id} className="border-t hover:bg-gray-50">

              {row.getVisibleCells().map((cell) => (

                <td key={cell.id} className="p-3">

                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}

                </td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

      {/* PAGINACION */}

      <div className="flex items-center gap-3 mt-4">

        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 border rounded"
        >
          Anterior
        </button>

        <span>
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 border rounded"
        >
          Siguiente
        </button>

      </div>

    </div>
  )
}