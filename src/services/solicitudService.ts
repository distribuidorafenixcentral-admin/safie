import { supabase } from "@/lib/supabase"
import type { Solicitud, SolicitudInsert, SolicitudUpdate, SolicitudWithRelations } from "@/types/solicitudes"

// 📌 Constante para identificar solicitudes
// 1 = Solicitud de pago de servicios, 2 = solicitud de pago de alquiler, 3 = solicitud de pago de sueldos
const TYPE_SOLICITUD = [1, 2, 3]

// 📌 Recuperar solicitudes filtradas por Rol y Sucursal (Lógica de Privacidad)
export const getSolicitudes = async (role?: number, idBranch?: number): Promise<SolicitudWithRelations[]> => {
  // 💡 Se eliminó el '!inner' para actuar como LEFT JOIN y permitir la visualización de roles 1 y 2
  let query = supabase
    .from("transactions")
    .select(`
      id,
      created_at,
      id_type_transaction,
      id_branch,
      id_employee,
      amount,
      detail,
      id_status,
      branches(id, name_branch),
      employees(id, name),
      type_transaction(id, description, type_trans)
    `)
    .in("id_type_transaction", TYPE_SOLICITUD)
    .neq("id_status", 2)

  // 🔒 Regla de negocio: Si es Rol 3, se restringe estrictamente a su sucursal asignada
  if (role === 3 && idBranch !== undefined && idBranch !== null) {
    query = query.eq("id_branch", idBranch)
  }

  const { data, error } = await query.order("id", { ascending: false })

  if (error) throw error
  return (data as unknown as SolicitudWithRelations[]) || []
}

// 📌 Crear nueva solicitud
export const createSolicitud = async (solicitud: SolicitudInsert) => {
  const { error } = await supabase
    .from("transactions")
    .insert({
      id_status: 1, // Pendiente por defecto
      ...solicitud   // Permite sobreescribir campos si vienen explícitos
    })

  if (error) throw error
}

// 📌 Obtener una solicitud por ID
export const getSolicitudById = async (id: number): Promise<Solicitud | null> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .in("id_type_transaction", TYPE_SOLICITUD)
    .single()

  if (error) throw error
  return data
}

// 📌 Actualizar solicitud existente
export const updateSolicitud = async (id: number, data: SolicitudUpdate) => {
  const { error } = await supabase
    .from("transactions")
    .update(data)
    .eq("id", id)
    .in("id_type_transaction", TYPE_SOLICITUD)

  if (error) throw error
}

// 📌 Eliminar solicitud (Soft Delete)
export const deleteSolicitud = async (id: number) => {
  const { error } = await supabase
    .from("transactions")
    .update({ id_status: 2 }) // 2 = Eliminado / Inactivo
    .eq("id", id)
    .in("id_type_transaction", TYPE_SOLICITUD)

  if (error) throw error
}
