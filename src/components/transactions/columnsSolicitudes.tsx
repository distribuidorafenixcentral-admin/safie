import { createColumnHelper } from "@tanstack/react-table"
import type { SolicitudWithRelations } from "@/types/solicitudes"
import { Pencil, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<SolicitudWithRelations>()

export const getColumnsSolicitudes = (
  onEdit: (row: SolicitudWithRelations) => void, // 👈 Tipado estricto
  onDelete: (row: SolicitudWithRelations) => void // 👈 Tipado estricto
) => [
  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => <span className="text-gray-500">{row.index + 1}</span>
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

  columnHelper.accessor("amount", { 
    header: "Monto",
    // 👈 Formateador decimal y alineación visual limpia con Tailwind
    cell: ({ getValue }) => (
      <span className="font-mono block text-right pr-4">
        {new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2 }).format(getValue())}
      </span>
    )
  }),

  columnHelper.accessor("detail", { header: "Detalle" }),

  columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center">
        <button 
          onClick={() => onEdit(row.original)} 
          className="text-green-700 hover:text-green-900 transition-colors"
          title="Editar"
        >
          <Pencil size={18}/>
        </button>
        <button 
          onClick={() => onDelete(row.original)} 
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={18}/>
        </button>
      </div>
    )
  })
]
