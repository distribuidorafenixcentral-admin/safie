export interface StatusTransactions {
  id: number
  created_at: string
  status: string
}

// 🟢 Insertar
export interface StatusInsert {
  status?: string
}

// 🔄 Actualizar
export type StatusUpdate = Partial<StatusInsert>