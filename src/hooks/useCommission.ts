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

  // =========================================
  // 📌 STATE PRINCIPAL (tabla)
  // =========================================
  const [groups, setGroups] = useState<CommissionGroup[]>([])

  // =========================================
  // 📌 STATE DETALLE (modal)
  // =========================================
  const [details, setDetails] = useState<CommissionDetail[]>([])

  // historial (header modal)
  const [history, setHistory] = useState<CommissionWithRelations[]>([])

  const [loading, setLoading] = useState(false)


  // =========================================
  // 📌 1. AGRUPAR DEPÓSITOS
  // =========================================
  const fetchGroups = useCallback(async () => {
    setLoading(true)

    try {
      const data = await getPendingCommissions()

      // 🔥 agrupación por empleado + sucursal
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
      console.error("Error cargando comisiones:", error)
    } finally {
      setLoading(false)
    }

  }, [])


  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])


  // =========================================
  // 📌 2. CARGAR DETALLE
  // =========================================
  const fetchDetails = async (employeeId: number, branchId: number) => {

    try {
      const data = await getCommissionDetails(employeeId, branchId)

      // 🔥 preparar datos editables
      const mapped: CommissionDetail[] = data.map(item => ({
        ...item,
        selected: false,
        commission_paid_amount: item.commission_paid_amount ?? 0
      }))

      setDetails(mapped)

      // 📌 historial
      const hist = await getPaidCommissionsHistory(employeeId, branchId)
      setHistory(hist)

    } catch (error) {
      console.error("Error cargando detalle:", error)
    }
  }


  // =========================================
  // 📌 3. SELECCIÓN
  // =========================================
  const toggleSelect = (id: number) => {
    setDetails(prev =>
      prev.map(d =>
        d.id === id ? { ...d, selected: !d.selected } : d
      )
    )
  }

  const selectAll = (value: boolean) => {
    setDetails(prev =>
      prev.map(d => ({ ...d, selected: value }))
    )
  }


  // =========================================
  // 📌 4. EDITAR COMISIÓN
  // =========================================
  const updateCommission = (id: number, value: number) => {

    setDetails(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, commission_paid_amount: value }
          : d
      )
    )
  }


  // =========================================
  // 📌 5. CÁLCULO
  // =========================================
  const selectedItems = details.filter(d => d.selected)

  const totalCalculated = selectedItems.reduce(
    (acc, d) => acc + (d.commission_paid_amount || 0),
    0
  )


  // =========================================
  // 📌 6. PAGAR COMISIONES
  // =========================================
  const processPayment = async (
    discount: number,
    detail: string
  ) => {

    const totalPaid = totalCalculated - discount

    const payload: PayCommissionPayload = {
      deposits: selectedItems.map(d => ({
        id: d.id,
        commission_paid_amount: d.commission_paid_amount
      })),
      totalCalculated,
      discount,
      totalPaid,
      detail
    }

    await payCommissions(payload)

    // refrescar todo
    await fetchGroups()

    // limpiar detalle
    setDetails([])
  }


  return {
    // tabla
    groups,
    loading,

    // detalle
    details,
    history,

    // acciones
    fetchGroups,
    fetchDetails,
    toggleSelect,
    selectAll,
    updateCommission,

    // cálculos
    selectedItems,
    totalCalculated,

    // proceso final
    processPayment
  }
}