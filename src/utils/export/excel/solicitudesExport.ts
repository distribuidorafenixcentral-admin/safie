import type { SolicitudWithRelations } from "@/types/solicitudes"
import { exportToExcel } from "../exportExcel"

// 🔹 Export específico de sucursales
export const exportSolicitudesToExcel = (filteredSolicitudes: SolicitudWithRelations[]) => {

  // 🔥 Transformar datos (agregar correlativo)
  const data = filteredSolicitudes.map((item, index) => ({
    index: index + 1, // 
    id_type_transaction: item.type_transaction?.description || "",
    id_branch: item.branches?.name_branch || "",
    id_employee: item.employees?.name || "",
    amount: item.amount,
    detail: item.detail,   
  }))

  exportToExcel({
    data,
    fileName: "Solicitudes",
    sheetName: "Solicitudes",
    title: "REPORTE DE SOLICITUDES",
    headers: [
      { key: "index", label: "N°" },
      { key: "id_type_transaction", label: "TIPO DE TRANSACCIÓN" },
      { key: "id_branch", label: "SUCURSAL" },
      { key: "id_employee", label: "EMPLEADO" },
      { key: "amount", label: "MONTO" },
      { key: "detail", label: "DETALLE" }
    ]
  })
}