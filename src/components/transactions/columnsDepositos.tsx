import { createColumnHelper } from "@tanstack/react-table"
import type { DepositoWithRelations } from "@/types/deposito"
import { Eye, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<DepositoWithRelations>()

export const getColumnsDepositos = (
  onView: any,
  onDelete: any
) => [

  // 🔹 Correlativo
  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => row.index + 1
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

  // 🔹 Precio final
  columnHelper.accessor(
    row => row.costo ?? row.cars?.cost ?? 0,
    {
      id: "precio",
      header: "Precio Final"
    }
  ),

  // 🔹 Cuota inicial
  columnHelper.accessor("amount", {
    header: "Cuota Inicial"
  }),

  // 🔹 Tipo venta
  columnHelper.accessor("type_sale", {
    header: "Tipo Venta"
  }),

  // 🔹 Tipo pago
  columnHelper.accessor("type_pay", {
    header: "Tipo Pago"
  }),

  // 🔹 Detalle
  columnHelper.accessor("detail", {
    header: "Detalle"
  }),

  // 🔹 Acciones
  columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-4">

        {/* Ver detalle / confirmar */}
        <button
          onClick={() => onView(row.original)}
          className="text-blue-700"
        >
          <Eye size={18} />
        </button>

        {/* Dar baja */}
        <button
          onClick={() => onDelete(row.original)}
          className="text-red-600"
        >
          <Trash2 size={18} />
        </button>

      </div>
    )
  })
]

