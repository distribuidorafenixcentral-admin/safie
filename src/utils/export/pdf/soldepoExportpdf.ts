import { exportToPDF } from "../exportPDF"
import type { SoldepoWithRelations } from "@/types/soldepo"

// 🔥 Export específico de clientes
export const exportSoldepoToPDF = (
  solicitudes: SoldepoWithRelations[],
  user: string
) => {

  if (!solicitudes || solicitudes.length === 0) return

  exportToPDF({
    title: "REPORTE DE SOLICITUDES DE DEPOSITOS PENDIENTES",
    fileName: "Solicitudes de depositos pendientes",
    user,
 

    headers: ["N°", "TIPO", "SUCURSAL", "EMPLEADO", "VEHÍCULO", "CLIENTE", "CUOTA INICIAL", "DETALLE", "TIPO DE VENTA", "TIPO DE PAGO"],

    body: solicitudes.map((solicitud, index) => [
    index + 1,
    solicitud.type_transaction?.description || "",
    solicitud.branches?.name_branch || "",
    solicitud.employees?.name || "",
    solicitud.cars?.name || "",
    solicitud.customers?.name || "",  
    solicitud.amount,
    solicitud.detail,
    solicitud.type_sale,
    solicitud.type_pay

  ])
  })
}