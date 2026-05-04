import { supabase } from "@/lib/supabase"
import type { PagossolUpdate } from "@/types/pagosol"

// 🔹 Constantes del módulo
const TYPE_SOLICITUD = [1,2,3]

// Estados
const STATUS_PENDIENTE = 1
const STATUS_CONFIRMADO = 2
const STATUS_BAJA = 4

// 📌 Obtener solicitudes pendientes
export const getPagossol = async () => {
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
    .in("id_type_transaction", TYPE_SOLICITUD)
    .eq("id_status", STATUS_PENDIENTE)
    .order("id", { ascending: false })

  if (error) throw error

  return data || []
}

// 📌 Confirmar el pago de la solicitud
export const confirmPagosol = async (
  id: number,
  data: PagossolUpdate
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
      id_status: STATUS_CONFIRMADO,
      confirmed_at: new Date().toISOString()
    })
    .eq("id", id)
    .in("id_type_transaction", TYPE_SOLICITUD)

  if (error) throw error
}

// 📌 Dar de baja / eliminar solicitu de pago
export const rejectPagosol = async (id: number) => {
  const { error } = await supabase
    .from("transactions")
    .update({
      id_status: STATUS_BAJA
    })
    .eq("id", id)
    .in("id_type_transaction", TYPE_SOLICITUD)

  if (error) throw error
}

// 📌 Obtener un registro de solicitud por ID
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
    .in("id_type_transaction", TYPE_SOLICITUD)
    .single()

  if (error) throw error

  return data
}