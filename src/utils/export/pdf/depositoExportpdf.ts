import { exportToPDF } from "../exportPDF"
import type { DepositoWithRelations } from "@/types/deposito"

// 📌 Export específico de depósitos pendientes
export const exportDepositosToPDF = (
  depositos: DepositoWithRelations[],
  user: string
) => {

  // 🔒 Validar datos
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

    body: depositos.map((deposito, index) => [
      index + 1,

      deposito.type_transaction?.description || "",

      deposito.branches?.name_branch || "",

      deposito.employees?.name || "",

      deposito.customers?.name || "",

      deposito.cars?.name || "",

      // 🔹 Precio final negociado
      deposito.costo ?? deposito.cars?.cost ?? 0,

      // 🔹 Cuota inicial
      deposito.amount,

      deposito.detail || "",

      deposito.type_sale || "",

      deposito.type_pay || ""
    ])
  })
}

