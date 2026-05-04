
import type { PagosolWithRelations } from "@/types/pagosol"
import { exportToExcel } from "../exportExcel"

// 📌 Export específico de depósitos pendientes
export const exportPagosToExcel = (
  filteredPagossol: PagosolWithRelations[]
) => {

  // 🔒 Validar datos
  if (!filteredPagossol || filteredPagossol.length === 0) {
    console.warn("No existen depósitos para exportar")
    return
  }

  // 🔥 Transformar datos
  const data = filteredPagossol.map((item, index) => ({

    index: index + 1,

    tipo_transaccion:
      item.type_transaction?.description || "",

    sucursal:
      item.branches?.name_branch || "",

    monto:
      item.amount,

    detalle:
      item.detail || "",

    tipo_pago:
      item.type_pay || "",

    cuenta:
    item.cuentas?.numero_cta 
    
    
  }))

  // 📤 Exportar
  exportToExcel({
    data,

    fileName: "Pagos_pendientes",
    sheetName: "Pagos_Pendientes",

    title: "REPORTE DE SOLICITUDES DE PAGOS PENDIENTES",

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
        key: "MONTO",
        label: "MONTO"
      },
      {
        key: "detalle",
        label: "DETALLE"
      },
      {
        key: "tipo_pago",
        label: "TIPO DE PAGO"
      },
      {
        key: "cuenta",
        label: "CUENTA"
      }
    ]
  })
}

