// ===============================
// 📌 BASE: TRANSACCIÓN (DEPÓSITOS)
// ===============================
export interface CommissionTransaction {
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

  // 🔥 CAMPOS DE COMISIÓN
  id_commission_status: number // 1 pendiente / 2 pagado
  commission_paid_amount: number | null
  commission_payment_id: number | null
  commission_note: string | null
}


// ===============================
// 📌 INSERT (si necesitas crear)
// ===============================
export interface CommissionInsert {
  id_type_transaction: number
  id_branch: number
  id_employee: number
  amount: number
  detail: string
  type_pay: string

  id_commission_status?: number
  commission_paid_amount?: number | null
  commission_payment_id?: number | null
  commission_note?: string | null
}


// ===============================
// 📌 RELACIONES
// ===============================
export interface CommissionWithRelations extends CommissionTransaction {

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
    type_trans: string
    description: string
  } | null

  status_transaction?: {
    id: number
    status: string
  } | null
}


// ===============================
// 📌 AGRUPACIÓN (TABLA PRINCIPAL)
// ===============================
export interface CommissionGroup {
  id_employee: number
  id_branch: number

  employee_name: string
  branch_name: string

  total_deposits: number
}


// ===============================
// 📌 DETALLE EDITABLE (MODAL)
// ===============================
export interface CommissionDetail extends CommissionWithRelations {

  // UI
  selected?: boolean

  // editable en frontend
  commission_paid_amount: number
}


// ===============================
// 📌 PAYLOAD PARA PAGAR COMISIÓN
// ===============================
export interface PayCommissionPayload {
  deposits: {
    id: number
    commission_paid_amount: number
  }[]

  totalCalculated: number
  discount: number
  totalPaid: number
  detail: string
}


// ===============================
// 📌 TRANSACCIÓN DE PAGO (TIPO 4)
// ===============================
export interface CommissionPayment {
  id: number
  created_at: string

  id_type_transaction: number // 4
  id_status: number // 2

  amount: number // total final pagado

  total_calculated: number
  discount: number

  detail: string
}