import type { RestitutionWithRelations } from "@/types/restitution"
import { exportToExcel } from "../exportExcel"

export const exportRestitucionesToExcel = (
  items: RestitutionWithRelations[],
  filterName: string
) => {
  if (!items || items.length === 0) return

  // Transformación estructurada de datos para el motor de hojas de cálculo
  const data = items.map((item, index) => ({
    nro: index + 1,
    id: `TS-${item.id}`,
    sucursal: item.branches?.name_branch || "Sin sucursal",
    empleado: item.employees?.name || "Sin empleado",
    cliente: item.customers?.name || "Sin cliente",
    tipo_venta: item.type_sale || "No aplica",
    tipo_pago: item.type_pay || "No aplica",
    monto: item.amount ?? 0, // Enviar como number para sumas directas en Excel
    fecha_confirmacion: item.confirmed_at ? new Date(item.confirmed_at).toLocaleDateString("es-BO") : "Sin fecha",
    nota_comision: item.commission_note || "",
    detalle_restitucion: item.restitution_note || "",
    tipo_registro: item.id_type_transaction === 11 ? "Restitución (Egreso)" : "Depósito Base (Ingreso)"
  }))

  exportToExcel({
    data,
    fileName: `Restituciones_${filterName}`,
    sheetName: "Restituciones",
    title: `REPORTE DE RESTITUCIONES DE FONDOS — FILTRO: ${filterName}`,
    headers: [
      { key: "nro", label: "N°" },
      { key: "id", label: "ID TRANS." },
      { key: "sucursal", label: "SUCURSAL" },
      { key: "empleado", label: "EMPLEADO" },
      { key: "cliente", label: "CLIENTE" },
      { key: "tipo_venta", label: "TIPO VENTA" },
      { key: "tipo_pago", label: "TIPO PAGO" },
      { key: "monto", label: "MONTO (Bs.)" },
      { key: "fecha_confirmacion", label: "FECHA CONFIRMED" },
      { key: "nota_comision", label: "NOTA COMISIÓN" },
      { key: "detalle_restitucion", label: "DETALLE RESTITUCIÓN" },
      { key: "tipo_registro", label: "TIPO REGISTRO" }
    ]
  })
}
