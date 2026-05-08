import { supabase } from "@/lib/supabase"
import type {
  Soldepo,
  SoldepoInsert,
  SoldepoUpdate,
  SoldepoWithRelations
} from "@/types/soldepo"

// 📌 Tipo de transacción: 8 = Solicitud posible depósito
const TYPE_SOLICITUD = 8

// 📌 Estado: 1 = Pendiente, 2 = Eliminado (soft delete)

// 🔍 Recuperar solicitudes con relaciones completas (Lógica de Privacidad por Rol y Sucursal)
export const getSoldepo = async (role?: number, idBranch?: number): Promise<SoldepoWithRelations[]> => {
  // Mantenemos la consulta como un LEFT JOIN nativo sin el modificador !inner
  let query = supabase
    .from("transactions")
    .select(`
      id,
      created_at,
      id_type_transaction,
      id_branch,
      id_employee,
      id_customer,
      id_car,
      id_status,
      amount,
      costo,
      type_sale,
      type_pay,
      detail,
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

  // 🔒 Regla de negocio: Si es Rol 3, se restringe estrictamente a su sucursal asignada
  if (role === 3 && idBranch !== undefined && idBranch !== null) {
    query = query.eq("id_branch", idBranch)
  }

  const { data, error } = await query.order("id", { ascending: false })

  if (error) throw error

  // Se añade 'unknown' intermedio para asegurar la compatibilidad estricta de TypeScript con la consulta compleja
  return (data as unknown as SoldepoWithRelations[]) || []
}

// 🟢 Crear nueva solicitud
export const createSoldepo = async (
  soldepo: SoldepoInsert
): Promise<void> => {
  const { error } = await supabase
    .from("transactions")
    .insert({
      id_status: 1, // Siempre inicia pendiente por lógica de negocio
      ...soldepo,
      id_type_transaction: TYPE_SOLICITUD // Forzado para que siempre sea de tipo Depósito
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
