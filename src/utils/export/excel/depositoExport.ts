import type { DepositoWithRelations } from "@/types/deposito"
import { exportToExcel } from "../exportExcel"

// 📌 Export específico de depósitos pendientes a Excel
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
    
    tipo_transaccion: item.type_transaction?.description || "Depósito",
    
    sucursal: item.branches?.name_branch || "Sin sucursal",
    
    empleado: item.employees?.name || "Sin empleado",
    
    cliente: item.customers?.name || "Sin cliente",
    
    // 🚗 Detalle extendido del vehículo
    vehiculo: item.cars?.name 
      ? `${item.cars.name} (${item.cars.modelo} - ${item.cars.marca})` 
      : "Sin vehículo",

    // 🏦 Valores numéricos puros (obligatorios para cálculos y fórmulas en Excel)
    precio_final: item.costo ?? item.cars?.cost ?? 0,
    
    cuota_inicial: item.amount ?? 0,

    detalle: item.detail || "",

    tipo_venta: item.type_sale || "Pendiente",

    tipo_pago: item.type_pay || "Pendiente"
  }))

  // 📤 Exportar utilizando el formateador base de tu proyecto
  exportToExcel({
    data,
    fileName: "Depositos_pendientes",
    sheetName: "Depositos",
    title: "REPORTE DE SOLICITUDES DE DEPÓSITOS PENDIENTES",
    headers: [
      { key: "index", label: "N°" },
      { key: "tipo_transaccion", label: "TIPO DE TRANSACCIÓN" },
      { key: "sucursal", label: "SUCURSAL" },
      { key: "empleado", label: "EMPLEADO" },
      { key: "cliente", label: "CLIENTE" },
      { key: "vehiculo", label: "VEHÍCULO" },
      { key: "precio_final", label: "PRECIO FINAL" },
      { key: "cuota_inicial", label: "CUOTA INICIAL" },
      { key: "detalle", label: "DETALLE" },
      { key: "tipo_venta", label: "TIPO DE VENTA" },
      { key: "tipo_pago", label: "TIPO DE PAGO" }
    ]
  })
}
