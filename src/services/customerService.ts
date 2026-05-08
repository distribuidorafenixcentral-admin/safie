import { supabase } from "@/lib/supabase" 
import type { 
  CustomerWithRelations,
  CustomerInsert, 
  CustomerUpdate 
} from "@/types/customer"

// 📌 Recuperamos datos con su relación y soporte de filtro por sucursal
export const getCustomer = async (
  idBranchToFilter?: number | null 
): Promise<CustomerWithRelations[]> => {
  
  let query = supabase
    .from("customers")
    .select(`
      *,
      branch:branches(id, name_branch)
    `) 
    .neq("status", 2)   
    .order("id", { ascending: false }) // orden descendente

  if (idBranchToFilter) {
    query = query.eq("id_branch", idBranchToFilter)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as CustomerWithRelations[]) || []
}

// 📌 Crear Cliente con verificación de coexistencia previa
export const createCustomer = async (customer: CustomerInsert) => {
  
  // 1. 🧠 PASO CRÍTICO: Buscamos TODOS los registros activos con ese CI ANTES de insertar nada
  const { data: existingRecords, error: searchError } = await supabase
    .from("customers")
    .select(`
      id,
      id_branch,
      branches (
        name_branch
      )
    `)
    .eq("ci", customer.ci)
    .neq("status", 2) // Que no estén dados de baja

  if (searchError) console.error("Error al buscar coincidencias de CI:", searchError)

  // 2. Evaluamos en memoria si ya existía en otra sucursal distinta a la que lo registra ahora
  let duplicatedBranchName: string | null = null
  
  if (existingRecords && existingRecords.length > 0) {
    // Buscamos si alguno de los registros encontrados pertenece a otra sucursal
    const matchInOtherBranch = existingRecords.find(
      record => String(record.id_branch) !== String(customer.id_branch)
    )

    if (matchInOtherBranch) {
      const branchArray: any = matchInOtherBranch.branches
      duplicatedBranchName = Array.isArray(branchArray) 
        ? branchArray[0]?.name_branch 
        : branchArray?.name_branch
    }
  }

  // 3. Procedemos a insertar el registro de forma segura
  const { error: insertError } = await supabase
    .from("customers")
    .insert({ ...customer, status: 1 })
    .select()
    .single()

  if (insertError) throw insertError

  // 4. Si encontramos que existía previamente en otra sede, mandamos la bandera de coincidencia
  if (duplicatedBranchName) {
    return {
      success: true,
      hasCoincidence: true,
      originalBranch: duplicatedBranchName
    }
  }

  return {
    success: true,
    hasCoincidence: false,
    originalBranch: null
  }
}

// 📌 Actualizar Cliente utilizando el tipo de actualización parcial
export const updateCustomer = async (id: number, data: CustomerUpdate) => {
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
