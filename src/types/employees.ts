// 🔹 Tipo base (lo que viene de la BD)
export interface Employee {
  id: number
  created_at: string

  ci: string
  name: string | null
  celphone: string | null
  start_date: string | null

  id_branch: number | null
  id_role: number | null

  status: number | null

  reference: string | null
  celphone_ref: string | null
}

// 🟢 PARA INSERTAR (🔥 CORREGIDO)
export interface EmployeeInsert {
  ci: string
  name?: string | null
  celphone?: string | null
  start_date?: string | null

  id_branch?: number | null
  id_role?: number | null

  status?: number | null

  reference?: string | null
  celphone_ref?: string | null

}

// 🟡 PARA ACTUALIZAR
export type EmployeeUpdate = Partial<EmployeeInsert>

// 🔗 CON RELACIONES 
export interface EmployeeWithRelations extends Employee {
  branch?: {
    id: number
    name_branch: string
  } | null

  role?: {
    id: number
    role: string
  } | null
}