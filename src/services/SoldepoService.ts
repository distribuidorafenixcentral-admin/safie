import { supabase } from "@/lib/supabase"
import type {
  Soldepo,
  SoldepoInsert,
  SoldepoUpdate,
  SoldepoWithRelations
} from "@/types/soldepo"

// 📌 Tipo de transacción:
// 8 = Solicitud posible depósito
const TYPE_SOLICITUD = 8

// 📌 Estado:
// 1 = Pendiente
// 2 = Eliminado (soft delete)


// 🔍 Recuperar solicitudes con relaciones completas
export const getSoldepo = async (): Promise<SoldepoWithRelations[]> => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      branches (
        id,
        name_branch
      ),
      employees (
        id,
        name
      ),
      type_transaction (
        id,
        description,
        type_trans
      ),
      status_transaction (
        id,
        status
      ),
      cars (
        id,
        name,
        cost,
        modelo,
        marca
      ),
      customers (
        id,
        name
      )
    `)
    .eq("id_type_transaction", TYPE_SOLICITUD)
    .neq("id_status", 2)
    .order("id", { ascending: false })

  if (error) throw error

  return (data as SoldepoWithRelations[]) || []
}


// 🟢 Crear nueva solicitud
export const createSoldepo = async (
  soldepo: SoldepoInsert
): Promise<void> => {
  const { error } = await supabase
    .from("transactions")
    .insert({
      ...soldepo,

      // Forzado por lógica del módulo
      id_type_transaction: TYPE_SOLICITUD,

      // Estado pendiente por defecto
      id_status: soldepo.id_status ?? 1
    })

  if (error) throw error
}


// 🔍 Obtener solicitud individual
export const getSoldepoById = async (
  id: number
): Promise<Soldepo | null> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("id_type_transaction", TYPE_SOLICITUD)
    .single()

  if (error) throw error

  return data as Soldepo
}


// ✏ Actualizar solicitud
export const updateSoldepo = async (
  id: number,
  updateData: SoldepoUpdate
): Promise<void> => {
  const { error } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", id)
    .eq("id_type_transaction", TYPE_SOLICITUD)

  if (error) throw error
}


// 🗑 Soft delete
export const deleteSoldepo = async (
  id: number
): Promise<void> => {
  const { error } = await supabase
    .from("transactions")
    .update({
      id_status: 2
    })
    .eq("id", id)
    .eq("id_type_transaction", TYPE_SOLICITUD)

  if (error) throw error
}