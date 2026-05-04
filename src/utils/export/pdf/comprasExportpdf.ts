import { exportToPDF } from "../exportPDF"
import type { CompraWithRelations } from "@/types/compra"

// 🔥 Export específico de compras
export const exportComprasToPDF = (
  compras: CompraWithRelations[],
  user: string
) => {

  if (!compras || compras.length === 0) return

  exportToPDF({
    title: "REPORTE DE COMPRAS",
    fileName: "Compras",
    user,
 

    headers: ["N°", "TIPO", "SUCURSAL", "EMPLEADO", "MONTO", "DETALLE"],

    body: compras.map((compras, index) => [
    index + 1,
    compras.type_transaction?.description || "",
    compras.branches?.name_branch || "",
    compras.employees?.name || "",
    compras.amount,
    compras.detail

  ])
  })
}