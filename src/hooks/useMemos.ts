import { useEffect, useState, useCallback } from "react"
import type {
  MemosWithRelations,
  MemosInsert,
  MemosUpdate
} from "@/types/memos"

import {
  getMemos,
  createMemo,
  updateMemo,
  deleteMemo,
  getMemoWithRelationsById
} from "@/services/memosService"

import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// 🔹 constante del módulo
const TYPE_MEMO = 9

export const useMemos = (search: string) => {

  const [memos, setMemos] = useState<MemosWithRelations[]>([])

  //
  // 📌 FETCH INICIAL
  //
  const fetchMemos = useCallback(async () => {
    const data = await getMemos()
    setMemos(data)
  }, [])

  useEffect(() => {
    fetchMemos()
  }, [fetchMemos])

  //
  // 🔴 REALTIME
  //
  useRealtimeTable("transactions", (payload: any) => {

    const handleRealtime = async () => {

      const newItem = payload.new
      const oldItem = payload.old

      const isMemo = (item: any) =>
        item && item.id_type_transaction === TYPE_MEMO

      //
      // 🟢 INSERT
      //
      if (payload.eventType === "INSERT" && newItem) {
        if (isMemo(newItem) && newItem.id_status !== 4) {

          const full = await getMemoWithRelationsById(newItem.id)

          setMemos(prev => [full, ...prev])
        }
      }

      //
      // 🟡 UPDATE
      //
      if (payload.eventType === "UPDATE" && newItem) {
        if (!isMemo(newItem)) return

        // 🔥 si fue eliminado (soft)
        if (newItem.id_status === 4) {
          setMemos(prev => prev.filter(i => i.id !== newItem.id))
          return
        }

        const full = await getMemoWithRelationsById(newItem.id)

        setMemos(prev =>
          prev.map(i => i.id === newItem.id ? full : i)
        )
      }

      //
      // 🔴 DELETE (por si acaso)
      //
      if (payload.eventType === "DELETE" && oldItem) {
        if (isMemo(oldItem)) {
          setMemos(prev => prev.filter(i => i.id !== oldItem.id))
        }
      }
    }

    handleRealtime()
  })

  //
  // 🔍 FILTRO
  //
  const filteredMemos = memos.filter(m =>
    m.detail?.toLowerCase().includes(search.toLowerCase()) ||
    String(m.amount).includes(search) ||
    String(m.id).includes(search) ||
    (m.branches?.name_branch ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (m.employees?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (m.status_transaction?.status ?? "").toLowerCase().includes(search.toLowerCase())
  )

  //
  // 📌 CREAR
  //
  const addMemos = async (data: MemosInsert) => {
    await createMemo(data)
  }

  //
  // 📌 EDITAR
  //
  const editMemos = async (id: number, data: MemosUpdate) => {

    const memo = memos.find(m => m.id === id)

    // 🔒 regla: no editar si está pagado
    if (memo?.id_status === 2) {
      throw new Error("No se puede editar un registro pagado")
    }

    await updateMemo(id, data)
  }

  //
  // 📌 ELIMINAR
  //
  const removeMemos = async (id: number) => {
    await deleteMemo(id)
  }

  return {
    memos,
    filteredMemos,
    fetchMemos,
    addMemos,
    editMemos,
    removeMemos
  }
}