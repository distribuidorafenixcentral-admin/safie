// 🔹 Tipo base (solicitudes de pago pendientes)
// alquileres, servicios y sueldos mensuales => no comisiones)
export interface Pagosol {
  id: number
  created_at: string

  // Relaciones principales
  id_type_transaction: number
  id_branch: number
  id_employee: number
  id_status: number
  id_cuenta: number | null

  // Datos financieros
  amount: number

  // Datos del detalle
  type_pay: string | null
  confirmed_at: string | null
  detail: string
}

// 🟢 Para confirmar / actualizar depósito
export interface PagossolUpdate {
  id_branch?: number
  id_employee?: number
  id_customer?: number | null
  id_car?: number | null

  // 🏦 Cuenta destino (obligatoria según tipo de pago)
  id_cuenta?: number | null
  amount?: number
  type_pay?: string | null
  detail?: string
  confirmed_at?: string
  // Estado:
  // 1 = pendiente
  // 2 = pagado / confirmado
  // 3 = rechazado
  // 4 = baja / eliminado
  id_status?: number
}

// 🔗 Relaciones completas
export interface PagosolWithRelations extends Pagosol {

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