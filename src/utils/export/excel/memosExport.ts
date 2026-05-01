import type { MemosWithRelations } from "@/types/memos"
import { exportToExcel } from "../exportExcel"

// 🔹 Export específico de memos
export const exportMemosToExcel = (filteredMemos: MemosWithRelations[]) => {

  // 🔥 Transformar datos (agregar correlativo)
  const data = filteredMemos.map((item, index) => ({
    index: index + 1, // 
    id_branch: item.branches?.name_branch || "",
    id_employee: item.employees?.name || "",
    amount: item.amount,
    detail: item.detail,  
    id_status: item.status_transaction?.status || "", 
  }))

  exportToExcel({
    data,
    fileName: "Memos",
    sheetName: "Memos",
    title: "REPORTE DE MEMOS",
    headers: [
      { key: "index", label: "N°" },
      { key: "id_branch", label: "SUCURSAL" },
      { key: "id_employee", label: "EMPLEADO" },
      { key: "amount", label: "MONTO" },
      { key: "detail", label: "DETALLE" },
    { key: "id_status", label: "ESTADO" }
    ]
  })
}