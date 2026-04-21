import { createColumnHelper } from "@tanstack/react-table"
import type { Customer } from "@/types/customer"
import {  Pencil, Trash2 } from "lucide-react"

const columnHelper = createColumnHelper<Customer>()

export const getColumnsCustomers = (onEdit: any, onDelete: any) => [

  columnHelper.display ({
    id: "index",
    header: "N°",
    cell: ({row}) => row.index + 1
  }),
  
  columnHelper.accessor("name", { header: "Nombre" }),
  columnHelper.accessor("ci", { header: "Cédula" }),
  columnHelper.accessor("celphone", { header: "Teléfono" }),
  columnHelper.accessor("reference", { header: "Referencia" }),
  columnHelper.accessor("ciudad", { header: "Ciudad" }),

  columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-4">
        <button onClick={() => onEdit(row.original)} className="mr-2 text-green-700"><Pencil size={18}/></button>
        <button onClick={() => onDelete(row.original)} className="mr-2 text-red-600"><Trash2 size={18}/></button>
      </div>
    )
  })
]