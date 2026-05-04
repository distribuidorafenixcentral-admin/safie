import { useEffect, useState, useCallback } from "react"
import type { Compra, CompraInsert } from "@/types/compra"

import {
  getCompras,
  createCompra,
  getCompraById
} from "@/services/comprasService"

import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

export const useCompras = (search: string) => {

  const [compras, setCompras] = useState<Compra[]>([])

  const fetchCompras = useCallback(async () => {
    const data = await getCompras()
    setCompras(data)
  }, [])

  useEffect(() => {
    fetchCompras()
  }, [fetchCompras])

  // REALTIME
  useRealtimeTable("transactions", (payload: any) => {

    const newItem = payload.new

    const isCompra = (item: any) =>
      item && [5, 6, 7].includes(item.id_type_transaction)

    if (payload.eventType === "INSERT" && newItem) {

      if (isCompra(newItem) && newItem.id_status !== 4) {

        (async () => {
          const full = await getCompraById(newItem.id)

          if (!full) return

          setCompras(prev => [full, ...prev])
        })()
      }
    }
  })

  // FILTER
  const filteredCompra = compras.filter(s =>
    (s.detail?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
    String(s.amount).includes(search) ||
    String(s.id).includes(search) ||
    (s.type_pay?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
    String(s.id_branch).includes(search)
  )

  // CREATE
  const addCompra = async (data: CompraInsert) => {
    await createCompra(data)
  }

  return {
    compras,
    filteredCompra,
    addCompra,
    fetchCompras
  }
}