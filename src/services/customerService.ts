import { supabase } from "@/lib/supabase" 
import type { Customer } from "@/types/customer"

// 📌 Recuperaoms datos de la tabla customers => clientes 
export const getCustomer = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")        
    .neq("status", 2)   // excluir registros inactivos (soft delete)
    .order("id", { ascending: false }) // orden descendente

  if (error) throw error
  return data || []
}

// 📌 Crear Cliente
export const createCustomer = async (customer: Partial<Customer>) => {
  const { error } = await supabase
    .from("customers")
    .insert({ ...customer, status: 1 }) // Todo registro es activo automaticamente 

  if (error) throw error
}

// 📌 Validar duplicados en ci
export const checkDuplicateCustomer = async (ci: string) => {
  const { data } = await supabase
    .from("customers")
    .select("id")
    .eq("ci", ci)

  return data && data.length > 0
}

// 📌 Actualizar Cliente => unicamente se podra actualizar la dirección
export const updateCustomer = async (id: number, data: Partial<Customer>) => {
  const { error } = await supabase
    .from("customers")
    .update(data)
    .eq("id", id)

  if (error) throw error
}

// 📌 Eliminar (soft delete)
export const deleteCustomer = async (id: number) => {
  const { error } = await supabase
    .from("customers")
    .update({ status: 2 })
    .eq("id", id)

  if (error) throw error
}

