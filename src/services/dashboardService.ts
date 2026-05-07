// src/services/dashboardService.ts

import { supabase } from "@/lib/supabase"

// CONSTANTES PARA FILTRAR INFORMACION EN CONSULTAS
const STATUS_CONFIRMADO = 2
const TYPE_DEPOSITO = 8
const TYPE_RESTITUIDO = 11

// 📅 Helpers Bolivia/local

// rango de hoy
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

// rango semana de lunes a domingo de la semana actual
const getWeekRange = () => {
  const now = new Date()

  // Obtener el día actual (0=domingo, 1=lunes...)
  const day = now.getDay()

  // Ajustar para que lunes sea el inicio
  const diffToMonday = day === 0 ? -6 : 1 - day

  // 📌 Lunes
  const start = new Date(now)
  start.setDate(now.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)

  // 📌 Domingo
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

// rango mes actual de 1 al último día del mes
const getMonthRange = () => {
  const now = new Date()

  // 📌 Primer día del mes
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  )

  // 📌 Último día del mes
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

// ============================
// 📌 INGRESOS 
// ============================

// 💵 HOY
export const getIngresosHoy = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
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

// 💵 SEMANA
export const getIngresosSemana = async () => {
  const { start, end } = getWeekRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
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

// 💵 MENSUAL 
export const getIngresosMes = async () => {
  const { start, end } = getMonthRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
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


// ============================
// 📌 GASTOS 
// ============================ 

// 💶 HOY
export const getGastosHoy = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "expense")
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
// SEMANAL
export const getGastosSemana = async () => {
  const { start, end } = getWeekRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "expense")
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
// MENSUAL
export const getGastosMes = async () => {
  const { start, end } = getMonthRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "expense")
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

// ============================
// 📌 BALANCE
// ============================

// 💰 BALANCE HOY
export const getBalanceHoy = async () => {
  const ingresos = await getIngresosHoy()
  const gastos = await getGastosHoy()

  return ingresos - gastos
}

// 💰 BALANCE SEMANA
export const getBalanceSemana = async () => {
  const ingresos = await getIngresosSemana()
  const gastos = await getGastosSemana()

  return ingresos - gastos
}

// 💰 BALANCE MES
export const getBalanceMes = async () => {
  const ingresos = await getIngresosMes()
  const gastos = await getGastosMes()

  return ingresos - gastos
}


// ============================ 
// 📌 DEPOSITOS
// ============================

// 💵 HOY
export const getDepositosHoy = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at
    `)
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

// 💵 SEMANA
export const getDepositosSemana = async () => {
  const { start, end } = getWeekRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at
    `)
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

// 💵 MES
export const getDepositosMes = async () => {
  const { start, end } = getMonthRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at
    `)
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

// ============================
// 📌 BANCOS Y EFECTIVO
// ============================

// 💵 EFECTIVO
// HOY
export const getEfectivo = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
    .eq("type_pay", "Efectivo")
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

// SEMANA
export const getEfectivoSemana = async () => {
  const { start, end } = getWeekRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
    .eq("type_pay", "Efectivo")
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

// MES
export const getEfectivoMes = async () => {
  const { start, end } = getMonthRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
    .eq("type_pay", "Efectivo")
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

// BANCO 1
// dinero en cuenta banco 1 HOY
export const getBanco1 = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
    .eq("id_cuenta", 1)
    .neq("type_pay", "Efectivo")
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

// dinero en cuenta banco 1 SEMANA
export const getBanco1Semana = async () => {
  const { start, end } = getWeekRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
    .eq("id_cuenta", 1)
    .neq("type_pay", "Efectivo")
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

// dinero en cuenta banco 1 MES
export const getBanco1Mes = async () => {
  const { start, end } = getMonthRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
    .eq("id_cuenta", 1)
    .neq("type_pay", "Efectivo")
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

// BANCO 2
// HOY
export const getBanco2 = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
    .eq("id_cuenta", 2)
    .neq("type_pay", "Efectivo")
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

// SEMANA
export const getBanco2Semana = async () => {
  const { start, end } = getWeekRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
    .eq("id_cuenta", 2)
    .neq("type_pay", "Efectivo")
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

// MES
export const getBanco2Mes = async () => {
  const { start, end } = getMonthRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at,
      type_transaction!inner (
        type_trans
      )
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("type_transaction.type_trans", "income")
    .eq("id_cuenta", 2)
    .neq("type_pay", "Efectivo")
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


// ============================
// 📌 RESTITUCIONES
// ============================

// HOY
export const getRestitucionHoy = async () => {
  const { start, end } = getTodayRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("id_type_transaction", TYPE_RESTITUIDO)
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

// SEMANA
export const getRestitucionSemana = async () => {
  const { start, end } = getWeekRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("id_type_transaction", TYPE_RESTITUIDO)
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

// MES
export const getRestitucionMes = async () => {
  const { start, end } = getMonthRange()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      confirmed_at
    `)
    .eq("id_status", STATUS_CONFIRMADO)
    .eq("id_type_transaction", TYPE_RESTITUIDO)
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
