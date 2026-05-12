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
  return { start: start.toISOString(), end: end.toISOString() }
}

// rango semana de lunes a domingo
const getWeekRange = () => {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(now); start.setDate(now.getDate() + diffToMonday); start.setHours(0, 0, 0, 0)
  const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

// rango mes actual
const getMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

// ============================
// 📌 PERSONAL
// ============================
export const getTotalPersonal = async () => {
  const { count, error } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
  if (error) throw error
  return count || 0
}

// ============================
// 📌 INGRESOS 
// ============================
export const getIngresosHoy = async () => {
  const { start, end } = getTodayRange()
  const { data, error } = await supabase.from("transactions").select(`amount, confirmed_at, type_transaction!inner (type_trans)`)
    .eq("id_status", STATUS_CONFIRMADO).eq("type_transaction.type_trans", "income").not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
}

export const getIngresosSemana = async () => {
  const { start, end } = getWeekRange()
  const { data, error } = await supabase.from("transactions").select(`amount, confirmed_at, type_transaction!inner (type_trans)`)
    .eq("id_status", STATUS_CONFIRMADO).eq("type_transaction.type_trans", "income").not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
}

export const getIngresosMes = async () => {
  const { start, end } = getMonthRange()
  const { data, error } = await supabase.from("transactions").select(`amount, confirmed_at, type_transaction!inner (type_trans)`)
    .eq("id_status", STATUS_CONFIRMADO).eq("type_transaction.type_trans", "income").not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
}

// ============================
// 📌 GASTOS 
// ============================ 
export const getGastosHoy = async () => {
  const { start, end } = getTodayRange()
  const { data, error } = await supabase.from("transactions").select(`amount, confirmed_at, type_transaction!inner (type_trans)`)
    .eq("id_status", STATUS_CONFIRMADO).eq("type_transaction.type_trans", "expense").not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
}

export const getGastosSemana = async () => {
  const { start, end } = getWeekRange()
  const { data, error } = await supabase.from("transactions").select(`amount, confirmed_at, type_transaction!inner (type_trans)`)
    .eq("id_status", STATUS_CONFIRMADO).eq("type_transaction.type_trans", "expense").not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
}

export const getGastosMes = async () => {
  const { start, end } = getMonthRange()
  const { data, error } = await supabase.from("transactions").select(`amount, confirmed_at, type_transaction!inner (type_trans)`)
    .eq("id_status", STATUS_CONFIRMADO).eq("type_transaction.type_trans", "expense").not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
}

// ============================
// 📌 BALANCE
// ============================
export const getBalanceHoy = async () => (await getIngresosHoy()) - (await getGastosHoy())
export const getBalanceSemana = async () => (await getIngresosSemana()) - (await getGastosSemana())
export const getBalanceMes = async () => (await getIngresosMes()) - (await getGastosMes())

// ============================ 
// 📌 DEPOSITOS
// ============================
export const getDepositosHoy = async () => {
  const { start, end } = getTodayRange()
  const { data, error } = await supabase.from("transactions").select(`amount, confirmed_at`).eq("id_status", STATUS_CONFIRMADO).eq("id_type_transaction", TYPE_DEPOSITO).not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
}

export const getDepositosSemana = async () => {
  const { start, end } = getWeekRange()
  const { data, error } = await supabase.from("transactions").select(`amount, confirmed_at`).eq("id_status", STATUS_CONFIRMADO).eq("id_type_transaction", TYPE_DEPOSITO).not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
}

export const getDepositosMes = async () => {
  const { start, end } = getMonthRange()
  const { data, error } = await supabase.from("transactions").select(`amount, confirmed_at`).eq("id_status", STATUS_CONFIRMADO).eq("id_type_transaction", TYPE_DEPOSITO).not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
}

// ============================
// 📌 BANCOS Y EFECTIVO (NETOS)
// ============================

export const getEfectivoMes = async () => {
  const { start, end } = getMonthRange()
  const { data, error } = await supabase.from("transactions").select(`amount, type_transaction!inner (type_trans)` )
    .eq("id_status", STATUS_CONFIRMADO).eq("type_pay", "Efectivo").not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => {
    return item.type_transaction.type_trans === "income" ? sum + Number(item.amount || 0) : sum - Number(item.amount || 0)
  }, 0)
}

export const getBanco1Mes = async () => {
  const { start, end } = getMonthRange()
  const { data, error } = await supabase.from("transactions").select(`amount, type_transaction!inner (type_trans)` )
    .eq("id_status", STATUS_CONFIRMADO).eq("type_pay", "Banco 1").not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => {
    return item.type_transaction.type_trans === "income" ? sum + Number(item.amount || 0) : sum - Number(item.amount || 0)
  }, 0)
}

export const getBanco2Mes = async () => {
  const { start, end } = getMonthRange()
  const { data, error } = await supabase.from("transactions").select(`amount, type_transaction!inner (type_trans)` )
    .eq("id_status", STATUS_CONFIRMADO).eq("type_pay", "Banco 2").not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => {
    return item.type_transaction.type_trans === "income" ? sum + Number(item.amount || 0) : sum - Number(item.amount || 0)
  }, 0)
}

// ============================
// 📌 RESTITUCIONES
// ============================
export const getRestitucionMes = async () => {
  const { start, end } = getMonthRange()
  const { data, error } = await supabase.from("transactions").select(`amount`).eq("id_status", STATUS_CONFIRMADO).eq("id_type_transaction", TYPE_RESTITUIDO).not("confirmed_at", "is", null).gte("confirmed_at", start).lte("confirmed_at", end)
  if (error) throw error
  return (data || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
}
