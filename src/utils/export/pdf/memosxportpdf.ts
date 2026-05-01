import { exportToPDF } from "../exportPDF"
import type { MemosWithRelations } from "@/types/memos"

// 🔥 Export específico de memos
export const exportMemosToPDF = (
  memos: MemosWithRelations[],
  user: string
) => {

  if (!memos || memos.length === 0) return

  exportToPDF({
    title: "REPORTE DE SANCIONES Y MEMOS",
    fileName: "memorandums",
    user,
 

    headers: ["N°", "SUCURSAL", "EMPLEADO", "MONTO", "DETALLE", "ESTADO"],

    body: memos.map((memos, index) => [
    index + 1,
    memos.branches?.name_branch || "",
    memos.employees?.name || "",
    memos.amount,
    memos.detail,
     memos.status_transaction?.status || "",

  ])
  })
}