import { exportToPDF } from "../exportPDF"
import type { ClosureReportPayload } from "@/types/closure"

// Formateador monetario nativo para Bolivianos (Bs.)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB"
  }).format(value)
}

export const exportClosureToPDF = (
  report: ClosureReportPayload,
  userName: string
) => {
  if (!report || !report.rows) return

  // 1. Mapear las filas agregadas con el N° nominal del 1 al que exista
  const tableBody = report.rows.map((row, index) => [
    index + 1,                                       // N° Nominal
    new Date(report.generated_at).toLocaleDateString("es-BO"), // Fecha corta
    row.type_transaction_description.toUpperCase(),  // Tipo de transacción
    row.count,                                       // Cantidad de transacciones del mismo tipo
    row.ingreso > 0 ? formatCurrency(row.ingreso) : "-", // Ingreso si aplica
    row.egreso > 0 ? formatCurrency(row.egreso) : "-"    // Egreso si aplica
  ])

  // 2. Inyectar filas de espacio y balances al final del body para mantener los 4 argumentos
  tableBody.push(["", "", "", "", "", ""]) // Línea en blanco separadora
  tableBody.push(["", "", "TOTAL GENERAL INGRESOS:", "", formatCurrency(report.total_ingresos), ""])
  tableBody.push(["", "", "TOTAL GENERAL EGRESOS:", "", "", formatCurrency(report.total_egresos)])
  tableBody.push(["", "", "BALANCE NETO DE CAJA:", "", formatCurrency(report.balance_neto), ""])
  
  // 3. Espacio formal para firmas de auditoría
  tableBody.push(["", "", "", "", "", ""])
  tableBody.push(["", "", "", "", "", ""])
  tableBody.push(["___________________________", "", "", "", "___________________________", ""])
  tableBody.push(["FIRMA CAJERO / OPERADOR", "", "", "", "AUTORIZADO POR: " + userName.toUpperCase(), ""])

  // 4. Invocar la utilidad nativa con sus 4 propiedades conocidas
  exportToPDF({
    title: `COMPROBANTE OFICIAL DE CIERRE ${report.period} - CAJA GENERAL`,
    fileName: `Cierre_${report.period}_${new Date().toISOString().split('T')[0]}`,
    headers: [
      "N°",
      "FECHA",
      "TIPO DE TRANSACCIÓN",
      "CANTIDAD",
      "INGRESO",
      "EGRESO"
    ],
    body: tableBody
  })
}
