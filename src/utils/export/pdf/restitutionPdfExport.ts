import { exportToPDF } from "../exportPDF"
import type { RestitutionWithRelations } from "@/types/restitution"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB"
  }).format(value)
}

export const exportRestitucionesToPDF = (
  items: RestitutionWithRelations[],
  filterName: string,
  userName: string
) => {
  if (!items || items.length === 0) return

  // 1. Mapeo de filas del cuerpo del PDF
  const tableBody = items.map((item) => {
    const isRestitution = item.id_type_transaction === 9
    return [
      `#${item.id}`,
      item.branches?.name_branch || "Sin sucursal",
      item.employees?.name || "Sin empleado",
      item.customers?.name || "Sin cliente",
      item.type_pay || "S/P",
      formatCurrency(item.amount),
      item.confirmed_at ? new Date(item.confirmed_at).toLocaleDateString("es-BO") : "S/F",
      isRestitution ? "RESTITUIDO" : "DEPOSITADO"
    ]
  })

  // 2. Cálculo acumulado de totales
  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0)

  // 3. Inyección de fila de totales al final del body (Garantiza el estándar de 4 argumentos)
  tableBody.push(["", "", "", "", "", "", "", ""]) // Espacio en blanco
  tableBody.push(["", "", "", "", "TOTAL ACUMULADO:", formatCurrency(totalAmount), "", ""])

  exportToPDF({
    title: `REPORTE DE RESTITUCIONES - VISTA: ${filterName} (Usuario: ${userName})`,
    fileName: `Reporte_Restituciones_${filterName}_${new Date().getTime()}`,
    headers: [
      "ID TRANS.",
      "SUCURSAL",
      "EMPLEADO",
      "CLIENTE",
      "PAGO",
      "MONTO",
      "FECHA CONF.",
      "ESTADO"
    ],
    body: tableBody
  })
}
