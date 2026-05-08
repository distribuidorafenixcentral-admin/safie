import { useEffect, useState, useCallback, useMemo } from "react"
import { useAuth } from "@/context/AuthContext" 

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
  const { profile } = useAuth() // 
  const [employees, setEmployees] = useState<EmployeeWithRelations[]>([])

  // 🧠 Lógica de Roles y Filtros calculada dinámicamente
  const branchIdToFilter = useMemo(() => {
    if (!profile) return null
    
    // Roles 1 y 2: Administradores Globales (retorna null para traer todo)
    if (profile.id_role === 1 || profile.id_role === 2) {
      return null
    }
    
    // Rol 3: Administrador de Sucursal (retorna el id de sucursal asignado)
    if (profile.id_role === 3) {
      return profile.id_branch
    }

    return null
  }, [profile])

  // 🔹 Obtener datos iniciales pasando el filtro correspondiente
  const fetchEmployees = useCallback(async () => {
    // Si el perfil no ha cargado, evitamos hacer la consulta aún
    if (!profile) return 

    const data = await getEmployees(branchIdToFilter) // Enviamos el filtro al servicio
    setEmployees(data)
  }, [branchIdToFilter, profile])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // 🔴 Realtime (Mantiene el filtro al actualizarse la base de datos)
  useRealtimeTable("employees", async (payload: any) => {
    if (
      payload.eventType === "INSERT" ||
      payload.eventType === "UPDATE" ||
      payload.eventType === "DELETE"
    ) {
      await fetchEmployees()
    }
  })

  // 🔍 Filtro de búsqueda en Frontend (Sobre el universo de datos ya filtrado por backend)
  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      (e.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      e.ci.toLowerCase().includes(search.toLowerCase()) ||
      (e.reference ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.branch?.name_branch ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.role?.role ?? "").toLowerCase().includes(search.toLowerCase())
    )
  }, [employees, search])

  // ➕ Crear empleado
  const addEmployee = async (employee: EmployeeInsert) => {
    const newEmployee = await createEmployee(employee)
    return newEmployee
  }

  // ✏️ Editar
  const editEmployee = async (
    id: number,
    updates: EmployeeUpdate
  ) => {
    const updated = await updateEmployee(id, updates)
    return updated
  }

  // ❌ Desactivar
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
    removeEmployee,
    
    // 💡 Propiedades útiles para tu modal o vista:
    idRoleCurrentUser: profile?.id_role,
    idBranchCurrentUser: profile?.id_branch
  }
}
