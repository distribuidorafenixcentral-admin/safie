import { exportToPDF } from "../exportPDF"
import type { DepositoWithRelations } from "@/types/deposito"

// Formateador nativo para importes de dinero en el PDF
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB"
  }).format(value)
}

// 📌 Export específico de depósitos pendientes
export const exportDepositosToPDF = (
  depositos: DepositoWithRelations[],
  user: string
) => {

  // 🔒 Validar datos antes de disparar la generación
  if (!depositos || depositos.length === 0) return

  exportToPDF({
    title: "REPORTE DE SOLICITUDES DE DEPÓSITOS PENDIENTES",
    fileName: "Depositos_pendientes",
    user,

    headers: [
      "N°",
      "TIPO",
      "SUCURSAL",
      "EMPLEADO",
      "CLIENTE",
      "VEHÍCULO",
      "PRECIO FINAL",
      "CUOTA INICIAL",
      "DETALLE",
      "TIPO DE VENTA",
      "TIPO DE PAGO"
    ],

    body: depositos.map((deposito, index) => {
      const precioFinal = deposito.costo ?? deposito.cars?.cost ?? 0
      const cuotaInicial = deposito.amount ?? 0

      return [
        index + 1,
        deposito.type_transaction?.description || "Depósito",
        deposito.branches?.name_branch || "Sin sucursal",
        deposito.employees?.name || "Sin empleado",
        deposito.customers?.name || "Sin cliente",
        deposito.cars?.name ? `${deposito.cars.name} (${deposito.cars.modelo})` : "Sin vehículo",
        
        // 🏦 Valores financieros formateados como texto para las celdas del PDF
        formatCurrency(precioFinal),
        formatCurrency(cuotaInicial),
        
        deposito.detail || "",
        deposito.type_sale || "Pendiente",
        deposito.type_pay || "Pendiente"
      ]
    })
  })
}
