import { exportToPDF } from "../exportPDF"
import type { EmployeeWithRelations } from "@/types/employees"


// 🔥 Export específico de clientes
export const exportEmployeesToPDF = (
  employees: EmployeeWithRelations[],
  user: string
) => {

  if (!employees || employees.length === 0) return

  exportToPDF({
    title: "REPORTE DE EMPLEADOS",
    fileName: "Empleados",
    user,
 

    headers: ["ID", "NOMBRE", "CÉDULA", "CELULAR", "REFERENCIA", "CIUDAD"],

   body: employees.map((employee, index) => [
      index + 1,
      employee.name,
      employee.ci,
      employee.celphone,
      employee.reference,
      employee.celphone_ref,
      employee.branch?.name_branch || "",
      employee.role?.role || ""
    ])
  })
}