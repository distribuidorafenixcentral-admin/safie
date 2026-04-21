import { exportToPDF } from "../exportPDF"
import type { Customer } from "@/types/customer"


// 🔥 Export específico de clientes
export const exportCustomersToPDF = (
  customers: Customer[],
  user: string
) => {

  if (!customers || customers.length === 0) return

  exportToPDF({
    title: "REPORTE DE CLIENTES",
    fileName: "Clientes",
    user,
 

    headers: ["ID", "NOMBRE", "CÉDULA", "CELULAR", "REFERENCIA", "CIUDAD"],

   body: customers.map((customer, index) => [
      index + 1,
      customer.name,
      customer.ci,
      customer.celphone,
      customer.reference,
      customer.ciudad
    ])
  })
}