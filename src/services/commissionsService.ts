import { supabase } from "@/lib/supabase"
import type {
  CommissionWithRelations,
  CommissionPaymentResponse,
  PayCommissionPayload
} from "@/types/commission"

// 📌 Constantes de tipos de transacción
const TYPE_DEPOSITS = 8
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
    .eq("id_status", 2) // Confirmado
    .eq("id_commission_status", 1) // Pendiente de pago
    .order("id", { ascending: false })

  if (error) throw error
  return data as any || []
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
  return data as any || []
}

// =======================================================
// 📌 3. REGISTRAR PAGO DE COMISIONES 🔥
// =======================================================
export const payCommissions = async (
  payload: PayCommissionPayload
): Promise<CommissionPaymentResponse> => {
  
  // 1. Crear la transacción "Padre" (Egreso por Pago de Comisión Tipo 4)
  const { data: payment, error: errorPayment } = await supabase
    .from("transactions")
    .insert({
      id_type_transaction: TYPE_COMMISSION_PAYMENT,
      id_status: 2, // Confirmado/Pagado
      id_employee: payload.id_employee, // Importante: quién recibe el dinero
      id_branch: payload.id_branch,     // Importante: de qué sucursal sale
      id_cuenta: payload.id_cuenta || null,
      type_pay: payload.type_pay,
      amount: payload.amount,           // Total Neto (Calculado - Descuento)
      total_calculated: payload.total_calculated,
      discount: payload.discount,
      detail: payload.detail,
      confirmed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (errorPayment) throw errorPayment

  const paymentId = payment.id

  // 2. Vincular los depósitos "Hijos" al pago realizado
  // Usamos un Promise.all para asegurar que todos los registros se actualicen
  const updatePromises = payload.depositIds.map(id => 
    supabase
      .from("transactions")
      .update({
        id_commission_status: 2, // Cambiar a Pagado
        commission_payment_id: paymentId,
        commission_note: `Liquidado en trans. #${paymentId}`
      })
      .eq("id", id)
  )

  const results = await Promise.all(updatePromises)
  
  // Verificar si hubo errores en alguna actualización
  const firstError = results.find(r => r.error)
  if (firstError) throw firstError.error

  return payment as CommissionPaymentResponse
}

// 📌 3. OBTENER HISTORIAL DE COMISIONES PAGADAS (Asegúrate que esté exportada)
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
    .eq("id_type_transaction", 8) // Depósitos
    .eq("id_commission_status", 2) // Ya pagados
    .eq("id_employee", employeeId)
    .eq("id_branch", branchId)
    .order("id", { ascending: false })

  if (error) throw error

  return (data as any) || []
}
