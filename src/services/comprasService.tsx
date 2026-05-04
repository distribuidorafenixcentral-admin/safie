import { supabase } from "@/lib/supabase"
import type { Compra, CompraInsert } from "@/types/compra"

// 📌 Constante para identificar solicitudes
// 5 = Compra de material de escritorio, 
// 6 = Compra de material de limpieza
// 7 = Compras o gastos varios 
const TYPE_COMPRAS = [5, 6, 7] 

// 📌 Recuperamos las compras realizadas
export const getCompras = async () => {
  const {data, error} = await supabase
  .from("transactions")
  .select(`
      *,
      branches(id, name_branch),
      employees(id, name),
      type_transaction(id, description),
      cuentas(id, numero_cta, banco, titular, status)
    `)
    .in("id_type_transaction", TYPE_COMPRAS)
    .neq("id_status", 4)
    .order("id", { ascending: false })

  if (error) throw error
  return data || []
}


// 📌 Registrar compra

export const createCompra = async (compra: CompraInsert) => {
  const { error } = await supabase
    .from("transactions")
    .insert({
      ...compra,
      id_status: 2, // pagado por defecto
      confirmed_at: new Date().toISOString()
    })

  if (error) throw error
}

// 📌 Obtener una solicitud por ID
export const getCompraById = async (id: number): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
        *,
        branches(id, name_branch),
        employees(id, name),
        type_transaction(id, description),
        cuentas(id, numero_cta, banco, titular, status)
      `)
    .eq("id", id)
    .in("id_type_transaction", TYPE_COMPRAS)
    .single()

  if (error) throw error
  return data
}
