import { exportToPDF } from "../exportPDF"
import type { Branch } from "@/types/branch"

// 🔥 Export específico de sucursales
export const exportBranchesToPDF = (
  branches: Branch[],
  user: string
) => {

  if (!branches || branches.length === 0) return

  exportToPDF({
    title: "REPORTE DE SUCURSALES",
    fileName: "Sucursales",
    user,
 

    headers: ["ID", "NOMBRE", "DIRECCIÓN"],

   body: branches.map((p, index) => [
      index + 1,
      p.name_branch,
      p.adress_branch
    ])
  })
}