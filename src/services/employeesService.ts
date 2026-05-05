import { supabase } from "@/lib/supabase"

import type {
  Employee,
  EmployeeInsert,
  EmployeeUpdate,
  EmployeeWithRelations
} from "@/types/employees"

// 🔹 Obtener empleados con relaciones
export const getEmployees = async (): Promise<EmployeeWithRelations[]> => {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      branch:branches(id, name_branch),
      role:role(id, role)
    `)
    .order("id", { ascending: false })

  if (error) throw new Error(error.message)

  return data as EmployeeWithRelations[]
}

// 🔹 Obtener uno por ID
export const getEmployeeById = async (
  id: number
): Promise<Employee | null> => {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }

  return data as Employee
}

// 🔥 🔥 🔥 CORREGIDO AQUÍ 🔥 🔥 🔥
// Crear empleado + usuario (frontend seguro)
export const createEmployee = async (employee: EmployeeInsert) => {
  const { data, error } = await supabase
    .from("employees")
    .insert(employee)
    .select()
    .single()

  if (error) throw error

  return data
}
// 🔹 Actualizar empleado
export const updateEmployee = async (
  id: number,
  updates: EmployeeUpdate
): Promise<Employee> => {
  const { data, error } = await supabase
    .from("employees")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data as Employee
}

// 🔹 Desactivar (soft delete)
export const deactivateEmployee = async (
  id: number
): Promise<Employee> => {
  const { data, error } = await supabase
    .from("employees")
    .update({ status: 0 })
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data as Employee
}