import { createColumnHelper } from "@tanstack/react-table"
import type { PagosolWithRelations } from "@/types/pagosol"
import { Eye, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<PagosolWithRelations>()

export const getColumnsPagossol= (
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


  // 🔹 Cuota inicial
  columnHelper.accessor("amount", {
    header: "Monto"
  }),


  // 🔹 Tipo pago
  columnHelper.accessor("type_pay", {
    header: "Tipo Pago"
  }),

  // 🔹 Detalle
  columnHelper.accessor("detail", {
    header: "Detalle"
  }),

    // 🔹 Cuenta
  columnHelper.accessor(
    row => row.cuentas?.numero_cta || "",
    {
      id: "cuenta",
      header: "Cuenta"
    }
  ),

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

