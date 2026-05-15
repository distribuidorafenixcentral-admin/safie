// 🔹 Filtros superiores oficiales del módulo
export type RestitutionFilterType = "TODOS" | "PAGADOS" | "DEPOSITOS"

// =======================================================
// 📌 BASE: REGISTRO DE TRANSACCIÓN (COMPATIBLE CON BD)
// =======================================================
export interface RestitutionTransaction {
  id: number
  created_at: string
  confirmed_at: string | null

  // Identificadores de negocio
  id_type_transaction: number // 8 = Depósito, 9 = Restitución
  id_branch: number
  id_employee: number
  id_customer: number | null
  id_car: number | null
  id_status: number // 2 = Confirmado siempre en este flujo
  id_cuenta: number | null // ID de la cuenta destino de donde sale el dinero

  // Datos financieros y comerciales
  amount: number
  detail: string
  type_sale: string | null
  type_pay: string | null

  // Historial del módulo de comisiones
  id_commission_status: number | null
  commission_note: string | null

  // 🔥 CAMPOS DE CONTROL PARA LA AUDITORÍA DE RESTITUCIÓN
  id_restitution_status: number | null // 2 = Restituido por completo
  restitution_amount: number | null     // Monto devuelto guardado en el Tipo 8
  restitution_parent_id: number | null  // FK al nuevo registro Tipo 9 creado
  restitution_note: string | null       // Detalle de trazabilidad
}

// =======================================================
// 📌 RELACIONES COMPLETAS PARA LA DATA TABLE
// =======================================================
export interface RestitutionWithRelations extends RestitutionTransaction {
  branches: {
    id: number
    name_branch: string
  } | null

  employees: {
    id: number
    name: string
  } | null

  customers: {
    id: number
    name: string
  } | null

  type_transaction: {
    id: number
    description: string
  } | null
}

// =======================================================
// 📌 PAYLOAD COMPLETO PARA EL PROCESO DE DEVOLUCIÓN (MODAL)
// =======================================================
export interface ProcessRestitutionPayload {
  // Datos heredados del registro leído (Tipo 8 original)
  originId: number
  id_branch: number
  id_employee: number
  id_customer: number | null

  // Nuevos datos recopilados desde el formulario del Modal
  amount: number            // Monto a devolver ingresado en el nuevo input
  detail: string            // Detalle o motivo ingresado en el nuevo input
  type_pay: string          // Carga del nuevo input tipo de pago
  id_cuenta: number | null  // ID del select de recursos dinámico (null si es Efectivo)
}
