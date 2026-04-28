import type { DepositoWithRelations } from "@/types/deposito"
import { exportToExcel } from "../exportExcel"

// 📌 Export específico de depósitos pendientes
export const exportDepositosToExcel = (
  filteredDepositos: DepositoWithRelations[]
) => {

  // 🔒 Validar datos
  if (!filteredDepositos || filteredDepositos.length === 0) {
    console.warn("No existen depósitos para exportar")
    return
  }

  // 🔥 Transformar datos
  const data = filteredDepositos.map((item, index) => ({

    index: index + 1,

    tipo_transaccion:
      item.type_transaction?.description || "",

    sucursal:
      item.branches?.name_branch || "",

    empleado:
      item.employees?.name || "",

    cliente:
      item.customers?.name || "",

    vehiculo:
      item.cars?.name || "",

    // 🔹 Precio final negociado
    precio_final:
      item.costo ?? item.cars?.cost ?? 0,

    // 🔹 Cuota inicial
    cuota_inicial:
      item.amount,

    detalle:
      item.detail || "",

    tipo_venta:
      item.type_sale || "",

    tipo_pago:
      item.type_pay || ""
  }))

  // 📤 Exportar
  exportToExcel({
    data,

    fileName: "Depositos_pendientes",
    sheetName: "Depositos",

    title: "REPORTE DE SOLICITUDES DE DEPÓSITOS PENDIENTES",

    headers: [
      { key: "index", label: "N°" },
      {
        key: "tipo_transaccion",
        label: "TIPO DE TRANSACCIÓN"
      },
      {
        key: "sucursal",
        label: "SUCURSAL"
      },
      {
        key: "empleado",
        label: "EMPLEADO"
      },
      {
        key: "cliente",
        label: "CLIENTE"
      },
      {
        key: "vehiculo",
        label: "VEHÍCULO"
      },
      {
        key: "precio_final",
        label: "PRECIO FINAL"
      },
      {
        key: "cuota_inicial",
        label: "CUOTA INICIAL"
      },
      {
        key: "detalle",
        label: "DETALLE"
      },
      {
        key: "tipo_venta",
        label: "TIPO DE VENTA"
      },
      {
        key: "tipo_pago",
        label: "TIPO DE PAGO"
      }
    ]
  })
}

