import { useEffect, useState, useCallback } from "react"
import type { 
  RestitutionWithRelations, 
  RestitutionFilterType, 
  ProcessRestitutionPayload 
} from "@/types/restitution"
import { getRestitucionesData, executeRestitution } from "@/services/restitutionService"
import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// 📌 Constantes de negocio para validación en tiempo real
const TYPE_DEPOSITO = 8
const TYPE_RESTITUCION = 11
const STATUS_CONFIRMADO = 2
const COMMISSION_PAGADO = 2

export const useRestituciones = (search: string) => {
  // 🔹 Estado para la pestaña o filtro activo
  const [filter, setFilter] = useState<RestitutionFilterType>("DEPOSITOS")
  const [restituciones, setRestituciones] = useState<RestitutionWithRelations[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // 🔥 1. Cargar datos desde el servicio aplicando el filtro actual
  const fetchRestituciones = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getRestitucionesData(filter)
      setRestituciones(data)
    } catch (error) {
      console.error("Error al recuperar listado de restituciones:", error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  // Recargar de la base de datos automáticamente cada vez que cambie la pestaña de filtrado
  useEffect(() => {
    fetchRestituciones()
  }, [fetchRestituciones])

  // 🔴 2. Suscripción Realtime (Sincroniza la UI si otra sucursal u operador hace cambios)
  useRealtimeTable("transactions", (payload: any) => {
    const newItem = payload.new
    const oldItem = payload.old

    // Validador rápido para saber si el registro modificado afecta al módulo
    const isRelevantItem = (item: any) =>
      item && (
        item.id_type_transaction === TYPE_RESTITUCION ||
        (item.id_type_transaction === TYPE_DEPOSITO &&
         item.id_status === STATUS_CONFIRMADO &&
         item.id_commission_status === COMMISSION_PAGADO)
      )

    // Eventos INSERT o UPDATE relanzan la petición para refrescar relaciones completas (branches, employees, customers)
    if ((payload.eventType === "INSERT" && isRelevantItem(newItem)) || 
        (payload.eventType === "UPDATE" && (isRelevantItem(newItem) || isRelevantItem(oldItem)))) {
      fetchRestituciones()
    }

    // Evento DELETE remueve el ítem localmente de forma inmediata
    if (payload.eventType === "DELETE" && oldItem) {
      setRestituciones(prev => prev.filter(item => item.id !== oldItem.id))
    }
  })

  // 🔍 3. Motor de Búsqueda sobre el listado activo en memoria
  const filteredRestituciones = restituciones.filter(item => {
    const term = search.toLowerCase()
    return (
      String(item.id).includes(term) ||
      String(item.amount).includes(term) ||
      item.detail?.toLowerCase().includes(term) ||
      item.type_pay?.toLowerCase().includes(term) ||
      item.type_sale?.toLowerCase().includes(term) ||
      item.branches?.name_branch?.toLowerCase().includes(term) ||
      item.employees?.name?.toLowerCase().includes(term) ||
      item.customers?.name?.toLowerCase().includes(term)
    )
  })

  // 🔥 4. Función puente para ejecutar la devolución de fondos
  const processRestitution = async (payload: ProcessRestitutionPayload) => {
    try {
      await executeRestitution(payload)
      // Refrescar el listado actual inmediatamente tras el éxito
      await fetchRestituciones()
    } catch (error) {
      console.error("Error en la ejecución de la devolución de fondos:", error)
      throw error // Re-lanzar para control de estados en el Modal / UI de la página
    }
  }

  return {
    filter,
    setFilter,
    loading,
    restituciones,
    filteredRestituciones,
    fetchRestituciones,
    processRestitution
  }
}
