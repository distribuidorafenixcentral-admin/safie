import type { CommissionGroup } from "@/types/commission"
import { exportToExcel } from "../exportExcel"

export const exportCommissionGroupsToExcel = (
  groups: CommissionGroup[]
) => {
  if (!groups || groups.length === 0) return

  const data = groups.map((group, index) => ({
    nro: index + 1,
    sucursal: group.branch_name,
    empleado: group.employee_name,
    cantidad_depositos: group.total_deposits,
  }))

  exportToExcel({
    data,
    fileName: "Resumen_Comisiones_Pendientes",
    sheetName: "Comisiones",
    title: "RESUMEN DE COMISIONES PENDIENTES POR EMPLEADO",
    headers: [
      { key: "nro", label: "N°" },
      { key: "sucursal", label: "SUCURSAL" },
      { key: "empleado", label: "EMPLEADO" },
      { key: "cantidad_depositos", label: "CANT. DEPÓSITOS PENDIENTES" }
    ]
  })
}
