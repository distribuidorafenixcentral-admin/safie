import { createColumnHelper } from "@tanstack/react-table"
import type { RestitutionWithRelations } from "@/types/restitution"
import { DollarSign } from "lucide-react"

const columnHelper = createColumnHelper<RestitutionWithRelations>()

// Formateador nativo para importes de dinero boliviano
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB"
  }).format(value)
}

// Formateador para mostrar solo la fecha (Sin horas)
const formatDateOnly = (dateString: string | null) => {
  if (!dateString) return "Sin fecha"
  const date = new Date(dateString)
  return date.toLocaleDateString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
}

export const getColumnsRestituciones = (
  onAction: (row: RestitutionWithRelations) => void,

) => [

  // 🔹 N° Correlativo
  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => <span className="font-medium text-gray-500">{row.index + 1}</span>
  }),

  // 🔹 Código de Transacción
  columnHelper.accessor("id", {
    header: "ID Trans.",
    cell: ({ getValue }) => <span className="font-mono text-xs text-slate-500">#{getValue()}</span>
  }),

  // 🔹 Sucursal
  columnHelper.accessor(row => row.branches?.name_branch || "Sin sucursal", {
    id: "branch",
    header: "Sucursal"
  }),

  // 🔹 Empleado Solicitante
  columnHelper.accessor(row => row.employees?.name || "Sin empleado", {
    id: "employee",
    header: "Empleado"
  }),

  // 🔹 Cliente
  columnHelper.accessor(row => row.customers?.name || "Sin cliente", {
    id: "customer",
    header: "Cliente"
  }),

  // 🔹 Tipo Venta
  columnHelper.accessor("type_sale", {
    header: "Tipo Venta",
    cell: ({ getValue }) => getValue() || <span className="text-gray-400 italic">No aplica</span>
  }),

  // 🔹 Tipo Pago
  columnHelper.accessor("type_pay", {
    header: "Tipo Pago",
    cell: ({ getValue }) => getValue() || <span className="text-gray-400 italic">No aplica</span>
  }),

  // 🔹 Monto de la Transacción
  columnHelper.accessor("amount", {
    header: "Monto",
    cell: ({ getValue, row }) => {
      // Si la transacción es Tipo 9 (Restitución), se pinta de rojo para denotar salida de dinero
      const isRestitution = row.original.id_type_transaction === 11
      return (
        <span className={`font-bold ${isRestitution ? "text-rose-600" : "text-slate-800"}`}>
          {formatCurrency(getValue())}
        </span>
      )
    }
  }),

  // 🔹 Fecha de Confirmación (Mostrar SOLO fecha)
  columnHelper.accessor("confirmed_at", {
    header: "Fecha Conf.",
    cell: ({ getValue }) => <span>{formatDateOnly(getValue())}</span>
  }),

  // 🔹 Nota de Comisión
  columnHelper.accessor("commission_note", {
    header: "Nota Comisión",
    cell: ({ getValue }) => (
      <span className="block max-w-150 truncate text-xs text-gray-600" title={getValue() || ""}>
        {getValue() || <span className="text-gray-300 italic">Sin nota</span>}
      </span>
    )
  }),

  // 🔹 Nota de Restitución (Visible para auditoría en pestañas TODOS y PAGADOS)
  columnHelper.accessor("restitution_note", {
    header: "Detalle Restitución",
    cell: ({ getValue }) => (
      <span className="block max-w-150 truncate text-xs text-amber-800 font-medium" title={getValue() || ""}>
        {getValue() || "-"}
      </span>
    )
  }),

  // 🔹 Acciones (Icono de dinero en color rojo)
  columnHelper.display({
    id: "acciones",
    header: "Acción",
    cell: ({ row }) => {
      const item = row.original
      
      // Regla de Negocio: El botón solo se muestra si el registro es un depósito (Tipo 8),
      // cumple con el estado confirmado/comisión pagada, y no ha sido ya devuelto (id_restitution_status !== 2)
      const isEligibleForRestitution = 
        item.id_type_transaction === 8 && 
        item.id_restitution_status !== 2

      if (!isEligibleForRestitution) return <span className="text-xs text-gray-400 font-medium italic">Finalizado</span>

      return (
        <div className="flex justify-center">
          <button
            onClick={() => onAction(item)}
            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
            title="Procesar Devolución / Restitución de Fondos"
          >
            <DollarSign size={18} />
          </button>
        </div>
      )
    }
  })
]
