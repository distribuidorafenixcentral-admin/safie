import { exportToPDF } from "../exportPDF"
import type { CommissionDetail } from "@/types/commission"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB"
  }).format(value)
}

export const exportCommissionLiquidationToPDF = (
  items: CommissionDetail[],
  employeeName: string,
  totals: { calculated: number; discount: number; final: number }
) => {
  if (!items || items.length === 0) return

  // 1. Cuerpo de la tabla con estado PAGADO
  const tableBody = items.map((item) => [
    `#${item.id}`,
    item.confirmed_at ? new Date(item.confirmed_at).toLocaleDateString() : "S/F",
    formatCurrency(item.amount),
    formatCurrency(item.commission_paid_amount),
    "PAGADO"
  ])

  // 2. Filas de Totales (Monto final = amount)
  tableBody.push(["", "", "", "", ""]) 
  tableBody.push(["", "", "TOTAL CALCULADO:", formatCurrency(totals.calculated), ""])
  tableBody.push(["", "", "DESCUENTOS APLICADOS:", `-${formatCurrency(totals.discount)}`, ""])
  tableBody.push(["", "", "MONTO NETO PAGADO:", formatCurrency(totals.final), ""])
  
  // 3. Espacio para firmas (inyectado como filas al final del body)
  tableBody.push(["", "", "", "", ""])
  tableBody.push(["", "", "", "", ""])
  tableBody.push(["__________________________", "", "", "__________________________", ""])
  tableBody.push(["FIRMA EMPLEADO", "", "", "RECIBIDO POR", ""])

  // 4. Llamada a la utilidad global
  exportToPDF({
    title: `COMPROBANTE DE PAGO DE COMISIONES: ${employeeName.toUpperCase()}`,
    fileName: `Comprobante_Pago_${employeeName.replace(/\s+/g, '_')}`,
    headers: ["ID TRANS.", "FECHA", "MONTO VENTA", "COMISIÓN", "ESTADO"],
    body: tableBody
  })
}
