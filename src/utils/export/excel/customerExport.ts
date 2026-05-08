import { exportToExcel } from "../exportExcel"
import type { CustomerWithRelations } from "@/types/customer"

// 🔹 Export específico de clientes optimizado con visibilidad por rol y doble ordenamiento
export const exportCustomerToExcel = (
  filteredCustomers: CustomerWithRelations[], 
  idRoleCurrentUser?: number | null           
) => {

  if (!filteredCustomers || filteredCustomers.length === 0) return

  // 🧠 1. Clonar y ordenar: Primero por CI (Alfabético) y luego por ID (Numérico)
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const ciA = a.ci || ""
    const ciB = b.ci || ""

    // Primer criterio: Cédula de Identidad
    const ciCompare = ciA.localeCompare(ciB)
    if (ciCompare !== 0) return ciCompare

    // Segundo criterio (En caso de CIs iguales): ID de menor a mayor
    return a.id - b.id
  })

  // 👥 Evaluar si el usuario es Admin Global (1 o 2) para mostrar la sucursal
  const showBranch = idRoleCurrentUser === 1 || idRoleCurrentUser === 2 || !idRoleCurrentUser

  // 📋 2. Estructurar las cabeceras base de las columnas del Excel
  const headers = [
    { key: "index", label: "N°" },
    { key: "name", label: "NOMBRE" },
    { key: "ci", label: "CÉDULA DE IDENTIDAD" },
    { key: "celphone", label: "CELULAR" },
    { key: "reference", label: "REFERENCIA" },
    { key: "ciudad", label: "CIUDAD" }
  ]

  if (showBranch) {
    headers.push({ key: "branch", label: "SUCURSAL" })
  }

  // 🔄 3. Transformar los datos ordenados mapeando las llaves con los objetos del Excel
  const data = sortedCustomers.map((item, index) => {
    const row: any = {
      index: index + 1,
      name: item.name,
      ci: item.ci,
      celphone: item.celphone,
      reference: item.reference,
      ciudad: item.ciudad
    }

    if (showBranch) {
      row.branch = item.branch?.name_branch || "Sin sucursal"
    }

    return row
  })

  // 🚀 4. Ejecutar la descarga de la hoja de cálculo
  exportToExcel({
    data,
    fileName: "Clientes",
    sheetName: "Clientes",
    title: "REPORTE DE CLIENTES",
    headers
  })
}
