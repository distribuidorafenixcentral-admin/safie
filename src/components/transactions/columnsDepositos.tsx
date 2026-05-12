import { createColumnHelper } from "@tanstack/react-table"
import type { DepositoWithRelations } from "@/types/deposito"
import { Eye, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<DepositoWithRelations>()

// Formateador nativo para importes de dinero
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB"
  }).format(value)
}

export const getColumnsDepositos = (
  onView: (deposito: DepositoWithRelations) => void,
  onDelete: (deposito: DepositoWithRelations) => void
) => [

  // 🔹 Correlativo
  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => <span className="font-medium text-gray-600">{row.index + 1}</span>
  }),

  // 🔹 Sucursal
  columnHelper.accessor(
    row => row.branches?.name_branch || "Sin sucursal",
    {
      id: "branch",
      header: "Sucursal"
    }
  ),

  // 🔹 Empleado
  columnHelper.accessor(
    row => row.employees?.name || "Sin empleado",
    {
      id: "employee",
      header: "Solicitante"
    }
  ),

  // 🔹 Cliente
  columnHelper.accessor(
    row => row.customers?.name || "Sin cliente",
    {
      id: "customer",
      header: "Cliente"
    }
  ),

  // 🔹 Vehículo
  columnHelper.accessor(
    row => row.cars?.name || "Sin vehículo",
    {
      id: "car",
      header: "Vehículo"
    }
  ),

  // 🔹 Precio final (Formateado como moneda)
  columnHelper.accessor(
    row => row.costo ?? row.cars?.cost ?? 0,
    {
      id: "precio",
      header: "Precio Final",
      cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span>
    }
  ),

  // 🔹 Cuota inicial (Monto a confirmar - Formateado como moneda)
  columnHelper.accessor("amount", {
    header: "Monto Depósito",
    cell: ({ getValue }) => <span className="font-semibold text-emerald-700">{formatCurrency(getValue())}</span>
  }),

  // 🔹 Tipo venta
  columnHelper.accessor("type_sale", {
    header: "Tipo Venta",
    cell: ({ getValue }) => (
      <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
        {getValue() || "No definido"}
      </span>
    )
  }),

  // 🔹 Tipo pago
  columnHelper.accessor("type_pay", {
    header: "Tipo Pago",
    cell: ({ getValue }) => getValue() || <span className="text-gray-400 italic">Pendiente</span>
  }),

  // 🔹 Detalle
  columnHelper.accessor("detail", {
    header: "Detalle",
    cell: ({ getValue }) => (
      <span className="block max-w-150 truncate" title={getValue()}>
        {getValue()}
      </span>
    )
  }),

  // 🔹 Acciones
  columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2 items-center justify-center">

        {/* Ver detalle / confirmar */}
        <button
          onClick={() => onView(row.original)}
          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
          title="Ver detalle y confirmar"
        >
          <Eye size={18} />
        </button>

        {/* Dar baja */}
        <button
          onClick={() => onDelete(row.original)}
          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
          title="Dar de baja depósito"
        >
          <Trash2 size={18} />
        </button>

      </div>
    )
  })
]
