// ===============================
// 📌 BASE: TRANSACCIÓN (DEPÓSITOS ORIGINALES)
// ===============================
export interface CommissionTransaction {
  id: number
  created_at: string
  confirmed_at: string | null

  id_type_transaction: number
  id_branch: number
  id_employee: number
  id_status: number

  amount: number // Monto del depósito
  detail: string
  type_pay: string | null

  // 🔥 CAMPOS DE COMISIÓN (Hijos)
  id_commission_status: number // 1: Pendiente, 2: Pagado
  commission_paid_amount: number | null
  commission_payment_id: number | null // FK a la transacción Tipo 4
  commission_note: string | null

  // Campos de liquidación (Para el registro Tipo 4)
  total_calculated: number | null
  discount: number | null
}

// ===============================
// 📌 RELACIONES (Para visualización en tablas)
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
    description: string
  } | null

  status_transaction?: {
    id: number
    status: string
  } | null
}

// ===============================
// 📌 DETALLE PARA EL MODAL DE PAGO
// ===============================
export interface CommissionDetail extends CommissionWithRelations {
  selected?: boolean // Control de selección en UI
  commission_paid_amount: number // Monto editable si aplica
}

// ===============================
// 📌 PAYLOAD PARA PROCESAR EL PAGO (LIQUIDACIÓN)
// ===============================
export interface PayCommissionPayload {
  // Datos del Encabezado (Transacción Tipo 4)
  id_employee: number
  id_branch: number
  id_cuenta?: number | null // De dónde sale el dinero (Banco/Efectivo)
  
  total_calculated: number
  discount: number
  amount: number // Total Final (Calculado - Descuento)
  detail: string
  type_pay: string // Efectivo, Transferencia, etc.

  // Lista de IDs de depósitos a vincular
  depositIds: number[]
}

// ===============================
// 📌 RESULTADO DE TRANSACCIÓN DE PAGO (TIPO 4)
// ===============================
export interface CommissionPaymentResponse {
  id: number
  id_type_transaction: number // 4
  id_status: number // 2
  amount: number
  total_calculated: number
  discount: number
  detail: string
  created_at: string
}


// 🔥 Asegúrate de que tenga el 'export' delante
export interface CommissionGroup {
  id_employee: number
  id_branch: number
  employee_name: string
  branch_name: string
  total_deposits: number
}
