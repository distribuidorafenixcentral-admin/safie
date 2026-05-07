import { useEffect, useState, useCallback, useMemo } from "react"

import type {
  EmployeeInsert,
  EmployeeUpdate,
  EmployeeWithRelations
} from "@/types/employees"

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee
} from "@/services/employeesService"

import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// Hook principal de empleados
export const useEmployees = (search: string) => {
  const [employees, setEmployees] = useState<EmployeeWithRelations[]>([])

  // 🔹 Obtener datos iniciales
  const fetchEmployees = useCallback(async () => {
    const data = await getEmployees()
    setEmployees(data)
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // 🔴 Realtime (simplificado y estable)
  useRealtimeTable("employees", async (payload: any) => {
    if (
      payload.eventType === "INSERT" ||
      payload.eventType === "UPDATE" ||
      payload.eventType === "DELETE"
    ) {
      await fetchEmployees()
    }
  })

  // 🔍 Filtro de búsqueda
  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      (e.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      e.ci.toLowerCase().includes(search.toLowerCase()) ||
      (e.reference ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.branch?.name_branch ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.role?.role ?? "").toLowerCase().includes(search.toLowerCase())
    )
  }, [employees, search])

  // ➕ Crear empleado (sin set manual, lo maneja realtime)
  const addEmployee = async (employee: EmployeeInsert) => {
    const newEmployee = await createEmployee(employee)
    return newEmployee
  }

  // ✏️ Editar (sin set manual)
  const editEmployee = async (
    id: number,
    updates: EmployeeUpdate
  ) => {
    const updated = await updateEmployee(id, updates)
    return updated
  }

  // ❌ Desactivar (sin set manual)
  const removeEmployee = async (id: number) => {
    const updated = await deactivateEmployee(id)
    return updated
  }

  return {
    employees,
    filteredEmployees,

    fetchEmployees,

    addEmployee,
    editEmployee,
    removeEmployee
  }
}