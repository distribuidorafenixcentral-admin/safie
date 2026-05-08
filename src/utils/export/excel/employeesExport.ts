import { exportToExcel } from "../exportExcel"
import type { EmployeeWithRelations } from "@/types/employees" // 👈 Cambiado a EmployeeWithRelations para acceder a branch y role

// 🔹 Export específico de personal optimizado con filtros y ordenamiento
export const exportEmployeesToExcel = (
  filteredEmployees: EmployeeWithRelations[], // 👈 Tipado actualizado
  idRoleCurrentUser?: number | null           // 👈 Recibe el rol enviado desde la página
) => {

  if (!filteredEmployees || filteredEmployees.length === 0) return

  // 🧠 1. Clonar y ordenar por Sucursal, luego por Cargo usando localeCompare
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const branchA = a.branch?.name_branch || ""
    const branchB = b.branch?.name_branch || ""

    const branchCompare = branchA.localeCompare(branchB)
    if (branchCompare !== 0) return branchCompare

    const roleA = a.role?.role || ""
    const roleB = b.role?.role || ""
    return roleB.localeCompare(roleA)
  })

  // 👥 Evaluar si el usuario es Admin Global (1 o 2) para mostrar la sucursal
  const showBranch = idRoleCurrentUser === 1 || idRoleCurrentUser === 2 || !idRoleCurrentUser

  // 📋 2. Estructurar las cabeceras base del Excel
  const headers = [
    { key: "index", label: "N°" },
    { key: "name", label: "NOMBRE" },
    { key: "ci", label: "CÉDULA DE IDENTIDAD" },
    { key: "celphone", label: "CELULAR" },
    { key: "reference", label: "REFERENCIA" },
    { key: "celphone_ref", label: "CELULAR DE REFERENCIA" },
    { key: "start_date", label: "FECHA DE INICIO" },
    { key: "role", label: "CARGO" } // 👈 Agregado a tus columnas base
  ]

  // 🔥 Si tiene los permisos correspondientes, inyectamos la columna de Sucursal al final
  if (showBranch) {
    headers.push({ key: "branch", label: "SUCURSAL" })
  }

  // 🔄 3. Transformar los datos ordenados mapeando las llaves con los objetos del Excel
  const data = sortedEmployees.map((item, index) => {
    const row: any = {
      index: index + 1,
      name: item.name,
      ci: item.ci,
      celphone: item.celphone,
      reference: item.reference,
      celphone_ref: item.celphone_ref,
      start_date: item.start_date,
      role: item.role?.role || "Sin cargo" // 👈 Mapeo del cargo relacional
    }

    // 🔥 Si aplica, inyectamos el valor de la sucursal en la propiedad "branch"
    if (showBranch) {
      row.branch = item.branch?.name_branch || "Sin sucursal"
    }

    return row
  })

  // 🚀 4. Ejecutar la descarga de la hoja de cálculo
  exportToExcel({
    data,
    fileName: "Listado_Personal",
    sheetName: "listado_personal",
    title: "LISTA DEL PERSONAL",
    headers
  })
}
