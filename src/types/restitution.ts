// ============================================
// 📌 BASE: TRANSACCIÓN (DEPÓSITOS)
// ============================================
export interface RestitutionTransaction {
  id: number
  created_at: string

  id_type_transaction: number
  id_branch: number
  id_employee: number

  amount: number
  detail: string

  id_status: number
  type_pay: string
  confirmed_at: string | null

  // 🔥 RESTITUCIÓN
  id_restitution_status: number // 1 sin / 2 parcial / 3 total
  restitution_amount: number | null
  restitution_parent_id: number | null
  restitution_discount: number | null
  restitution_note: string | null
}


// ============================================
// 📌 RELACIONES
// ============================================
export interface RestitutionWithRelations extends RestitutionTransaction {

  branches?: {
    id: number
    name_branch: string
  } | null

  employees?: {
    id: number
    name: string
  } | null

  // 🔥 si tienes relación con cliente / vehículo puedes agregar luego
  customers?: {
    id: number
    name: string
  } | null

  vehicles?: {
    id: number
    name: string
  } | null
}


// ============================================
// 📌 DETALLE PARA MODAL
// ============================================
export interface RestitutionDetail extends RestitutionWithRelations {

  // UI
  max_available: number // monto disponible para devolver
}


// ============================================
// 📌 PAYLOAD PARA RESTITUIR
// ============================================
export interface RestitutionPayload {
  parent_id: number

  amount: number
  discount: number

  final_amount: number
  note: string
}