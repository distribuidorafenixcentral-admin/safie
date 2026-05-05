export interface Compra {
  id: number
  created_at: string
  id_type_transaction: number
  id_branch: number
  id_employee: number 
  amount: number
  detail: string
  id_status: number // siempre 2
  type_pay: string
  confirmed_at: string | null
  id_cuenta: number | null
}

// insert
export interface CompraInsert {
  id_type_transaction: number
  id_branch: number
  id_employee: number
  amount: number
  detail: string
  type_pay: string
  id_cuenta: number | null
}

// relaciones
export interface CompraWithRelations extends Compra {

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

  cuentas?:{
    id: number
    numero_cta: string
    banco: string
    titular: string
    status: number
  } | null
}