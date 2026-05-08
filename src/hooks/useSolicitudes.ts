import { useEffect, useState, useCallback } from "react"
import type { SolicitudInsert, SolicitudUpdate, SolicitudWithRelations } from "@/types/solicitudes"
import { supabase } from "@/lib/supabase"

import {
  getSolicitudes,
  createSolicitud,
  updateSolicitud,
  deleteSolicitud
} from "@/services/solicitudService"

import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// 📌 Tipos válidos de solicitudes (1 = Servicios, 2 = Alquiler, 3 = Sueldos)
const TYPE_SOLICITUD = [1, 2, 3]

/**
 * Hook central para la gestión de solicitudes con soporte de Roles y Sucursales
 * @param search Término de búsqueda de la UI
 * @param role ID del rol del usuario (1, 2 = Ver todo / 3 = Solo su sucursal)
 * @param idBranch ID de la sucursal asignada al usuario
 */
export const useSolicitudes = (search: string, role?: number, idBranch?: number) => {
  const [solicitudes, setSolicitudes] = useState<SolicitudWithRelations[]>([])

  // 🔹 Obtener datos iniciales desde el servidor aplicando las restricciones de rol
  const fetchSolicitudes = useCallback(async () => {
    if (role === undefined) return // Esperar a que el perfil esté cargado en la App
    
    try {
      const data = await getSolicitudes(role, idBranch)
      setSolicitudes(data)
    } catch (error) {
      console.error("Error al cargar solicitudes:", error)
    }
  }, [role, idBranch])

  useEffect(() => {
    fetchSolicitudes()
  }, [fetchSolicitudes])

  // 🔹 Helper para consultar una sola fila respetando la seguridad del rol 3
  const fetchSingleWithRelations = async (id: number): Promise<SolicitudWithRelations | null> => {
    let query = supabase
      .from("transactions")
      .select(`
        id, created_at, id_type_transaction, id_branch, id_employee, amount, detail, id_status,
        branches!inner(id, name_branch),
        employees!inner(id, name),
        type_transaction!inner(id, description, type_trans)
      `)
      .eq("id", id)

    if (role === 3 && idBranch) {
      query = query.eq("id_branch", idBranch)
    }

    const { data } = await query.single()
    return data as unknown as SolicitudWithRelations
  }

  // 🔴 Lógica de Tiempo Real (Sincronización instantánea con filtros de privacidad)
  useRealtimeTable("transactions", async (payload: any) => {
    if (role === undefined) return

    const newItem = payload.new
    const oldItem = payload.old

    // Valida que el registro corresponda al módulo de solicitudes (1, 2 o 3)
    const isSolicitud = (item: any) =>
      item && TYPE_SOLICITUD.includes(item.id_type_transaction)

    // Valida si el registro pertenece a la sucursal permitida en caso de ser Rol 3
    const belongsToBranch = (item: any) => 
      role !== 3 || (item && Number(item.id_branch) === Number(idBranch))

    // 1️⃣ EVENTO: INSERT
    if (payload.eventType === "INSERT" && newItem) {
      if (isSolicitud(newItem) && newItem.id_status !== 2 && belongsToBranch(newItem)) {
        const enrichedItem = await fetchSingleWithRelations(newItem.id)
        if (enrichedItem) {
          setSolicitudes(prev => [enrichedItem, ...prev])
        }
      }
    }

    // 2️⃣ EVENTO: UPDATE
    if (payload.eventType === "UPDATE" && newItem) {
      // Si ya no pertenece al módulo, fue eliminado (status 2) o se movió a otra sucursal Prohibida:
      if (!isSolicitud(newItem) || newItem.id_status === 2 || !belongsToBranch(newItem)) {
        setSolicitudes(prev => prev.filter(i => i.id !== newItem.id))
        return
      }

      const enrichedItem = await fetchSingleWithRelations(newItem.id)
      if (enrichedItem) {
        setSolicitudes(prev =>
          prev.map(i => i.id === newItem.id ? enrichedItem : i)
        )
      }
    }

    // 3️⃣ EVENTO: DELETE
    if (payload.eventType === "DELETE" && oldItem) {
      if (isSolicitud(oldItem) && belongsToBranch(oldItem)) {
        setSolicitudes(prev => prev.filter(i => i.id !== oldItem.id))
      }
    }
  })

  // 🔍 Filtro inteligente local (Busca en campos directos y en nombres relacionales)
  const filteredSolicitudes = solicitudes.filter(s =>
    s.detail.toLowerCase().includes(search.toLowerCase()) ||
    String(s.amount).includes(search) ||
    String(s.id).includes(search) ||
    s.branches?.name_branch.toLowerCase().includes(search.toLowerCase()) ||
    s.employees?.name.toLowerCase().includes(search.toLowerCase()) ||
    s.type_transaction?.description.toLowerCase().includes(search.toLowerCase())
  )

  // 📌 Acción: Crear nueva solicitud
  const addSolicitud = async (data: SolicitudInsert) => {
    try {
      await createSolicitud(data)
    } catch (error) {
      console.error("Error al crear solicitud:", error)
      throw error
    }
  }

  // 📌 Acción: Actualizar solicitud existente
  const editSolicitud = async (id: number, data: SolicitudUpdate) => {
    try {
      await updateSolicitud(id, data)
    } catch (error) {
      console.error("Error al actualizar solicitud:", error)
      throw error
    }
  }

  // 📌 Acción: Eliminar solicitud (Soft Delete)
  const removeSolicitud = async (id: number) => {
    try {
      await deleteSolicitud(id)
    } catch (error) {
      console.error("Error al eliminar solicitud:", error)
      throw error
    }
  }

  return {
    solicitudes,
    filteredSolicitudes,
    fetchSolicitudes,
    addSolicitud,
    editSolicitud,
    removeSolicitud
  }
}
