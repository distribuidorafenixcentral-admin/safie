import { supabase } from "@/lib/supabase"
import type { DepositoUpdate, DepositoWithRelations } from "@/types/deposito"

// 🔹 Constantes del módulo
const TYPE_SOLICITUD = 8

// Estados
const STATUS_PENDIENTE = 1
const STATUS_CONFIRMADO = 2
const STATUS_BAJA = 4

// 📌 Obtener depósitos pendientes con filtrado por rol y sucursal
export const getDepositos = async (idRole?: number, idBranch?: number | null): Promise<DepositoWithRelations[]> => {
  let query = supabase
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

  // 🔒 Regla de Negocio: Si el rol es 3, filtrar estrictamente por su sucursal
  if (idRole === 3 && idBranch) {
    query = query.eq("id_branch", idBranch)
  }

  const { data, error } = await query.order("id", { ascending: false })

  if (error) throw error
  return (data as any) || []
}

// 📌 Confirmar depósito (Modifica estado, cuenta, comisiones y auditoría)
export const confirmDeposito = async (
  id: number,
  data: DepositoUpdate
) => {
  // 1. Obtener el monto actual de la transacción para asegurar el valor de la comisión
  const { data: currentTx, error: fetchError } = await supabase
    .from("transactions")
    .select("amount")
    .eq("id", id)
    .single()

  if (fetchError || !currentTx) {
    throw new Error("No se pudo recuperar el monto original de la transacción.")
  }

  // Si el pago es efectivo no registra cuenta bancaria destino
  const cuentaFinal = data.type_pay === "Efectivo" ? null : data.id_cuenta || null
  
  // Determinar el monto final de la comisión (prioriza el nuevo monto si fue editado)
  const finalAmount = data.amount !== undefined ? data.amount : currentTx.amount

  // 2. Ejecutar la actualización con todos los requerimientos del módulo
  const { error } = await supabase
    .from("transactions")
    .update({
      type_pay: data.type_pay,
      id_cuenta: cuentaFinal,
      amount: finalAmount,
      costo: data.costo !== undefined ? data.costo : null,
      detail: data.detail,
      id_status: STATUS_CONFIRMADO,
      confirmed_at: new Date().toISOString(),
      
      // 🟢 Campos de comisión requeridos por el negocio
      id_commission_status: 1,
      commission_paid_amount: finalAmount
    })
    .eq("id", id)
    .eq("id_type_transaction", TYPE_SOLICITUD)
    .eq("id_status", STATUS_PENDIENTE) // Evita doble confirmación concurrente

  if (error) throw error
}

// 📌 Dar de baja / anular solicitud (Borrado lógico)
export const rejectDeposito = async (id: number) => {
  const { error } = await supabase
    .from("transactions")
    .update({
      id_status: STATUS_BAJA
    })
    .eq("id", id)
    .eq("id_type_transaction", TYPE_SOLICITUD)
    .eq("id_status", STATUS_PENDIENTE) // Solo se puede dar de baja si estaba pendiente

  if (error) throw error
}

// 📌 Obtener un depósito específico por ID
export const getDepositoById = async (id: number): Promise<DepositoWithRelations> => {
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
  return data as any
}
