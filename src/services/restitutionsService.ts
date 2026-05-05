import { supabase } from "@/lib/supabase"

import type {
  RestitutionWithRelations,
  RestitutionPayload
} from "@/types/restitution"

const TYPE_DEPOSIT = 8
const TYPE_RESTITUTION = 9


// =======================================================
// 📌 1. OBTENER DEPÓSITOS DISPONIBLES
// =======================================================
export const getDepositsForRestitution = async (): Promise<RestitutionWithRelations[]> => {

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      branches(id, name_branch),
      employees(id, name)
    `)
    .eq("id_type_transaction", TYPE_DEPOSIT)
    .eq("id_status", 2)
    .neq("id_restitution_status", 3) // excluir totalmente restituidos
    .order("id", { ascending: false })

  if (error) throw error

  return data || []
}


// =======================================================
// 📌 2. OBTENER HISTORIAL DE RESTITUCIONES
// =======================================================
export const getRestitutionHistory = async (parentId: number) => {

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("restitution_parent_id", parentId)
    .order("id", { ascending: false })

  if (error) throw error

  return data || []
}


// =======================================================
// 📌 3. REGISTRAR RESTITUCIÓN 🔥
// =======================================================
export const createRestitution = async (
  payload: RestitutionPayload
) => {

  const {
    parent_id,
    discount,
    final_amount,
    note
  } = payload

  // =============================
  // 1. obtener depósito original
  // =============================
  const { data: parent, error: errorParent } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", parent_id)
    .single()

  if (errorParent) throw errorParent

  const currentRestitution = parent.restitution_amount || 0
  const newTotal = currentRestitution + final_amount

  // =============================
  // 2. validar exceso
  // =============================
  if (newTotal > parent.amount) {
    throw new Error("La restitución excede el monto disponible")
  }

  // =============================
  // 3. insertar restitución
  // =============================
  const { error: insertError } = await supabase
    .from("transactions")
    .insert({
      id_type_transaction: TYPE_RESTITUTION,
      id_status: 2,

      amount: final_amount,

      restitution_parent_id: parent_id,
      restitution_discount: discount,
      restitution_note: note
    })

  if (insertError) throw insertError

  // =============================
  // 4. actualizar depósito
  // =============================
  let status = 2 // parcial

  if (newTotal === parent.amount) {
    status = 3 // total
  }

  const { error: updateError } = await supabase
    .from("transactions")
    .update({
      restitution_amount: newTotal,
      id_restitution_status: status
    })
    .eq("id", parent_id)

  if (updateError) throw updateError
}