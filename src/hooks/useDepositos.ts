import { useEffect, useState, useCallback } from "react"
import type { DepositoWithRelations, DepositoUpdate } from "@/types/deposito"
import { getDepositos, confirmDeposito, rejectDeposito } from "@/services/depositoService"
import { useRealtimeTable } from "@/hooks/UseRealTimeTable"
import { useAuth } from "@/context/AuthContext" // 🔹 Importación del contexto de autenticación

// 🔹 Constantes
const TYPE_SOLICITUD = 8
const STATUS_PENDIENTE = 1

// 📌 Hook central de depósitos con control de acceso por rol
export const useDepositos = (search: string) => {
  const { profile, loading: authLoading } = useAuth() // 🔑 Extraer perfil y estado de carga de la sesión
  const [depositos, setDepositos] = useState<DepositoWithRelations[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 🔥 Obtener datos iniciales aplicando segmentación por rol y sucursal
  const fetchDepositos = useCallback(async () => {
    if (authLoading || !profile) return // Detener si la sesión no está lista

    try {
      setIsRefreshing(true)
      // Se envían los parámetros de rol y sucursal al servicio corregido
      const data = await getDepositos(profile.id_role, profile.id_branch)
      setDepositos(data)
    } catch (error) {
      console.error("Error al obtener depósitos:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [profile, authLoading])

  // Refrescar automáticamente cuando el perfil cambie o termine de cargar
  useEffect(() => {
    fetchDepositos()
  }, [fetchDepositos])

  // 🔴 Realtime (Escucha cambios respetando las restricciones de sucursal en el refresco)
  useRealtimeTable("transactions", (payload: any) => {
    const newItem = payload.new
    const oldItem = payload.old

    // 🔹 Validar que sea solicitud pendiente
    const isValidDeposito = (item: any) =>
      item &&
      item.id_type_transaction === TYPE_SOLICITUD &&
      item.id_status === STATUS_PENDIENTE

    // Restricción adicional en Realtime: Si el usuario es Rol 3, el registro debe pertenecer a su sucursal
    const belongsToBranch = (item: any) => 
      !profile || profile.id_role !== 3 || item.id_branch === profile.id_branch

    // 📌 INSERT
    if (payload.eventType === "INSERT" && newItem) {
      if (isValidDeposito(newItem) && belongsToBranch(newItem)) {
        fetchDepositos()
      }
    }

    // 📌 UPDATE
    if (payload.eventType === "UPDATE" && newItem) {
      // Si deja de ser pendiente o ya no pertenece a la sucursal asignada, eliminar de la interfaz
      if (!isValidDeposito(newItem) || !belongsToBranch(newItem)) {
        setDepositos(prev => prev.filter(i => i.id !== newItem.id))
        return
      }
      fetchDepositos()
    }

    // 📌 DELETE
    if (payload.eventType === "DELETE" && oldItem) {
      if (oldItem.id_type_transaction === TYPE_SOLICITUD) {
        setDepositos(prev => prev.filter(i => i.id !== oldItem.id))
      }
    }
  })

  // 🔍 Filtro búsqueda con soporte de encadenamiento opcional para nulidades
  const filteredDepositos = depositos.filter(d => {
    const searchLower = search.toLowerCase()
    return (
      d.detail?.toLowerCase().includes(searchLower) ||
      d.customers?.name?.toLowerCase().includes(searchLower) ||
      d.cars?.name?.toLowerCase().includes(searchLower) ||
      d.branches?.name_branch?.toLowerCase().includes(searchLower) ||
      d.employees?.name?.toLowerCase().includes(searchLower) ||
      String(d.amount).includes(search) ||
      String(d.costo ?? "").includes(search) ||
      String(d.id).includes(search)
    )
  })

  // 📌 Confirmar / actualizar depósito
  const editDeposito = async (id: number, data: DepositoUpdate) => {
    try {
      await confirmDeposito(id, data)
      await fetchDepositos()
    } catch (error) {
      console.error("Error al confirmar depósito:", error)
      throw error // Re-lanzar para control de errores en el modal / ui
    }
  }

  // 📌 Dar baja / anulación lógica
  const removeDeposito = async (id: number) => {
    try {
      await rejectDeposito(id)
      await fetchDepositos()
    } catch (error) {
      console.error("Error al dar de baja el depósito:", error)
      throw error
    }
  }

  return {
    depositos,
    filteredDepositos,
    isRefreshing,
    fetchDepositos,
    editDeposito,
    removeDeposito
  }
}
