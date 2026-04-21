import { exportToExcel } from "../exportExcel"
import type { Employee } from "@/types/employees"

// 🔹 Export específico de sucursales
export const exportEmployeesToExcel = (filteredEmployees: Employee[]) => {

  // 🔥 Transformar datos (agregar correlativo)
  const data = filteredEmployees.map((item, index) => ({
    index: index + 1, // 
    name: item.name,
    ci: item.ci,
    start_date: item.start_date,
    reference: item.reference,
    celphone: item.celphone,
    celphone_ref: item.celphone_ref,
   
  }))

  exportToExcel({
    data,
    fileName: "Empleados",
    sheetName: "Empleados",
    title: "REPORTE DE EMPLEADOS",
    headers: [
      { key: "index", label: "N°" },
      { key: "name", label: "NOMBRE" },
      { key: "ci", label: "CÉDULA DE IDENTIDAD" },
      { key: "celphone", label: "CELULAR" },
      { key: "reference", label: "REFERENCIA" },
      { key: "celphone_ref", label: "CELULAR DE REFERENCIA" },
      { key: "start_date", label: "FECHA DE INICIO" }
      
    ]
  })
}