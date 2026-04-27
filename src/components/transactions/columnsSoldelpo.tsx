import { createColumnHelper } from "@tanstack/react-table"
import type { SoldepoWithRelations } from "@/types/soldepo"
import { Pencil, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<SoldepoWithRelations>()

export const getColumnsSoldepo = (onEdit: any, onDelete: any) => [

  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => row.index + 1
  }),

    columnHelper.accessor(
        row => row.branches?.name_branch || "Sin sucursal",
    {
      id: "id_branch",
      header: "Sucursal"
    }
    ),
    columnHelper.accessor(
        row => row.employees?.name || "Sin empleado",
    {
      id: "id_employee",
      header: "Solicitante"
    }
    ),

    columnHelper.accessor("type_sale", { header: "Tipo de Venta" }),
    columnHelper.accessor("amount", {
      header: "Cuota Inicial",
      cell: (info) => `Bs ${info.getValue()}`,
    }),
    columnHelper.accessor("type_pay", { header: "Tipo de Pago" }),
   

    columnHelper.accessor(
        row => row.cars?.name || "Sin vehiculo",
    {
      id: "car",
      header: "Vehículo"
    }
    ),

   columnHelper.accessor(
  row => row.cars?.cost ?? null,
  {
    id: "costo",
    header: "Precio",
    cell: ({ getValue }) => {
      const value = getValue()
      return value !== null
        ? `$. ${Number(value).toLocaleString()}`
        : "Sin precio"
    }
  }
),

    columnHelper.accessor(
        row => row.customers?.name || "Sin cliente",
    {
      id: "id_customer",
      header: "Cliente"
    }
    ),

    columnHelper.accessor("detail", { header: "Detalle" }),


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
]