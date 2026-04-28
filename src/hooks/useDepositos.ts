import { useEffect, useState, useCallback } from "react"

import type {
  DepositoWithRelations,
  DepositoUpdate
} from "@/types/deposito"

import {
  getDepositos,
  confirmDeposito,
  rejectDeposito
} from "@/services/depositoService"

import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// 🔹 Constantes
const TYPE_SOLICITUD = 8
const STATUS_PENDIENTE = 1

// 📌 Hook central de depósitos
export const useDepositos = (search: string) => {

  const [depositos, setDepositos] = useState<DepositoWithRelations[]>([])

  // 🔥 Obtener datos iniciales
  const fetchDepositos = useCallback(async () => {
    try {
      const data = await getDepositos() as DepositoWithRelations[]
      setDepositos(data)
    } catch (error) {
      console.error("Error al obtener depósitos:", error)
    }
  }, [])

  useEffect(() => {
    fetchDepositos()
  }, [fetchDepositos])

  // 🔴 Realtime
  useRealtimeTable("transactions", (payload: any) => {

    const newItem = payload.new
    const oldItem = payload.old

    // 🔹 Validar que sea solicitud pendiente
    const isValidDeposito = (item: any) =>
      item &&
      item.id_type_transaction === TYPE_SOLICITUD &&
      item.id_status === STATUS_PENDIENTE

    // 📌 INSERT
    if (payload.eventType === "INSERT" && newItem) {
      if (isValidDeposito(newItem)) {
        // 🔥 Refresca para traer relaciones completas
        fetchDepositos()
      }
    }

    // 📌 UPDATE
    if (payload.eventType === "UPDATE" && newItem) {

      // Si deja de ser pendiente, eliminar de lista
      if (!isValidDeposito(newItem)) {
        setDepositos(prev =>
          prev.filter(i => i.id !== newItem.id)
        )
        return
      }

      // 🔥 Refrescar para mantener datos relacionados
      fetchDepositos()
    }

    // 📌 DELETE
    if (payload.eventType === "DELETE" && oldItem) {
      if (oldItem.id_type_transaction === TYPE_SOLICITUD) {
        setDepositos(prev =>
          prev.filter(i => i.id !== oldItem.id)
        )
      }
    }
  })

  // 🔍 Filtro búsqueda
  const filteredDepositos = depositos.filter(d =>
    d.detail?.toLowerCase().includes(search.toLowerCase()) ||
    d.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.cars?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.branches?.name_branch?.toLowerCase().includes(search.toLowerCase()) ||
    d.employees?.name?.toLowerCase().includes(search.toLowerCase()) ||
    String(d.amount).includes(search) ||
    String(d.costo ?? "").includes(search) ||
    String(d.id).includes(search)
  )

  // 📌 Confirmar / actualizar depósito
  const editDeposito = async (
    id: number,
    data: DepositoUpdate
  ) => {
    await confirmDeposito(id, data)

    // 🔥 Refrescar después de confirmar
    await fetchDepositos()
  }

  // 📌 Dar baja
  const removeDeposito = async (id: number) => {
    await rejectDeposito(id)

    // 🔥 Refrescar después de baja
    await fetchDepositos()
  }

  return {
    depositos,
    filteredDepositos,
    fetchDepositos,
    editDeposito,
    removeDeposito
  }
}