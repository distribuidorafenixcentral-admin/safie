import { useEffect, useState, useCallback } from "react"

import type {
  Deposito,
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

  const [depositos, setDepositos] = useState<Deposito[]>([])

  // 🔥 Obtener datos iniciales
  const fetchDepositos = useCallback(async () => {
    const data = await getDepositos() as Deposito[]
    setDepositos(data)
  }, [])

  useEffect(() => {
    fetchDepositos()
  }, [fetchDepositos])

  // 🔴 Realtime
  useRealtimeTable("transactions", (payload: any) => {

    const newItem = payload.new
    const oldItem = payload.old

    // 🔹 Validar que sea solicitud de depósito pendiente
    const isValidDeposito = (item: any) =>
      item &&
      item.id_type_transaction === TYPE_SOLICITUD &&
      item.id_status === STATUS_PENDIENTE

    // 📌 INSERT
    if (payload.eventType === "INSERT" && newItem) {
      if (isValidDeposito(newItem)) {
        // 🔥 Refrescamos para obtener relaciones completas
        fetchDepositos()
      }
    }

    // 📌 UPDATE
    if (payload.eventType === "UPDATE" && newItem) {

      // Si ya no cumple condiciones (confirmado o eliminado)
      if (!isValidDeposito(newItem)) {
        setDepositos(prev =>
          prev.filter(i => i.id !== newItem.id)
        )
        return
      }

      // 🔥 Refrescamos para mantener relaciones correctas
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
    d.detail.toLowerCase().includes(search.toLowerCase()) ||
    String(d.amount).includes(search) ||
    String(d.id).includes(search)
  )

  // 📌 Confirmar / actualizar depósito
  const editDeposito = async (
    id: number,
    data: DepositoUpdate
  ) => {
    await confirmDeposito(id, data)
  }

  // 📌 Dar baja
  const removeDeposito = async (id: number) => {
    await rejectDeposito(id)
  }

  return {
    depositos,
    filteredDepositos,
    fetchDepositos,
    editDeposito,
    removeDeposito
  }
}