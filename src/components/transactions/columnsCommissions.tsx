import { createColumnHelper } from "@tanstack/react-table"
import type { CommissionGroup } from "@/types/commission"
import { Eye } from "lucide-react"

const columnHelper = createColumnHelper<CommissionGroup>()

export const getColumnsCommissions = (
  onView: (group: CommissionGroup) => void
) => [

  // 🔹 N° Correlativo
  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => (
      <span className="text-gray-500 font-medium">{row.index + 1}</span>
    )
  }),

  // 🔹 Sucursal
  columnHelper.accessor("branch_name", {
    header: "Sucursal",
    cell: ({ getValue }) => <span className="font-medium text-slate-700">{getValue()}</span>
  }),

  // 🔹 Empleado
  columnHelper.accessor("employee_name", {
    header: "Empleado",
    cell: ({ getValue }) => <span className="font-semibold text-blue-900">{getValue()}</span>
  }),

  // 🔹 Cantidad de depósitos (Visualmente destacado)
  columnHelper.accessor("total_deposits", {
    header: "Depósitos Pendientes",
    cell: ({ getValue }) => (
      <div className="flex justify-center">
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
          {getValue()}
        </span>
      </div>
    )
  }),

  // 🔹 Acción (Ver detalle / Liquidar)
  columnHelper.display({
    id: "acciones",
    header: "Acción",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <button
          onClick={() => onView(row.original)}
          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
          title="Ver detalle de comisiones"
        >
          <Eye size={18} />
        </button>
      </div>
    )
  })
]
