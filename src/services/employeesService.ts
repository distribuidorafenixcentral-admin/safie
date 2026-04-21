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
    .order("id", { ascending: true })

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
export const createEmployeeWithAuth = async (
  employee: EmployeeInsert,
  email: string,
  password: string
): Promise<Employee> => {
    console.log("📤 Enviando datos:", { email, password }) // 👈 AQUÍ

  // 1️⃣ Registrar usuario (FRONTEND)
  const { data: authData, error: authError } =
    await supabase.auth.signUp({
      email,
      password
    })
     console.log("📥 RESPUESTA AUTH:", authData)
  console.log("❌ ERROR AUTH:", authError)

  if (authError) {
    throw new Error(authError.message)
  }

  const userId = authData.user?.id

  if (!userId) {
    throw new Error("No se pudo crear el usuario")
  }

  // ⚠️ IMPORTANTE:
  // signUp cambia la sesión → evitamos romper el flujo
  await supabase.auth.signOut()

  // 2️⃣ Insertar empleado
  const { data, error } = await supabase
    .from("employees")
    .insert({
      ...employee,
      user_id: userId
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Employee
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