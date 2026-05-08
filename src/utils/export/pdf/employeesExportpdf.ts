import { exportToPDF } from "../exportPDF"
import type { EmployeeWithRelations } from "@/types/employees"

// 🔥 Export específico de empleados discriminado por rol y ordenado
export const exportEmployeesToPDF = (
  employees: EmployeeWithRelations[],
  user: string,
  idRoleCurrentUser?: number | null
) => {

  if (!employees || employees.length === 0) return

  // 🧠 1. Clonar y ordenar el arreglo original por Sucursal y luego por Cargo
  const sortedEmployees = [...employees].sort((a, b) => {
    const branchA = a.branch?.name_branch || ""
    const branchB = b.branch?.name_branch || ""

    // Primer criterio: Alfabético por Sucursal
    const branchCompare = branchB.localeCompare(branchA)

    // Si las sucursales son distintas, retorna el resultado de esa comparación
    if (branchCompare !== 0) return branchCompare

    // Segundo criterio (Si son de la misma sucursal): Alfabético por Cargo
    const roleA = a.role?.role || ""
    const roleB = b.role?.role || ""
    return roleB.localeCompare(roleA)
  })

  // 2. Definimos las cabeceras base
  const headers = ["ID", "NOMBRE", "CÉDULA", "CELULAR", "REFERENCIA", "TELEFONO DE REFERENCIA", "FECHA DE INICIO", "CARGO"]

  // 🔥 Si el usuario es Admin Global (1 o 2) o no viene el rol, inyectamos la columna "SUCURSAL"
  const showBranch = idRoleCurrentUser === 1 || idRoleCurrentUser === 2 || !idRoleCurrentUser
  if (showBranch) {
    headers.push("SUCURSAL")
  }

  // 📋 3. Estructuramos el cuerpo del PDF usando el arreglo ya ORDENADO
  const body = sortedEmployees.map((employee, index) => {
    const row: any[] = [
      index + 1,
      employee.name,
      employee.ci,
      employee.celphone,
      employee.reference,
      employee.celphone_ref,  
      employee.start_date,
      employee.role?.role || "",
    ]

    if (showBranch) {
      row.push(employee.branch?.name_branch || "Sin sucursal")
    }

    return row
  })

  // Ejecutamos la exportación con los datos dinámicos y ordenados
  exportToPDF({
    title: "LISTA DEL PERSONAL",
    fileName: "Listado_Personal",
    user,
    headers,
    body 
  })
}
