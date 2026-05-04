import type { CompraWithRelations } from "@/types/compra"
import { exportToExcel } from "../exportExcel"

// 🔹 Export específico de sucursales
export const exportComprasToExcel = (filteredCompras: CompraWithRelations[]) => {

  // 🔥 Transformar datos (agregar correlativo)
  const data = filteredCompras.map((item, index) => ({
    index: index + 1, // 
    id_type_transaction: item.type_transaction?.description || "",
    id_branch: item.branches?.name_branch || "",
    id_employee: item.employees?.name || "",
    amount: item.amount,
    detail: item.detail,   
    type_pay: item.type_pay || "",
    id_cuenta: item.cuentas?.numero_cta 
  }))

  exportToExcel({
    data,
    fileName: "Compras",
    sheetName: "Compras",
    title: "REPORTE DE COMPRAS",
    headers: [
      { key: "index", label: "N°" },
      { key: "id_type_transaction", label: "TIPO DE TRANSACCIÓN" },
      { key: "id_branch", label: "SUCURSAL" },
      { key: "id_employee", label: "EMPLEADO" },
      { key: "amount", label: "MONTO" },
      { key: "detail", label: "DETALLE" },
      { key: "type_pay", label: "TIPO DE PAGO" },
      { key: "id_cuenta", label: "CUENTA" }
    ]
  })
}