import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from "@tanstack/react-table"

import {  FileArchive } from "lucide-react"


type Transaction = {
  id: number
  created_at: string
  // Relaciones (FK)
  id_branch?: { id: number; name_branch: string }
  id_team?: { ci: string; name: string }
  id_type_pay?: { id: number; type_p?: string }
  id_cuenta?: { id: number; numero_cta: string; banco: string; titular: string }
  id_status?: { id: number; status: string }
  // Campos simples
  amount: number    
  detail: string
}

const columnHelper = createColumnHelper<Transaction>()

export default function MemosTable({
  data,
  onView
}: {
  data: Transaction[]
  onView: (row: Transaction) => void
}) {

  // columns deben estar dentro del componente
  const columns = [

    columnHelper.accessor("id", {
      header: "ID",
    }),

    columnHelper.accessor((row) => row.id_branch?.name_branch, {
      id: "branch",
      header: "Sucursal",
    }),

    columnHelper.accessor((row) => row.id_team?.name, {
      id: "team",
      header: "Personal",
    }),

    columnHelper.accessor((row) => row.id_type_pay?.type_p, {
      id: "tpago",
      header: "T.Pago",
    }),

    columnHelper.accessor((row) => row.id_cuenta?.banco, {
      id: "banco",
      header: "Banco",
    }),

    columnHelper.accessor((row) => row.id_cuenta?.numero_cta, {
      id: "cuenta",
      header: "N° Cuenta"
    }),

    columnHelper.accessor((row) => row.id_cuenta?.titular, {
      id: "titular",
      header: "Titular",
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

        <div className="flex gap-3">
          {/* BOTON PARA VER DETALLE PARA IMPRIMIR */}
          <button
            onClick={() => onView(row.original)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FileArchive size={18}/>
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

        <thead className="bg-blue-600 text-white">

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

            <tr key={row.id} className="border-t bg-white odd:bg-gray-300 hover:bg-blue-50">

              {row.getVisibleCells().map((cell) => (

                <td key={cell.id} className="p-3 m-6">

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