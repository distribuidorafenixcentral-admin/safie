import { useEffect, useState, useCallback } from "react"
import type { Branch } from "@/types/branch"
import { getBranches } from "@/services/branchService"
import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// Hook central de sucursales
export const useBranches = (search: string) => {

  const [branches, setBranches] = useState<Branch[]>([])

  // 🔹 Obtener datos iniciales
  const fetchBranches = useCallback(async () => {
    const data = await getBranches()
    setBranches(data)
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  // REALTIME (escucha cambios en la BD)
  useRealtimeTable("branches", (payload: any) => {

    // INSERT
    if (payload.eventType === "INSERT" && payload.new) {
      if (payload.new.status !== 2 && payload.new.id !== 1) {
        setBranches(prev => [payload.new, ...prev])
      }
    }

    // UPDATE
    if (payload.eventType === "UPDATE") {
      if (payload.new.status === 2) {
        setBranches(prev => prev.filter(i => i.id !== payload.new.id))
        return
      }

      setBranches(prev =>
        prev.map(i => i.id === payload.new.id ? payload.new : i)
      )
    }

    // DELETE
    if (payload.eventType === "DELETE") {
      setBranches(prev => prev.filter(i => i.id !== payload.old.id))
    }
  })

  // 🔍 Filtro buscamos por nombre y por direccion de la sucursal 
const filteredBranches = branches.filter(b =>
  b.name_branch?.toLowerCase().includes(search.toLowerCase()) ||
  b.adress_branch?.toLowerCase().includes(search.toLowerCase())
)


  return {
    branches,
    filteredBranches,
    fetchBranches
  }
}