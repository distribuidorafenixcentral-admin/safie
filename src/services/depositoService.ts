import { supabase } from "@/lib/supabase"
import type { DepositoUpdate } from "@/types/deposito"

// 🔹 Constantes del módulo
const TYPE_SOLICITUD = 8

// Estados
const STATUS_PENDIENTE = 1
const STATUS_CONFIRMADO = 2
const STATUS_BAJA = 4

// 📌 Obtener depósitos pendientes
export const getDepositos = async () => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      branches(id, name_branch),
      employees(id, name),
      customers(id, name),
      cars(id, name, cost, modelo, marca),
      type_transaction(id, description),
      status_transaction(id, status),
      cuentas(id, numero_cta, banco, titular, status)
    `)
    .eq("id_type_transaction", TYPE_SOLICITUD)
    .eq("id_status", STATUS_PENDIENTE)
    .order("id", { ascending: false })

  if (error) throw error

  return data || []
}

// 📌 Confirmar depósito
export const confirmDeposito = async (
  id: number,
  data: DepositoUpdate
) => {

  //  Si el pago es efectivo no registra cuenta
  const cuentaFinal =
    data.type_pay === "Efectivo"
      ? null
      : data.id_cuenta || null

  const { error } = await supabase
    .from("transactions")
    .update({
      ...data,
      id_cuenta: cuentaFinal,
      id_status: STATUS_CONFIRMADO
    })
    .eq("id", id)
    .eq("id_type_transaction", TYPE_SOLICITUD)

  if (error) throw error
}

// 📌 Dar de baja / eliminar solicitud
export const rejectDeposito = async (id: number) => {
  const { error } = await supabase
    .from("transactions")
    .update({
      id_status: STATUS_BAJA
    })
    .eq("id", id)
    .eq("id_type_transaction", TYPE_SOLICITUD)

  if (error) throw error
}

// 📌 Obtener un depósito por ID
export const getDepositoById = async (id: number) => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      branches(id, name_branch),
      employees(id, name),
      customers(id, name),
      cars(id, name, cost, modelo, marca),
      type_transaction(id, description),
      status_transaction(id, status),
      cuentas(id, numero_cta, banco, titular, status)
    `)
    .eq("id", id)
    .eq("id_type_transaction", TYPE_SOLICITUD)
    .single()

  if (error) throw error

  return data
}