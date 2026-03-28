import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from "@tanstack/react-table"

import { Trash, DollarSign } from "lucide-react"

type Deposito = {
  id: number
  created_at: string

  // Relaciones (FK)
  id_type_transaction?: { id: number; description: string }
  id_branch?: { id: number; name_branch: string }
  id_team?: { ci: string; name: string }
  id_type_sale?: { id: number; atype?: string }
  id_type_pay?: { id: number; type_p?: string }
  id_customer?: { ci: string; name?: string }
  id_car?: { id: number; name?: string, cost?: number }
  id_status?: { id: number; status: string }
  // Campos simples
  amount: number    
  c_inicial: number
  detail: string
}

const columnHelper = createColumnHelper<Deposito>()

export default function ComisionTable({
  data,  
  onEdit,
  onDelete
}: {
  data: Deposito[]  
  onEdit: (row: Deposito) => void
  onDelete: (row: Deposito) => void
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
      id: "asesor",
      header: "Asesor",
    }),

    columnHelper.accessor((row) => row.id_type_sale?.atype, {
      id: "tventa",
      header: "Venta",
    }),

    columnHelper.accessor((row) => row.id_type_pay?.type_p, {
      id: "tpago",
      header: "Pago",
    }),

    columnHelper.accessor((row) => row.id_customer?.name, {
      id: "cliente",
      header: "Cliente",
    }),

    columnHelper.accessor((row) => row.id_car?.name, {
      id: "Vehiculo",
      header: "Vehiculo",
    }),

    columnHelper.accessor((row) => row.id_car?.cost, {
      id: "amount",
      header: "Costo"
    }),

    columnHelper.accessor("c_inicial", {
      header: "Inicial",
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
            onClick={() => onEdit(row.original)}
            className="text-green-600 hover:text-purple-800"
            title="Verificar datos del deposito"
          >
            <DollarSign size={20}/>
          </button>       
          {/* BOTON PARA DAR DE BAJA EL DEPOSITO */}
          <button
            onClick={() => onDelete(row.original)}
            className="text-red-600 hover:text-purple-800"
            title="Baja"
          >
            <Trash size={20}/>
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