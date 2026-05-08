import { exportToPDF } from "../exportPDF"
import type { CustomerWithRelations } from "@/types/customer"

// 🔥 Export específico de clientes optimizado con visibilidad por rol y doble ordenamiento
export const exportCustomersToPDF = (
  customers: CustomerWithRelations[], 
  user: string,
  idRoleCurrentUser?: number | null   
) => {

  if (!customers || customers.length === 0) return

  // 🧠 1. Clonar y ordenar: Primero por CI (Alfabético) y luego por ID (Numérico)
  const sortedCustomers = [...customers].sort((a, b) => {
    const ciA = a.ci || ""
    const ciB = b.ci || ""
    
    // Primer criterio: Cédula de Identidad
    const ciCompare = ciA.localeCompare(ciB)
    
    // Si las cédulas son distintas, retorna el resultado de esa comparación
    if (ciCompare !== 0) return ciCompare

    // Segundo criterio (Si las cédulas fuesen iguales): ID de menor a mayor
    return a.id - b.id
  })

  // 👥 Evaluar si el usuario es Admin Global (1 o 2) para mostrar la sucursal
  const showBranch = idRoleCurrentUser === 1 || idRoleCurrentUser === 2 || !idRoleCurrentUser

  // 📋 2. Estructurar las cabeceras base del PDF
  const headers = ["ID", "NOMBRE", "CÉDULA", "CELULAR", "REFERENCIA", "CIUDAD"]

  if (showBranch) {
    headers.push("SUCURSAL")
  }

  // 🔄 3. Transformar los datos ordenados mapeando las filas del cuerpo del PDF
  const body = sortedCustomers.map((customer, index) => {
    const row: any[] = [
      index + 1,
      customer.name,
      customer.ci,
      customer.celphone,
      customer.reference,
      customer.ciudad
    ]

    if (showBranch) {
      row.push(customer.branch?.name_branch || "Sin sucursal")
    }

    return row
  })

  // 🚀 4. Ejecutar la descarga del archivo PDF con los datos dinámicos
  exportToPDF({
    title: "REPORTE DE CLIENTES",
    fileName: "Clientes",
    user,
    headers,
    body
  })
}
