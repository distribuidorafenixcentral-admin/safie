import { useEffect, useState, useCallback } from "react"

import {
  getDepositsForRestitution,
  createRestitution
} from "@/services/restitutionsService"

import type {
  RestitutionWithRelations,
  RestitutionPayload
} from "@/types/restitution"

export const useRestitutions = (search: string) => {

  const [deposits, setDeposits] = useState<RestitutionWithRelations[]>([])

  // =====================================================
  // 📌 FETCH
  // =====================================================
  const fetchDeposits = useCallback(async () => {
    const data = await getDepositsForRestitution()
    setDeposits(data)
  }, [])

  useEffect(() => {
    fetchDeposits()
  }, [fetchDeposits])

  // =====================================================
  // 📌 CALCULAR DISPONIBLE
  // =====================================================
  const depositsWithBalance = deposits.map(d => {

    const returned = d.restitution_amount || 0
    const available = d.amount - returned

    return {
      ...d,
      max_available: available
    }
  })

  // =====================================================
  // 📌 FILTER
  // =====================================================
  const filteredDeposits = depositsWithBalance.filter(d =>
    (d.detail?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
    String(d.amount).includes(search) ||
    String(d.id).includes(search)
  )

  // =====================================================
  // 📌 ACTION: RESTITUIR
  // =====================================================
  const handleRestitution = async (payload: RestitutionPayload) => {
    await createRestitution(payload)

    // 🔥 refrescar datos
    await fetchDeposits()
  }

  return {
    deposits: depositsWithBalance,
    filteredDeposits,
    handleRestitution,
    fetchDeposits
  }
}