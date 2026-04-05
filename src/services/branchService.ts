import { supabase } from "@/lib/supabase" 
import type { Branch } from "@/types/branch"

// 📌 Recuperaoms datos de la tabla branches => sucursales 
export const getBranches = async (): Promise<Branch[]> => {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .neq("id", 1)       // excluir registro de Oficina Central
    .neq("status", 2)   // excluir registros inactivos (soft delete)
    .order("id", { ascending: false })

  if (error) throw error
  return data || []
}

// 📌 Crear sucursal
export const createBranch = async (branch: Partial<Branch>) => {
  const { error } = await supabase
    .from("branches")
    .insert({ ...branch, status: 1 }) // Todo registro es activo automaticamente 

  if (error) throw error
}

// 📌 Validar duplicados
export const checkDuplicateBranch = async (name: string) => {
  const { data, error } = await supabase
    .from("branches")
    .select("id, status")
    .eq("name_branch", name)

    if (error) throw error

    if (!data || data.length === 0) {
      return { exists: false, inactive: false }
    }

    const branch = data[0]

    return {
      exists: branch.status !== 2,
      inactive: branch.status === 2
    }
  }

// 📌 Actualizar sucursal => unicamente se podra actualizar la dirección
export const updateBranch = async (id: number, data: Partial<Branch>) => {
  const { error } = await supabase
    .from("branches")
    .update(data)
    .eq("id", id)

  if (error) throw error
}

// 📌 Eliminar (soft delete)
export const deleteBranch = async (id: number) => {
  const { error } = await supabase
    .from("branches")
    .update({ status: 2 })
    .eq("id", id)

  if (error) throw error
}

