import { supabase } from "@/lib/supabase"
import type {
  StatusInsert,
  StatusUpdate
} from "@/types/statustransactions"


// 📌 Obtener cuentas activas
export const getStatusTransactions = async () => {
  const { data, error } = await supabase
    .from("status_transaction")
    .select("*")
    .order("id", { ascending: true })
  if (error) throw error

  return data || []
}

// 📌 Obtener por ID
export const getStatusTransactionsById = async (id: number) => {
  const { data, error } = await supabase
    .from("stauts_transaction")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error

  return data
}

// 📌 Crear cuenta
export const addStatus= async (
  statustransaction: StatusInsert
) => {
  const { error } = await supabase
    .from("status_transaction")
    .insert({
      ...statustransaction,
    })

  if (error) throw error
}

// 📌 Editar status
export const editStatus = async (
  id: number,
  status: StatusUpdate
) => {
  const { error } = await supabase
    .from("status_transaction")
    .update(status)
    .eq("id", id)

  if (error) throw error
}

// 📌 Baja lógica
export const removeStatus = async (id: number) => {
  const { error } = await supabase
    .from("status_transaction")
    .update({
      status: 4
    })
    .eq("id", id)

  if (error) throw error
}