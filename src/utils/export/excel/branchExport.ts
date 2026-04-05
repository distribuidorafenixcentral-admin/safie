import { exportToExcel } from "../exportExcel"
import type { Branch } from "@/types/branch"

// 🔹 Export específico de sucursales
export const exportBranchesToExcel = (filteredBranches: Branch[]) => {

  // 🔥 Transformar datos (agregar correlativo)
  const data = filteredBranches.map((item, index) => ({
    index: index + 1, // 👈 correlativo
    name_branch: item.name_branch,
    adress_branch: item.adress_branch
  }))

  exportToExcel({
    data,
    fileName: "Sucursales",
    sheetName: "Sucursales",
    title: "REPORTE DE SUCURSALES",
    headers: [
      { key: "index", label: "N°" },
      { key: "name_branch", label: "NOMBRE" },
      { key: "adress_branch", label: "DIRECCIÓN" }
    ]
  })
}