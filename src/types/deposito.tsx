// 🔹 Tipo base (depósitos pendientes provenientes de transactions)
export interface Deposito {
  id: number
  created_at: string

  // Relaciones principales
  id_type_transaction: number
  id_branch: number
  id_employee: number
  id_customer: number | null
  id_car: number | null
  id_status: number
  id_cuenta: number | null

  // Datos financieros
  amount: number
  costo: number | null

  // Datos comerciales
  type_sale: string | null
  type_pay: string | null
  detail: string
}

// 🟢 Para confirmar / actualizar depósito
export interface DepositoUpdate {
  id_branch?: number
  id_employee?: number
  id_customer?: number | null
  id_car?: number | null

  // 🏦 Cuenta destino (obligatoria según tipo de pago)
  id_cuenta?: number | null

  amount?: number
  costo?: number | null

  type_sale?: string | null
  type_pay?: string | null
  detail?: string

  // Estado:
  // 1 = pendiente
  // 2 = pagado / confirmado
  // 3 = rechazado
  // 4 = baja / eliminado
  id_status?: number
}

// 🔗 Relaciones completas
export interface DepositoWithRelations extends Deposito {

  // 🏢 Sucursal
  branches?: {
    id: number
    name_branch: string
  } | null

  // 👤 Empleado
  employees?: {
    id: number
    name: string
  } | null

  // 👥 Cliente
  customers?: {
    id: number
    name: string
  } | null

  // 🚗 Vehículo
  cars?: {
    id: number
    name: string
    cost: number
    modelo: string
    marca: string
  } | null

  // 📄 Tipo de transacción
  type_transaction?: {
    id: number
    description: string
    type_trans?: string
  } | null

  // 📌 Estado
  status_transaction?: {
    id: number
    status: string
  } | null

  // 🏦 Cuenta bancaria destino
  cuentas?: {
    id: number

    // Número de cuenta
    numero_cta: string

    // Banco
    banco: string

    // Titular
    titular: string

    // Estado de cuenta
    status: number
  } | null
}