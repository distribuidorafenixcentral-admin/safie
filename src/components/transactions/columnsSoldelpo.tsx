import { createColumnHelper } from "@tanstack/react-table"
import type { SoldepoWithRelations } from "@/types/soldepo"
import { Pencil, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<SoldepoWithRelations>()

export const getColumnsSoldepo = (
  onEdit: (row: SoldepoWithRelations) => void, // 👈 Tipado estricto
  onDelete: (row: SoldepoWithRelations) => void // 👈 Tipado estricto
) => [
  columnHelper.display({
    id: "index",
    header: "N°",
    cell: ({ row }) => <span className="text-gray-500">{row.index + 1}</span>
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
    // 👈 Alineación financiera a la derecha y formateador de moneda nativo (Bs)
    cell: ({ getValue }) => (
      <span className="font-mono block text-right pr-2 font-semibold">
        {new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(getValue())}
      </span>
    )
  }),

  columnHelper.accessor("type_pay", { header: "Tipo de Pago" }),

  columnHelper.accessor(
    row => row.cars ? `${row.cars.marca} ${row.cars.name} (${row.cars.modelo})` : "Sin vehículo", // 👈 Mayor detalle del auto
    {
      id: "car",
      header: "Vehículo"
    }
  ),

  columnHelper.accessor(
    row => row.cars?.cost ?? null,
    {
      id: "costo",
      header: "Precio Catálogo",
      // 👈 Alineación financiera y formateador en Dólares ($) si existe
      cell: ({ getValue }) => {
        const value = getValue()
        return value !== null ? (
          <span className="font-mono block text-right pr-2">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)}
          </span>
        ) : (
          <span className="text-gray-400 italic block text-right pr-2">Sin precio</span>
        )
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
      <div className="flex gap-4 justify-center">
        <button 
          onClick={() => onEdit(row.original)} 
          className="text-green-700 hover:text-green-900 transition-colors"
          title="Editar"
        >
          <Pencil size={18}/>
        </button>
        <button 
          onClick={() => onDelete(row.original)} 
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={18}/>
        </button>
      </div>
    )
  })
]
