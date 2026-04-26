import { createColumnHelper } from "@tanstack/react-table"
import type { SolicitudWithRelations } from "@/types/solicitudes"
import { Pencil, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<SolicitudWithRelations>()

export const getColumnsSolicitudes = (onEdit: any, onDelete: any) => [

  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => row.index + 1
  }),

    columnHelper.accessor(
        row => row.type_transaction?.description || "Sin servicio",
    {
      id: "type_transaction",
      header: "Servicio"
    }
    ),

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
      header: "Solicitante"
    }
    ),

    columnHelper.accessor("amount", { header: "Monto" }),
    columnHelper.accessor("detail", { header: "Detalle" }),

    columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-4">
        <button onClick={() => onEdit(row.original)} className="text-green-700">
          <Pencil size={18}/>
        </button>
        <button onClick={() => onDelete(row.original)} className="text-red-600">
          <Trash2 size={18}/>
        </button>
      </div>
    )
  })
]