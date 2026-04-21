import { useEffect, useState, useCallback, useMemo } from "react"

import type {
  EmployeeInsert,
  EmployeeUpdate,
  EmployeeWithRelations
} from "@/types/employees"

import {
  getEmployees,
  createEmployeeWithAuth,
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

  // 🔴 Realtime (escucha cambios en BD)
  useRealtimeTable("employees", (payload: any) => {

    // INSERT
    if (payload.eventType === "INSERT" && payload.new) {
      // puedes filtrar por status si quieres ocultar inactivos
      if (payload.new.status !== 0) {
        setEmployees(prev => [payload.new, ...prev])
      }
    }

    // UPDATE
    if (payload.eventType === "UPDATE") {

      // si se desactiva → lo quitamos
      if (payload.new.status === 0) {
        setEmployees(prev => prev.filter(e => e.id !== payload.new.id))
        return
      }

      setEmployees(prev =>
        prev.map(e => e.id === payload.new.id ? payload.new : e)
      )
    }

    // DELETE (poco común si usas soft delete)
    if (payload.eventType === "DELETE") {
      setEmployees(prev => prev.filter(e => e.id !== payload.old.id))
    }
  })

  // 🔍 Filtro de búsqueda
  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      (e.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      e.ci.toLowerCase().includes(search.toLowerCase()) ||
      (e.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.reference ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.branch?.name_branch ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.role?.role ?? "").toLowerCase().includes(search.toLowerCase())
    )
  }, [employees, search])

  // ➕ Crear empleado con usuario
  const addEmployee = async (
    employee: EmployeeInsert,
    email: string,
    password: string
  ) => {
    const newEmployee = await createEmployeeWithAuth(
      employee,
      email,
      password
    )

    // opcional: puedes comentar esto si usas realtime
    setEmployees(prev => [newEmployee, ...prev])

    return newEmployee
  }

  // ✏️ Editar
  const editEmployee = async (
    id: number,
    updates: EmployeeUpdate
  ) => {
    const updated = await updateEmployee(id, updates)

    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, ...updated } : e)
    )

    return updated
  }

  // ❌ Desactivar (soft delete)
  const removeEmployee = async (id: number) => {
    const updated = await deactivateEmployee(id)

    setEmployees(prev =>
      prev.filter(e => e.id !== id)
    )

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