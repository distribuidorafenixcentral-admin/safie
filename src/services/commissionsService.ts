import { supabase } from "@/lib/supabase"

import type {
  CommissionWithRelations,
  CommissionPayment,
  PayCommissionPayload
} from "@/types/commission"

// 📌 Tipo de transacción para depósitos
const TYPE_DEPOSITS = 8

// 📌 Tipo de transacción para pago de comisiones
const TYPE_COMMISSION_PAYMENT = 4


// =======================================================
// 📌 1. OBTENER DEPÓSITOS PENDIENTES DE COMISIÓN
// =======================================================
export const getPendingCommissions = async (): Promise<CommissionWithRelations[]> => {

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      branches(id, name_branch),
      employees(id, name)
    `)
    .eq("id_type_transaction", TYPE_DEPOSITS)
    .eq("id_status", 2)
    .eq("id_commission_status", 1)
    .order("id", { ascending: false })

  if (error) throw error

  return data || []
}


// =======================================================
// 📌 2. OBTENER DETALLE POR EMPLEADO + SUCURSAL
// =======================================================
export const getCommissionDetails = async (
  employeeId: number,
  branchId: number
): Promise<CommissionWithRelations[]> => {

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      branches(id, name_branch),
      employees(id, name)
    `)
    .eq("id_type_transaction", TYPE_DEPOSITS)
    .eq("id_status", 2)
    .eq("id_commission_status", 1)
    .eq("id_employee", employeeId)
    .eq("id_branch", branchId)
    .order("id", { ascending: false })

  if (error) throw error

  return data || []
}


// =======================================================
// 📌 3. OBTENER HISTORIAL DE COMISIONES PAGADAS (OPCIONAL)
// =======================================================
export const getPaidCommissionsHistory = async (
  employeeId: number,
  branchId: number
): Promise<CommissionWithRelations[]> => {

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      branches(id, name_branch),
      employees(id, name)
    `)
    .eq("id_type_transaction", TYPE_DEPOSITS)
    .eq("id_commission_status", 2)
    .eq("id_employee", employeeId)
    .eq("id_branch", branchId)
    .order("id", { ascending: false })

  if (error) throw error

  return data || []
}


// =======================================================
// 📌 4. REGISTRAR PAGO DE COMISIONES 🔥
// =======================================================
export const payCommissions = async (
  payload: PayCommissionPayload
): Promise<CommissionPayment> => {

  const {
    deposits,
    totalCalculated,
    discount,
    totalPaid,
    detail
  } = payload

  // ============================
  // 1. Crear transacción de pago
  // ============================
  const { data: payment, error: errorPayment } = await supabase
    .from("transactions")
    .insert({
      id_type_transaction: TYPE_COMMISSION_PAYMENT,
      id_status: 2,
      amount: totalPaid,
      total_calculated: totalCalculated,
      discount: discount,
      detail: detail
    })
    .select()
    .single()

  if (errorPayment) throw errorPayment

  const paymentId = payment.id

  // ============================
  // 2. Actualizar depósitos
  // ============================
  const updates = deposits.map(d => ({
    id: d.id,
    id_commission_status: 2,
    commission_paid_amount: d.commission_paid_amount,
    commission_payment_id: paymentId
  }))

  const { error: errorUpdate } = await supabase
    .from("transactions")
    .upsert(updates)

  if (errorUpdate) throw errorUpdate

  return payment
}