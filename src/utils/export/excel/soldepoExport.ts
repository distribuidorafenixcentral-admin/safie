import type { SoldepoWithRelations } from "@/types/soldepo"
import { exportToExcel } from "../exportExcel"

// 📌 Export específico de solicitudes de depósito
export const exportSoldepoToExcel = (
  filteredSoldepo: SoldepoWithRelations[]
) => {

  // 🔒 Validar datos
  if (!filteredSoldepo || filteredSoldepo.length === 0) {
    console.warn("No existen solicitudes para exportar")
    return
  }

  // 🔥 Transformar datos
  const data = filteredSoldepo.map((item, index) => ({
    index: index + 1,

    tipo_transaccion:
      item.type_transaction?.description || "",

    sucursal:
      item.branches?.name_branch || "",

    empleado:
      item.employees?.name || "",

    vehiculo:
      item.cars?.name || "",

    cliente:
      item.customers?.name || "",

    precio:
      item.costo ?? item.cars?.cost ?? 0,

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

    fileName: "Solicitudes_depositos_pendientes",
    sheetName: "Solicitudes",

    title: "REPORTE DE SOLICITUDES DE DEPÓSITOS PENDIENTES",

    headers: [
      { key: "index", label: "N°" },
      { key: "tipo_transaccion", label: "TIPO DE TRANSACCIÓN" },
      { key: "sucursal", label: "SUCURSAL" },
      { key: "empleado", label: "EMPLEADO" },
       { key: "cliente", label: "CLIENTE" },
      { key: "vehiculo", label: "VEHÍCULO" },     
      { key: "precio", label: "PRECIO FINAL" },
      { key: "cuota_inicial", label: "CUOTA INICIAL" },
      { key: "detalle", label: "DETALLE" },
      { key: "tipo_venta", label: "TIPO DE VENTA" },
      { key: "tipo_pago", label: "TIPO DE PAGO" }
    ]
  })
}