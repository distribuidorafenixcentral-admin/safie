import { supabase } from "@/lib/supabase"
import type {
  CuentaInsert,
  CuentaUpdate
} from "@/types/cuentas"

// 🔹 Estado activo
const STATUS_ACTIVO = 1

// 📌 Obtener cuentas activas
export const getCuentas = async () => {
  const { data, error } = await supabase
    .from("cuentas")
    .select("*")
    .eq("status", STATUS_ACTIVO)
    .order("id", { ascending: true })

  if (error) throw error

  return data || []
}

// 📌 Obtener por ID
export const getCuentaById = async (id: number) => {
  const { data, error } = await supabase
    .from("cuentas")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error

  return data
}

// 📌 Crear cuenta
export const addCuenta = async (
  cuenta: CuentaInsert
) => {
  const { error } = await supabase
    .from("cuentas")
    .insert({
      ...cuenta,
      status: STATUS_ACTIVO
    })

  if (error) throw error
}

// 📌 Editar cuenta
export const editCuenta = async (
  id: number,
  cuenta: CuentaUpdate
) => {
  const { error } = await supabase
    .from("cuentas")
    .update(cuenta)
    .eq("id", id)

  if (error) throw error
}

// 📌 Baja lógica
export const removeCuenta = async (id: number) => {
  const { error } = await supabase
    .from("cuentas")
    .update({
      status: 0
    })
    .eq("id", id)

  if (error) throw error
}