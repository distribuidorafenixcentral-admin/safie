import { useEffect, useState, useCallback } from "react"

import type { PagosolWithRelations, PagossolUpdate } from "@/types/pagosol"

import { getPagossol, confirmPagosol, rejectPagosol } from "@/services/PagossolService"

import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// 🔹 Constantes
const TYPE_SOLICITUD = [1 ,2, 3]
const STATUS_PENDIENTE = 1

// 📌 Hook central de solicitudes de pago pendientes
export const usePagossol = (search: string) => {

  const [pagossol, setPagossol] = useState<PagosolWithRelations[]>([])
  
  // 🔥 Obtener datos iniciales
  const fetchPagossol = useCallback(async () => {
    try {
      const data = await getPagossol() as PagosolWithRelations[]
      setPagossol(data)
    } catch (error) {
      console.error("Error al obtener los registros:", error)
    }
  }, [])

  useEffect(() => {
    fetchPagossol()
  }, [fetchPagossol])

  // 🔴 Realtime
  useRealtimeTable("transactions", (payload: any) => {

    const newItem = payload.new
    const oldItem = payload.old

    // 🔹 Validar que sea solicitud pendiente
    const isValidPagossol = (item: any) =>
      item &&
      item.id_type_transaction === TYPE_SOLICITUD &&
      item.id_status === STATUS_PENDIENTE

    // 📌 INSERT
    if (payload.eventType === "INSERT" && newItem) {
      if (isValidPagossol(newItem)) {
        // 🔥 Refresca para traer relaciones completas
        fetchPagossol()
      }
    }

    // 📌 UPDATE
    if (payload.eventType === "UPDATE" && newItem) {

      // Si deja de ser pendiente, eliminar de lista
      if (!isValidPagossol(newItem)) {
        setPagossol(prev =>
          prev.filter(i => i.id !== newItem.id)
        )
        return
      }

      // 🔥 Refrescar para mantener datos relacionados
      fetchPagossol()
    }

    // 📌 DELETE
    if (payload.eventType === "DELETE" && oldItem) {
      if (oldItem.id_type_transaction === TYPE_SOLICITUD) {
        setPagossol(prev =>
          prev.filter(i => i.id !== oldItem.id)
        )
      }
    }
  })

  // 🔍 Filtro búsqueda
  const filteredPagossol = pagossol.filter(d =>
    d.detail?.toLowerCase().includes(search.toLowerCase()) ||
    d.branches?.name_branch?.toLowerCase().includes(search.toLowerCase()) ||
    d.employees?.name?.toLowerCase().includes(search.toLowerCase()) ||
    String(d.amount).includes(search) ||
    String(d.id).includes(search)
  )

  // 📌 Confirmar / actualizar depósito
  const editPagossol = async (
    id: number,
    data: PagossolUpdate
  ) => {
    await confirmPagosol(id, data)

    // 🔥 Refrescar después de confirmar
    await fetchPagossol()
  }

  // 📌 Dar baja
  const removePagossol = async (id: number) => {
    await rejectPagosol(id)

    // 🔥 Refrescar después de baja
    await fetchPagossol()
  }

  return {
    pagossol,
    filteredPagossol,
    fetchPagossol,
    editPagossol,
    removePagossol
  }
}