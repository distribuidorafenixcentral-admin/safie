// 🔹 Tipos de periodos de cierre disponibles
export type ClosurePeriodType = "DIARIO" | "SEMANAL" | "MENSUAL"

// =======================================================
// 📌 ESTRUCTURA DE FILA AGRUPADA PARA EL COMPROBANTE PDF
// =======================================================
export interface ClosureGroupedRow {
  // Nombre o descripción del tipo de transacción (ej: "Depósito", "Pago Comisión")
  type_transaction_description: string
  
  // Total de transacciones ejecutadas bajo este mismo tipo en el periodo
  count: number
  
  // Si la transacción maestra es 'income', almacena la suma total en esta columna. Si no, es 0
  ingreso: number
  
  // Si la transacción maestra es 'expense', almacena la suma total en esta columna. Si no, es 0
  egreso: number
}

// =======================================================
// 📌 ESTRUCTURA GLOBAL DEL REPORTE DE CIERRE
// =======================================================
export interface ClosureReportPayload {
  period: ClosurePeriodType
  generated_at: string
  rows: ClosureGroupedRow[]
  total_ingresos: number
  total_egresos: number
  balance_neto: number
}
