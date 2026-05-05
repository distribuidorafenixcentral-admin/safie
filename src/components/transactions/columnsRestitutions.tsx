import { createColumnHelper } from "@tanstack/react-table"
import type { RestitutionWithRelations } from "@/types/restitution"
import { Eye } from "lucide-react"

const columnHelper = createColumnHelper<RestitutionWithRelations & {
  max_available: number
}>()

export const getColumnsRestitutions = (onRestitute: any) => [

  // 🔢 INDEX
  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => row.index + 1
  }),

  // 🏢 SUCURSAL
  columnHelper.accessor("branches", {
    header: "Sucursal",
    cell: info => info.getValue()?.name_branch || "Sin sucursal"
  }),

  // 👤 EMPLEADO
  columnHelper.accessor("employees", {
    header: "Empleado",
    cell: info => info.getValue()?.name || "Sin empleado"
  }),

  // 💰 MONTO ORIGINAL
  columnHelper.accessor("amount", {
    header: "Monto",
    cell: info =>
      Number(info.getValue()).toLocaleString()
  }),

  // 🔁 RESTITUIDO
  columnHelper.accessor("restitution_amount", {
    header: "Devuelto",
    cell: info =>
      Number(info.getValue() || 0).toLocaleString()
  }),

  // 🟢 DISPONIBLE
  columnHelper.display({
    id: "available",
    header: "Disponible",
    cell: ({ row }) =>
      Number(row.original.max_available).toLocaleString()
  }),

  // 📊 ESTADO
  columnHelper.accessor("id_restitution_status", {
    header: "Estado",
    cell: info => {
      const value = info.getValue()

      if (value === 1) return "Sin devolución"
      if (value === 2) return "Parcial"
      if (value === 3) return "Total"

      return "—"
    }
  }),

  // ⚙️ ACCIONES
  columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {

      const isDisabled = row.original.max_available <= 0

      return (
        <button
          disabled={isDisabled}
          onClick={() => onRestitute(row.original)}
          className={`${
            isDisabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-700"
          }`}
          title={
            isDisabled
              ? "No hay saldo disponible"
              : "Realizar restitución"
          }
        >
          <Eye size={18} />
        </button>
      )
    }
  })

]