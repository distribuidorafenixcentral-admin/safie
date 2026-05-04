import { exportToPDF } from "../exportPDF"
import type { PagosolWithRelations } from "@/types/pagosol"

// 📌 Export específico de pagos pendientes
export const exportPagossolToPDF = (
  pagossol: PagosolWithRelations[],
  user: string
) => {

  // 🔒 Validar datos
  if (!pagossol || pagossol.length === 0) return

  exportToPDF({
    title: "REPORTE DE SOLICITUDES DE PAGOS PENDIENTES",
    fileName: "Pagos_pendientes",
    user,

    headers: [
      "N°",
      "TIPO",
      "SUCURSAL",
      "EMPLEADO",
      "DETALLE",
      "TIPO DE PAGO",
      "CUENTA"
    ],

    body: pagossol.map((pagos, index) => [
      index + 1,

      pagos.type_transaction?.description || "",
      pagos.branches?.name_branch || "",
      pagos.employees?.name || "",

      // 🔹 Cuota inicial
      pagos.amount,
      pagos.detail || "",
      pagos.type_pay || "",
      pagos.cuentas?.numero_cta + " - " + pagos.cuentas?.banco + " - " + pagos.cuentas?.titular
    ])
  })
}

