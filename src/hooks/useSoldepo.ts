import { useEffect, useState, useCallback } from "react"

import type {
  SoldepoWithRelations,
  SoldepoInsert,
  SoldepoUpdate
} from "@/types/soldepo"

import {
  getSoldepo,
  createSoldepo,
  updateSoldepo,
  deleteSoldepo
} from "@/services/SoldepoService"

import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// 🔹 Tipo válido del módulo
const TYPE_SOLICITUD = 8

// 🔹 Estado eliminado
const STATUS_ELIMINADO = 2


export const useSoldepo = (search: string) => {

  // 📌 Estado principal
  const [soldepo, setSoldepo] = useState<SoldepoWithRelations[]>([])


  // 🔍 Obtener datos iniciales
  const fetchSoldepo = useCallback(async () => {
    try {
      const data = await getSoldepo()
      setSoldepo(data)
    } catch (error) {
      console.error("Error cargando solicitudes:", error)
    }
  }, [])


  useEffect(() => {
    fetchSoldepo()
  }, [fetchSoldepo])


  // 🔴 Realtime
  useRealtimeTable("transactions", (payload: any) => {

    const newItem = payload.new
    const oldItem = payload.old

    // Validar si pertenece al módulo
    const isSolicitud = (item: any) =>
      item &&
      item.id_type_transaction === TYPE_SOLICITUD


    // 🟢 INSERT
    if (payload.eventType === "INSERT" && newItem) {
      if (
        isSolicitud(newItem) &&
        newItem.id_status !== STATUS_ELIMINADO
      ) {
        fetchSoldepo()
      }
    }


    // 🟡 UPDATE
    if (payload.eventType === "UPDATE" && newItem) {

      // Si deja de ser válido o fue eliminado
      if (
        !isSolicitud(newItem) ||
        newItem.id_status === STATUS_ELIMINADO
      ) {
        setSoldepo(prev =>
          prev.filter(item => item.id !== newItem.id)
        )
        return
      }

      // Refrescar para mantener relaciones correctas
      fetchSoldepo()
    }


    // 🔴 DELETE real
    if (payload.eventType === "DELETE" && oldItem) {
      if (isSolicitud(oldItem)) {
        setSoldepo(prev =>
          prev.filter(item => item.id !== oldItem.id)
        )
      }
    }

  })


  // 🔍 Búsqueda flexible
  const filteredSoldepo = soldepo.filter(item => {

    const searchLower = search.toLowerCase()

    return (
      item.detail?.toLowerCase().includes(searchLower) ||

      String(item.amount).includes(search) ||

      String(item.costo ?? "").includes(search) ||

      String(item.id).includes(search) ||

      item.customers?.name?.toLowerCase().includes(searchLower) ||

      item.cars?.name?.toLowerCase().includes(searchLower) ||

      item.branches?.name_branch?.toLowerCase().includes(searchLower) ||

      item.employees?.name?.toLowerCase().includes(searchLower)
    )
  })


  // 🟢 Crear
  const addSoldepo = async (
    data: SoldepoInsert
  ): Promise<void> => {
    await createSoldepo(data)
  }


  // ✏ Actualizar
  const editSoldepo = async (
    id: number,
    data: SoldepoUpdate
  ): Promise<void> => {
    await updateSoldepo(id, data)
  }


  // 🗑 Eliminar lógico
  const removeSoldepo = async (
    id: number
  ): Promise<void> => {
    await deleteSoldepo(id)
  }


  return {
    soldepo,
    filteredSoldepo,
    fetchSoldepo,

    addSoldepo,
    editSoldepo,
    removeSoldepo
  }
}