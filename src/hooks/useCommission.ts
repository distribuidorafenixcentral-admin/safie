import { useEffect, useState, useCallback } from "react"
import {
  getPendingCommissions,
  getCommissionDetails,
  getPaidCommissionsHistory,
  payCommissions
} from "@/services/commissionsService"

import type {
  CommissionWithRelations,
  CommissionGroup,
  CommissionDetail,
  PayCommissionPayload
} from "@/types/commission"

export const useCommissions = () => {
  const [groups, setGroups] = useState<CommissionGroup[]>([])
  const [details, setDetails] = useState<CommissionDetail[]>([])
  const [history, setHistory] = useState<CommissionWithRelations[]>([])
  const [loading, setLoading] = useState(false)

  // 📌 1. AGRUPAR DEPÓSITOS POR EMPLEADO + SUCURSAL
  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPendingCommissions()
      const grouped = Object.values(
        data.reduce<Record<string, CommissionGroup>>((acc, item) => {
          const key = `${item.id_employee}-${item.id_branch}`
          if (!acc[key]) {
            acc[key] = {
              id_employee: item.id_employee,
              id_branch: item.id_branch,
              employee_name: item.employees?.name || "Sin nombre",
              branch_name: item.branches?.name_branch || "Sin sucursal",
              total_deposits: 0
            }
          }
          acc[key].total_deposits += 1
          return acc
        }, {})
      )
      setGroups(grouped)
    } catch (error) {
      console.error("Error cargando grupos de comisiones:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  // 📌 2. CARGAR DETALLE PENDIENTE + HISTORIAL
  const fetchDetails = async (employeeId: number, branchId: number) => {
    try {
      const data = await getCommissionDetails(employeeId, branchId)
      const mapped: CommissionDetail[] = data.map(item => ({
        ...item,
        selected: false,
        commission_paid_amount: item.commission_paid_amount ?? 0
      }))
      setDetails(mapped)

      const hist = await getPaidCommissionsHistory(employeeId, branchId)
      setHistory(hist)
    } catch (error) {
      console.error("Error cargando detalle:", error)
    }
  }

  // 📌 3. GESTIÓN DE SELECCIÓN EN UI
  const toggleSelect = (id: number) => {
    setDetails(prev => prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d))
  }

  const selectAll = (value: boolean) => {
    setDetails(prev => prev.map(d => ({ ...d, selected: value })))
  }

  const updateCommissionValue = (id: number, value: number) => {
    setDetails(prev => prev.map(d => d.id === id ? { ...d, commission_paid_amount: value } : d))
  }

  // 📌 4. CÁLCULOS AUTOMÁTICOS
  const selectedItems = details.filter(d => d.selected)
  const totalCalculated = selectedItems.reduce((acc, d) => acc + (d.commission_paid_amount || 0), 0)

  // 📌 5. PROCESAR LIQUIDACIÓN FINAL 🔥
  const processPayment = async (config: {
    id_employee: number
    id_branch: number
    id_cuenta: number | null
    type_pay: string
    discount: number
    detail: string
  }) => {
    const finalAmount = totalCalculated - config.discount

    const payload: PayCommissionPayload = {
      id_employee: config.id_employee,
      id_branch: config.id_branch,
      id_cuenta: config.id_cuenta,
      type_pay: config.type_pay,
      total_calculated: totalCalculated,
      discount: config.discount,
      amount: finalAmount,
      detail: config.detail,
      depositIds: selectedItems.map(d => d.id) // Solo IDs para la actualización por lotes
    }

    try {
      await payCommissions(payload)
      await fetchGroups() // Refrescar tabla principal
      setDetails([])      // Limpiar modal
      setHistory([])
    } catch (error) {
      console.error("Fallo al procesar el pago de comisiones:", error)
      throw error
    }
  }

  return {
    groups,
    loading,
    details,
    history,
    selectedItems,
    totalCalculated,
    fetchGroups,
    fetchDetails,
    toggleSelect,
    selectAll,
    updateCommissionValue,
    processPayment
  }
}
