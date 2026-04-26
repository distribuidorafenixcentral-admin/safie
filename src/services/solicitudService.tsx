import { supabase } from "@/lib/supabase"
import type { Solicitud, SolicitudInsert, SolicitudUpdate } from "@/types/solicitudes"

// 📌 Constante para identificar solicitudes
// 1= Solicitud de pago de servisios, 2= solicitud de pago de alquiler, 3= solicitud de pago de sueldos
const TYPE_SOLICITUD = [1, 2, 3] 
// 📌 Recuperar solicitudes
export const getSolicitudes = async () => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      branches(id, name_branch),
      employees(id, name),
      type_transaction(id, description)
    `)
    .in("id_type_transaction", [1, 2, 3])
    .neq("id_status", 2)
    .order("id", { ascending: false })

  if (error) throw error
  return data || []
}

// 📌 Crear solicitud
export const createSolicitud = async (solicitud: SolicitudInsert) => {
  const { error } = await supabase
    .from("transactions")
    .insert({
      ...solicitud,
      id_status: 1 // pendiente por defecto
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

// 📌 Actualizar solicitud
export const updateSolicitud = async (id: number, data: SolicitudUpdate) => {
  const { error } = await supabase
    .from("transactions")
    .update(data)
    .eq("id", id)
    .in("id_type_transaction", TYPE_SOLICITUD)

  if (error) throw error
}

// 📌 Eliminar solicitud (soft delete)
export const deleteSolicitud = async (id: number) => {
  const { error } = await supabase
    .from("transactions")
    .update({ id_status: 2 }) // eliminado
    .eq("id", id)
    .in("id_type_transaction", TYPE_SOLICITUD)

  if (error) throw error
}