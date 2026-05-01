import { supabase } from "@/lib/supabase"
import type {
  MemosInsert,
  MemosUpdate,
  MemosWithRelations
} from "@/types/memos"

// 🔹 constante fija del módulo
const TYPE_MEMO = 9

//
// 📌 OBTENER TODOS (con relaciones)
//
export const getMemos = async (): Promise<MemosWithRelations[]> => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      branches(id, name_branch),
      employees(id, name),
      type_transaction(id, description, type_trans),
      status_transaction(id, status)
    `)
    .eq("id_type_transaction", TYPE_MEMO)
    .neq("id_status", 4)
    .order("id", { ascending: false })

  if (error) throw error
  return (data as MemosWithRelations[]) || []
}

//
// 📌 OBTENER UNO CON RELACIONES
//
export const getMemoWithRelationsById = async (
  id: number
): Promise<MemosWithRelations> => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      branches(id, name_branch),
      employees(id, name),
      type_transaction(id, description, type_trans),
      status_transaction(id, status)
    `)
    .eq("id", id)
    .eq("id_type_transaction", TYPE_MEMO)
    .single()

  if (error) throw error
  return data as MemosWithRelations
}

//
// 📌 CREAR
//
export const createMemo = async (memo: MemosInsert) => {

  const payload = {
    ...memo,
    id_type_transaction: TYPE_MEMO,
    type_pay: memo.id_status === 2 ? "Efectivo" : null // 🔥 CLAVE
  }

  const { error } = await supabase
    .from("transactions")
    .insert(payload)

  if (error) throw error
}

//
// 📌 ACTUALIZAR
//
export const updateMemo = async (
  id: number,
  data: MemosUpdate
) => {
  // 🔥 regla de negocio: si pasa a pagado → asignar type_pay
  const payload: any = { ...data }

  if (data.id_status === 2) {
    payload.type_pay = "Efectivo"
  }

  const { error } = await supabase
    .from("transactions")
    .update(payload)
    .eq("id", id)
    .eq("id_type_transaction", TYPE_MEMO)

  if (error) throw error
}

//
// 📌 ELIMINAR (soft delete)
//
export const deleteMemo = async (id: number) => {
  const { error } = await supabase
    .from("transactions")
    .update({ id_status: 4 })
    .eq("id", id)
    .eq("id_type_transaction", TYPE_MEMO)

  if (error) throw error
}