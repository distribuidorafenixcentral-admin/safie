import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import type { CustomerWithRelations } from "@/types/customer" // 👈 Cambiado al tipo con relaciones
import { Pencil, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<CustomerWithRelations>()

export const getColumnsCustomers = (
  onEdit: any, 
  onDelete: any,
  idRole?: number | null // 👈 Recibe el rol del usuario actual
): ColumnDef<CustomerWithRelations, any>[] => {

  const columns: ColumnDef<CustomerWithRelations, any>[] = [
    columnHelper.display({
      id: "index",
      header: "N°",
      cell: ({ row }) => row.index + 1
    }),
    
    columnHelper.accessor("name", { header: "Nombre" }),
    columnHelper.accessor("ci", { header: "Cédula" }),
    columnHelper.accessor("celphone", { header: "Teléfono" }),
    columnHelper.accessor("reference", { header: "Referencia" }),
    columnHelper.accessor("ciudad", { header: "Ciudad" }),
  ]

  // 🔥 Si el usuario es Admin Global (1 o 2) o no ha cargado el rol, incluimos la columna Sucursal
  if (idRole === 1 || idRole === 2 || !idRole) {
    columns.push(
      columnHelper.accessor(
        row => row.branch?.name_branch || "Sin sucursal",
        {
          id: "branch",
          header: "Sucursal"
        }
      )
    )
  }

  // Insertar columna de Acciones al final
  columns.push(
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-4">
          <button onClick={() => onEdit(row.original)} className="mr-2 text-green-700">
            <Pencil size={18}/>
          </button>
          <button onClick={() => onDelete(row.original)} className="mr-2 text-red-600">
            <Trash2 size={18}/>
          </button>
        </div>
      )
    })
  )

  return columns
}
