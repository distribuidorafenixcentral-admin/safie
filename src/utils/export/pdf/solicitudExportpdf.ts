import { exportToPDF } from "../exportPDF"
import type { SolicitudWithRelations } from "@/types/solicitudes"

// 🔥 Export específico de clientes
export const exportSolicitudesToPDF = (
  solicitudes: SolicitudWithRelations[],
  user: string
) => {

  if (!solicitudes || solicitudes.length === 0) return

  exportToPDF({
    title: "REPORTE DE SOLICITUDES",
    fileName: "Solicitudes",
    user,
 

    headers: ["N°", "TIPO", "SUCURSAL", "EMPLEADO", "MONTO", "DETALLE"],

    body: solicitudes.map((solicitud, index) => [
    index + 1,
    solicitud.type_transaction?.description || "",
    solicitud.branches?.name_branch || "",
    solicitud.employees?.name || "",
    solicitud.amount,
    solicitud.detail

  ])
  })
}