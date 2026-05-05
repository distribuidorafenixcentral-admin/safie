import { createColumnHelper } from "@tanstack/react-table"
import type { CommissionGroup } from "@/types/commission"
import { Eye } from "lucide-react"

const columnHelper = createColumnHelper<CommissionGroup>()

export const getColumnsCommissions = (onView: any) => [

  // N°
  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => row.index + 1
  }),

  // Sucursal
  columnHelper.accessor("branch_name", {
    header: "Sucursal"
  }),

  // Empleado
  columnHelper.accessor("employee_name", {
    header: "Empleado"
  }),

  // Cantidad de depósitos
  columnHelper.accessor("total_deposits", {
    header: "Depósitos"
  }),

  // Acción
  columnHelper.display({
    id: "acciones",
    header: "Acción",
    cell: ({ row }) => (
      <button
        onClick={() => onView(row.original)}
        className="text-blue-700"
      >
        <Eye size={18} />
      </button>
    )
  })

]