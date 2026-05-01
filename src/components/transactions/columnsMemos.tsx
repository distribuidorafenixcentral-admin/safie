import { createColumnHelper } from "@tanstack/react-table"
import type { MemosWithRelations } from "@/types/memos"
import { Pencil, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<MemosWithRelations>()

export const getColumnsMemos = (onEdit: any, onDelete: any) => [

  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => row.index + 1
  }),

  columnHelper.accessor(
    row => row.branches?.name_branch || "Sin sucursal",
    {
      id: "name_branch",
      header: "Sucursal"
    }
  ),

  columnHelper.accessor(
    row => row.employees?.name || "Sin empleado",
    {
      id: "id_employee",
      header: "Trabajador"
    }
  ),

  columnHelper.accessor("amount", { header: "Monto" }),

  columnHelper.accessor("detail", { header: "Detalle" }),

  columnHelper.accessor(
    row => row.status_transaction?.status || "Sin Estado",
    {
      id: "id_s",
      header: "Estado"
    }
  ),

  columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {

      const isPaid = row.original.id_status === 2

      return (
        <div className="flex gap-4">
          <button
            onClick={() => !isPaid && onEdit(row.original)}
            disabled={isPaid}
            className="text-green-700 disabled:text-gray-400"
          >
            <Pencil size={18}/>
          </button>

          <button
            onClick={() => !isPaid && onDelete(row.original)}
            disabled={isPaid}
            className="text-red-600 disabled:text-gray-400"
          >
            <Trash2 size={18}/>
          </button>
        </div>
      )
    }
  })
]