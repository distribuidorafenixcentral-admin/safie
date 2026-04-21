import { exportToExcel } from "../exportExcel"
import type { Customer } from "@/types/customer"

// 🔹 Export específico de sucursales
export const exportCustomerToExcel = (filteredCustomers: Customer[]) => {

  // 🔥 Transformar datos (agregar correlativo)
  const data = filteredCustomers.map((item, index) => ({
    index: index + 1, // 👈 correlativo
    name: item.name,
    ci: item.ci,
    celphone: item.celphone,
    reference: item.reference,
    ciudad: item.ciudad
  }))

  exportToExcel({
    data,
    fileName: "Clientes",
    sheetName: "Clientes",
    title: "REPORTE DE CLIENTES",
    headers: [
      { key: "index", label: "N°" },
      { key: "name", label: "NOMBRE" },
      { key: "ci", label: "CÉDULA DE IDENTIDAD" },
      { key: "celphone", label: "CELULAR" },
        { key: "reference", label: "REFERENCIA" },
        { key: "ciudad", label: "CIUDAD" }
    ]
  })
}