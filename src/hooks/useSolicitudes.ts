import { useEffect, useState, useCallback } from "react"
import type { Solicitud, SolicitudInsert, SolicitudUpdate } from "@/types/solicitudes"

import {
  getSolicitudes,
  createSolicitud,
  updateSolicitud,
  deleteSolicitud
} from "@/services/solicitudService"

import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// 🔹 Tipos válidos de solicitudes
const TYPE_SOLICITUD = [1, 2, 3]

// Hook central de solicitudes
export const useSolicitudes = (search: string) => {

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])

  // 🔹 Obtener datos iniciales
  const fetchSolicitudes = useCallback(async () => {
    const data = await getSolicitudes()
    setSolicitudes(data)
  }, [])

  useEffect(() => {
    fetchSolicitudes()
  }, [fetchSolicitudes])

  // 🔴 Realtime (escucha cambios en transactions)
  useRealtimeTable("transactions", (payload: any) => {

    const newItem = payload.new
    const oldItem = payload.old

    // 🔹 Validar que sea una solicitud
    const isSolicitud = (item: any) =>
      item && TYPE_SOLICITUD.includes(item.id_type_transaction)

    // INSERT
    if (payload.eventType === "INSERT" && newItem) {
      if (isSolicitud(newItem) && newItem.id_status !== 2) {
        setSolicitudes(prev => [newItem, ...prev])
      }
    }

    // UPDATE
    if (payload.eventType === "UPDATE" && newItem) {

      if (!isSolicitud(newItem) || newItem.id_status === 2) {
        setSolicitudes(prev => prev.filter(i => i.id !== newItem.id))
        return
      }

      setSolicitudes(prev =>
        prev.map(i => i.id === newItem.id ? newItem : i)
      )
    }

    // DELETE
    if (payload.eventType === "DELETE" && oldItem) {
      if (isSolicitud(oldItem)) {
        setSolicitudes(prev => prev.filter(i => i.id !== oldItem.id))
      }
    }
  })

  // 🔍 Filtro
  const filteredSolicitudes = solicitudes.filter(s =>
    s.detail.toLowerCase().includes(search.toLowerCase()) ||
    String(s.amount).includes(search) ||
    String(s.id).includes(search)
  )

  // 📌 Crear
  const addSolicitud = async (data: SolicitudInsert) => {
    await createSolicitud(data)
  }

  // 📌 Actualizar
  const editSolicitud = async (id: number, data: SolicitudUpdate) => {
    await updateSolicitud(id, data)
  }

  // 📌 Eliminar (soft delete)
  const removeSolicitud = async (id: number) => {
    await deleteSolicitud(id)
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