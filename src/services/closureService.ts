import { supabase } from "@/lib/supabase"
import type { ClosurePeriodType, ClosureGroupedRow, ClosureReportPayload } from "@/types/closure"

const STATUS_CONFIRMADO = 2

// 📅 Helpers de Rangos de Fechas Locales
const getPeriodRange = (period: ClosurePeriodType) => {
  const start = new Date()
  const end = new Date()

  if (period === "DIARIO") {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } 
  else if (period === "SEMANAL") {
    const day = start.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    start.setDate(start.getDate() + diffToMonday)
    start.setHours(0, 0, 0, 0)

    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
  } 
  else if (period === "MENSUAL") {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
    end.setHours(23, 59, 59, 999)
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

// =======================================================
// 📌 OBTENER Y AGRUPAR DATA PARA CIERRE DE CAJA
// =======================================================
export const generateClosureReport = async (
  period: ClosurePeriodType
): Promise<ClosureReportPayload> => {
  const { start, end } = getPeriodRange(period)

  // Recupera transacciones confirmadas con su relación maestra
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      type_transaction!inner (
        description,
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .not("confirmed_at", "is", null)
    .gte("confirmed_at", start)
    .lte("confirmed_at", end)

  if (error) throw error

  // 🔥 Reducción y Agrupación contable en memoria
  const rowsMap = (data || []).reduce<Record<string, ClosureGroupedRow>>((acc, item: any) => {
    const desc = item.type_transaction?.description || "Otros"
    const typeTrans = item.type_transaction?.type_trans // "income" o "expense"
    const amountNum = Number(item.amount || 0)

    if (!acc[desc]) {
      acc[desc] = {
        type_transaction_description: desc,
        count: 0,
        ingreso: 0,
        egreso: 0
      }
    }

    // Incrementar cantidad de transacciones del mismo tipo
    acc[desc].count += 1

    // Clasificar columna financiera
    if (typeTrans === "income") {
      acc[desc].ingreso += amountNum
    } else if (typeTrans === "expense") {
      acc[desc].egreso += amountNum
    }

    return acc
  }, {})

  const rows = Object.values(rowsMap)

  // Calcular totales generales del periodo para el balance del PDF
  const total_ingresos = rows.reduce((sum, r) => sum + r.ingreso, 0)
  const total_egresos = rows.reduce((sum, r) => sum + r.egreso, 0)
  const balance_neto = total_ingresos - total_egresos

  return {
    period,
    generated_at: new Date().toISOString(),
    rows,
    total_ingresos,
    total_egresos,
    balance_neto
  }
}
