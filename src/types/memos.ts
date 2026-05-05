// 🔹 Tipo base (lo que viene de la BD)
export interface Memos {
  id: number
  created_at: string
  id_type_transaction: number // siempre 9 (interno)
  id_branch: number
  id_employee: number
  amount: number
  detail: string
  id_status: number // 1 = pendiente, 2 = pagado, 4 = eliminado
  type_pay?: string | null // se llena cuando pasa a pagado
   confirmed_at?: string | null 
}

//
// 🟢 PARA INSERTAR
// 👉 NO incluye id_type_transaction ni type_pay
//
export interface MemosInsert {
  id_branch: number
  id_employee: number
  amount: number
  detail: string
  id_status?: number // opcional → por defecto debería ser 1
}

//
// 🟡 PARA ACTUALIZAR
// 👉 SOLO lo permitido por negocio
//
export interface MemosUpdate {
  amount?: number
  detail?: string
  id_status?: number
}

//
// 🔗 CON RELACIONES (para tabla UI)
//
export interface MemosWithRelations extends Memos {
  branches?: {
    id: number
    name_branch: string
  } | null

  employees?: {
    id: number
    name: string
  } | null

  type_transaction?: {
    id: number
    description: string
    type_trans: string
  } | null

  status_transaction?: {
    id: number
    status: string
  } | null
}