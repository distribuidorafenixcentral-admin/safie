export interface Cuenta {
  id: number
  created_at: string

  numero_cta: string
  banco: string
  titular: string

  status: number
}

// 🟢 Insertar
export interface CuentaInsert {
  numero_cta: string
  banco: string
  titular: string
  status?: number
}

// 🔄 Actualizar
export type CuentaUpdate = Partial<CuentaInsert>