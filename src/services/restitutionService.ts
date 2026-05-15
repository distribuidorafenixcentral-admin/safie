import { supabase } from "@/lib/supabase"
import type { 
  RestitutionWithRelations, 
  ProcessRestitutionPayload 
} from "@/types/restitution"

// 📌 Constantes del módulo de Restituciones
const TYPE_DEPOSITO = 8
const TYPE_RESTITUCION = 11

const STATUS_CONFIRMADO = 2
const COMMISSION_PAGADO = 2
const RESTITUTION_EFECTUADA = 2

// =======================================================
// 📌 1. OBTENER REGISTROS FILTRADOS SEGÚN PESTAÑA
// =======================================================
export const getRestitucionesData = async (
  filterType: "TODOS" | "PAGADOS" | "DEPOSITOS"
): Promise<RestitutionWithRelations[]> => {

  let query = supabase
    .from("transactions")
    .select(`
      *,
      branches(id, name_branch),
      employees(id, name),
      customers(id, name),
      type_transaction(id, description)
    `)
    .order("id", { ascending: false })

  // 🔹 Aplicación estricta de las reglas de filtrado del negocio
  if (filterType === "DEPOSITOS") {
    // Reglas: Depósito (8), Confirmado (2), Comisión Pagada (2) y que AÚN NO esté devuelto
    query = query
      .eq("id_type_transaction", TYPE_DEPOSITO)
      .eq("id_status", STATUS_CONFIRMADO)
      .eq("id_commission_status", COMMISSION_PAGADO)
      .or("id_restitution_status.is.null, id_restitution_status.neq.2")
  } 
  else if (filterType === "PAGADOS") {
    // Reglas: Únicamente las devoluciones oficiales consolidadas (9)
    query = query
      .eq("id_type_transaction", TYPE_RESTITUCION)
      .eq("id_status", STATUS_CONFIRMADO)
  } 
  else if (filterType === "TODOS") {
    // Reglas: (Depósitos aptos 8,2,2) MÁS (Todas las restituciones 9)
    query = query.or(
      `and(id_type_transaction.eq.${TYPE_DEPOSITO},id_status.eq.${STATUS_CONFIRMADO},id_commission_status.eq.${COMMISSION_PAGADO}),id_type_transaction.eq.${TYPE_RESTITUCION}`
    )
  }

  const { data, error } = await query
  if (error) throw error

  return (data as any) || []
}

// =======================================================
// 📌 2. PROCESAR NUEVA RESTITUCIÓN (TRANSACCIÓN COMBINADA) 🔥
// =======================================================
export const executeRestitution = async (
  payload: ProcessRestitutionPayload
): Promise<void> => {
  
  // 1️⃣ Crear la nueva transacción de egreso (Tipo 9) siempre Confirmada (2)
  const { data: newTx, error: errorInsert } = await supabase
    .from("transactions")
    .insert({
      id_type_transaction: TYPE_RESTITUCION,
      id_branch: payload.id_branch,
      id_employee: payload.id_employee,
      type_pay: payload.type_pay,
      amount: payload.amount,           // Monto a pagar desde el nuevo input
      detail: payload.detail,           // Detalle desde el nuevo input
      id_customer: payload.id_customer, // Heredado del leído
      id_status: STATUS_CONFIRMADO,     // Siempre 2
      id_cuenta: payload.type_pay === "Efectivo" ? null : payload.id_cuenta, // Select de recursos o null
      confirmed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (errorInsert || !newTx) {
    throw new Error(errorInsert?.message || "Error al crear el registro de restitución Tipo 9.")
  }

  const newRestitutionId = newTx.id

  // 2️⃣ Actualizar el registro origen (Tipo 8) para inyectar auditoría y control
  const { error: errorUpdateSource } = await supabase
    .from("transactions")
    .update({
      id_restitution_status: RESTITUTION_EFECTUADA, // Siempre 2
      restitution_amount: payload.amount,            // Nuevo input monto a devolver
      restitution_parent_id: newRestitutionId,       // ID de la nueva transacción vinculada
      restitution_note: `Restituido en la transacción #${newRestitutionId}`
    })
    .eq("id", payload.originId)
    .eq("id_type_transaction", TYPE_DEPOSITO)

  if (errorUpdateSource) {
    // Nota de contingencia: Si falla el paso 2 en el cliente, idealmente se audita el huérfano Tipo 9
    throw new Error(`Restitución creada (#${newRestitutionId}), pero falló el enlace con el origen: ${errorUpdateSource.message}`)
  }
}
