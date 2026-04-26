import { supabase } from "@/lib/supabase" 
import type { Vehiculo } from "@/types/vehiculo"

// 📌 Recuperaoms datos de la tabla vehiculos
export const getVehiculos = async (): Promise<Vehiculo[]> => {
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .neq("status", 2)   // excluir registros inactivos (soft delete)
    .order("id", { ascending: false })
    if (error) throw error
    return data || []
}

// 📌 Crear vehiculo
export const createVehiculo = async (vehiculo: Partial<Vehiculo>) => {
  const { error } = await supabase
    .from("cars")
    .insert({ ...vehiculo, status: 1 }) // Todo registro es activo automaticamente 

  if (error) throw error
}

// 📌 Validar duplicados
export const checkDuplicateVehiculo = async (name: string, modelo: string) => {
  const { data, error } = await supabase
    .from("cars")
    .select("id, status")
    .eq("name", name)
    .eq("modelo", modelo)

    if (error) throw error

    if (!data || data.length === 0) {
      return { exists: false, inactive: false }
    }

    const vehiculo = data[0]

    return {
      exists: vehiculo.status !== 2,
      inactive: vehiculo.status === 2
    }
  }

// 📌 Actualizar vehiculo => unicamente se podra actualizar el nombre, costro, modelo y marca
export const updateVehiculo = async (id: number, data: Partial<Vehiculo>) => {
  const { error } = await supabase
    .from("cars")
    .update(data)
    .eq("id", id)

  if (error) throw error
}

// 📌 Eliminar (soft delete)
export const deleteVehiculo = async (id: number) => {
  const { error } = await supabase
    .from("cars")
    .update({ status: 2 })
    .eq("id", id)

  if (error) throw error
}

