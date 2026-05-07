// src/services/dashboardService.ts

import { supabase } from "@/lib/supabase"

// CONSTANTES PARA FILTRAR INFORMACION EN CONSULTAS
const STATUS_CONFIRMADO = 2
const TYPE_DEPOSITO = 8

// 📅 Helpers Bolivia/local
const getTodayRange = () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

const getWeekRange = () => {
  const end = new Date()

  const start = new Date()
  start.setDate(start.getDate() - 7)
  start.setHours(0, 0, 0, 0)

  end.setHours(23, 59, 59, 999)

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

const getMonthRange = () => {
  const now = new Date()

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  )

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

// 🔹 TOTAL PERSONAL
export const getTotalPersonal = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error getTotalPersonal:", error)
    return 0
  }

  return count || 0
}

// 💵 INGRESOS HOY
export const getIngresosHoy = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .not("confirmed_at", "is", null)
    .gte("confirmed_at", start)
    .lte("confirmed_at", end)

  if (error) throw error

  return (data || [])
    .filter(
      (item: any) =>
        item.type_transaction?.type_trans === "income"
    )
    .reduce(
      (sum: number, item: any) =>
        sum + Number(item.amount || 0),
      0
    )
}

// 💶 GASTOS HOY
export const getGastosHoy = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .not("confirmed_at", "is", null)
    .gte("confirmed_at", start)
    .lte("confirmed_at", end)

  if (error) throw error

  return (data || [])
    .filter(
      (item: any) =>
        item.type_transaction?.type_trans === "expense"
    )
    .reduce(
      (sum: number, item: any) =>
        sum + Number(item.amount || 0),
      0
    )
}

// 💵 DEPÓSITOS HOY
export const getDepositosHoy = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("id_type_transaction", TYPE_DEPOSITO)
    .not("confirmed_at", "is", null)
    .gte("confirmed_at", start)
    .lte("confirmed_at", end)

  if (error) throw error

  return (data || []).reduce(
    (sum: number, item: any) =>
      sum + Number(item.amount || 0),
    0
  )
}

// 💵 DEPÓSITOS ÚLTIMA SEMANA
export const getDepositosSemana = async () => {
  const { start, end } = getWeekRange()

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("id_type_transaction", TYPE_DEPOSITO)
    .not("confirmed_at", "is", null)
    .gte("confirmed_at", start)
    .lte("confirmed_at", end)

  if (error) throw error

  return (data || []).reduce(
    (sum: number, item: any) =>
      sum + Number(item.amount || 0),
    0
  )
}

// 💵 DEPÓSITOS MES
export const getDepositosMes = async () => {
  const { start, end } = getMonthRange()

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("id_type_transaction", TYPE_DEPOSITO)
    .not("confirmed_at", "is", null)
    .gte("confirmed_at", start)
    .lte("confirmed_at", end)

  if (error) throw error

  return (data || []).reduce(
    (sum: number, item: any) =>
      sum + Number(item.amount || 0),
    0
  )
}

// 💰 BALANCE HOY
export const getBalanceHoy = async () => {
  const ingresos = await getIngresosHoy()
  const gastos = await getGastosHoy()

  return ingresos - gastos
}

// efectivo actual
// 💵 EFECTIVO 
export const getEfectivo = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      type_pay,
      confirmed_at,
      type_transaction (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .not("confirmed_at", "is", null)
    .gte("confirmed_at", start)
    .lte("confirmed_at", end)

  if (error) throw error

  return (data || [])
    .filter(
      (item: any) =>
        item.type_transaction?.type_trans === "income" &&
        item.type_pay === "Efectivo"
    )
    .reduce(
      (sum: number, item: any) =>
        sum + Number(item.amount || 0),
      0
    )
}

// dinero en cuenta banco 1
export const getBanco1 = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      id_cuenta,
      confirmed_at,
      type_transaction (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .not("confirmed_at", "is", null)
    .gte("confirmed_at", start)
    .lte("confirmed_at", end)

  if (error) throw error

  return (data || [])
    .filter(
      (item: any) =>
        item.type_transaction?.type_trans === "income" &&
        item.id_cuenta === 1
    )
    .reduce(
      (sum: number, item: any) =>
        sum + Number(item.amount || 0),
      0
    )
}

// dinero en cuenta banco 2
export const getBanco2 = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      id_cuenta,
      confirmed_at,
      type_transaction (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .not("confirmed_at", "is", null)
    .gte("confirmed_at", start)
    .lte("confirmed_at", end)

  if (error) throw error

  return (data || [])
    .filter(
      (item: any) =>
        item.type_transaction?.type_trans === "income" &&
        item.id_cuenta === 2
    )
    .reduce(
      (sum: number, item: any) =>
        sum + Number(item.amount || 0),
      0
    )
}

