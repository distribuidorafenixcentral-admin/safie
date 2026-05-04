import { createColumnHelper } from "@tanstack/react-table"
import type { CompraWithRelations } from "@/types/compra"
import { Eye, Printer } from "lucide-react"

const columnHelper = createColumnHelper<CompraWithRelations>()

export const getColumnsCompras = (onView: any, onPrint?: any) => [

  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => row.index + 1
  }),

  columnHelper.accessor("type_transaction", {
    id: "type_transaction",
    header: "Servicio",
    cell: info => info.getValue()?.description || "Sin servicio"
  }),

  columnHelper.accessor("branches", {
    id: "branch",
    header: "Sucursal",
    cell: info => info.getValue()?.name_branch || "Sin sucursal"
  }),

  columnHelper.accessor("employees", {
    id: "employee",
    header: "Encargado",
    cell: info => info.getValue()?.name || "Sin empleado"
  }),

  columnHelper.accessor("amount", {
    header: "Monto",
    cell: info => Number(info.getValue()).toLocaleString()
  }),

  columnHelper.accessor("detail", {
    header: "Detalle"
  }),

  columnHelper.accessor("type_pay", {
    header: "Tipo de pago"
  }),

    columnHelper.accessor("cuentas", {
    header: "Cuenta",
     cell: info => {
      const val = info.getValue();
      if (!val?.numero_cta || !val?.banco || !val?.titular) return "Sin Información";
      
      return val.numero_cta + " " + val.banco + " "  + val.titular;
    }
  }),

  columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-4">

        {/* VER DETALLE */}
        <button
          onClick={() => onView(row.original)}
          className="text-green-700"
        >
          <Eye size={18} />
        </button>

        {/* IMPRIMIR (solo ícono por ahora) */}
        <button
          onClick={() => onPrint?.(row.original)}
          className="text-blue-700"
        >
          <Printer size={18} />
        </button>

      </div>
    )
  })
]