// 🔹 Tipo base (lo que viene de la BD)
export interface Solicitud {
  id: number
  created_at: string
  id_type_transaction: number
  id_branch: number
  id_employee: number
  amount: number
  detail: string
  id_status: number
}

// 🟢 PARA INSERTAR 
export interface SolicitudInsert {
  id_type_transaction: number
  id_branch: number
  id_employee: number
  amount: number
  detail: string
  id_status?: number // tiene default = 1 => Pendiente
}

//  Para actualizar 
export type SolicitudUpdate = Partial<SolicitudInsert>

// 🔗 CON RELACIONES 
export interface SolicitudWithRelations extends Solicitud {
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
    description: string,
    type_trans: string
  } | null
    status_transaction?: {
    id: number
    status: string
  } | null
}

