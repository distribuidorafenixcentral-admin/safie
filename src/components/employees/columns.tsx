import { createColumnHelper, type ColumnDef } from "@tanstack/react-table" // 👈 Importamos ColumnDef
import type { EmployeeWithRelations } from "@/types/employees"
import { Pencil, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<EmployeeWithRelations>()

export const getColumnsEmployees = (
  onEdit: any, 
  onDelete: any, 
  idRole?: number | null
): ColumnDef<EmployeeWithRelations, any>[] => { // 👈 Forzamos el tipo de retorno correcto
  
  // 1. Definimos las columnas iniciales forzando el tipo compatible de TanStack
  const columns: ColumnDef<EmployeeWithRelations, any>[] = [
    columnHelper.display({
      id: "index",
      header: "N°",
      cell: ({ row }) => row.index + 1
    }),

    columnHelper.accessor("name", { header: "Nombre" }),
    columnHelper.accessor("ci", { header: "Cédula" }),
    columnHelper.accessor("celphone", { header: "Teléfono" }),
    columnHelper.accessor("start_date", { header: "Fecha de Inicio" }),
    columnHelper.accessor("reference", { header: "Referencia" }),
    columnHelper.accessor("celphone_ref", { header: "Teléfono Ref." }),
  ]

  // 2. Insertamos la sucursal solo si el usuario es Rol 1, Rol 2 o si aún no cargó el rol
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

  // 3. Insertamos el cargo
  columns.push(
    columnHelper.accessor(
      row => row.role?.role || "Sin rol",
      {
        id: "role",
        header: "Rol"
      }
    )
  )

  // 4. Insertamos los botones de control
  columns.push(
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
  )

  return columns
}
