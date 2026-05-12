// 🔹 Tipo base (depósitos pendientes provenientes de transactions)
export interface Deposito {
  id: number
  created_at: string
  confirmed_at: string | null

  // Relaciones principales
  id_type_transaction: number
  id_branch: number
  id_employee: number
  id_customer: number | null
  id_car: number | null
  id_status: number
  id_cuenta: number | null

  // Datos financieros y de comisión
  amount: number
  costo: number | null
  id_commission_status: number | null
  commission_paid_amount: number | null
  commission_payment_id: number | null
  commission_note: string | null

  // Datos comerciales
  type_sale?: string | null
  type_pay: string | null
  detail: string

  // Otros campos de la tabla
  total_calculated: number | null
  discount: number | null
  id_restitution_status: number | null
  restitution_amount: number | null
  restitution_parent_id: number | null
  restitution_note: string | null
  restitution_discount: number | null
}

// 🟢 Para confirmar / actualizar depósito
export interface DepositoUpdate {
  type_pay?: string | null
  id_cuenta?: number | null // Obligatorio en la interfaz de usuario si type_pay != 'Efectivo'
  id_status?: 2 | 4 // 2 = Confirmado, 4 = Dado de baja
  confirmed_at?: string // NOW() enviado desde el cliente o manejado en el service
  
  // Datos de comisión obligatorios al confirmar (id_status = 2)
  id_commission_status?: 1 | null
  commission_paid_amount?: number | null // Será igual al amount final
  
  // Permitir modificaciones opcionales al confirmar si el negocio lo requiere
  amount?: number
  costo?: number | null
  detail?: string
}

// 🔗 Relaciones completas para listados y asignaciones directas
export interface DepositoWithRelations extends Deposito {
  // 🏢 Sucursal
  branches: {
    id: number
    name_branch: string // Alineado con la tabla branches
  } | null

  // 👤 Empleado
  employees: {
    id: number
    name: string // Alineado con la tabla employees
  } | null

  // 👥 Cliente
  customers: {
    id: number
    name: string // Alineado con la tabla customers
  } | null

  // 🚗 Vehículo
  cars: {
    id: number
    name: string // Ajustado al formato estándar de tus relaciones
    cost: number | null // Sincronizado con el campo costo de la transacción
    modelo: string
    marca: string
  } | null

  // 📄 Tipo de transacción
  type_transaction: {
    id: number
    description: string
  } | null

  // 📌 Estado
  status_transaction: {
    id: number
    status: string
  } | null

  // 🏦 Cuenta bancaria destino
  cuentas: {
    id: number
    numero_cta: string
    banco: string
    titular: string
    status: number
  } | null
}
