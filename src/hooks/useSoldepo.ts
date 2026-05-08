import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"

import type {
  SoldepoWithRelations,
  SoldepoInsert,
  SoldepoUpdate
} from "@/types/soldepo"

import {
  getSoldepo,
  createSoldepo,
  updateSoldepo,
  deleteSoldepo
} from "@/services/SoldepoService"

import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// 🔹 Tipo válido del módulo
const TYPE_SOLICITUD = 8

// 🔹 Estado eliminado
const STATUS_ELIMINADO = 2

/**
 * Hook personalizado para la gestión de solicitudes de depósitos (Tipo 8)
 * @param search Parámetro de filtrado de texto desde la UI
 * @param role ID del rol del usuario autenticado
 * @param idBranch ID de la sucursal asignada al usuario
 */
export const useSoldepo = (search: string, role?: number, idBranch?: number) => {

  // 📌 Estado principal estructurado
  const [soldepo, setSoldepo] = useState<SoldepoWithRelations[]>([])

  // 🔍 Obtener datos iniciales aplicando capas de privacidad
  const fetchSoldepo = useCallback(async () => {
    if (role === undefined) return // Esperar a la inicialización del perfil de usuario
    try {
      const data = await getSoldepo(role, idBranch)
      setSoldepo(data)
    } catch (error) {
      console.error("Error cargando solicitudes:", error)
    }
  }, [role, idBranch])

  useEffect(() => {
    fetchSoldepo()
  }, [fetchSoldepo])

  // 🔍 Helper para rescatar un registro unitario con sus relaciones completas
  const fetchSingleWithRelations = async (id: number): Promise<SoldepoWithRelations | null> => {
    let query = supabase
      .from("transactions")
      .select(`
        id, created_at, id_type_transaction, id_branch, id_employee, id_customer, id_car, id_status,
        amount, costo, type_sale, type_pay, detail,
        branches (id, name_branch),
        employees (id, name),
        type_transaction (id, description, type_trans),
        status_transaction (id, status),
        cars (id, name, cost, modelo, marca),
        customers (id, name)
      `)
      .eq("id", id)

    if (role === 3 && idBranch) {
      query = query.eq("id_branch", idBranch)
    }

    const { data } = await query.single()
    return data as unknown as SoldepoWithRelations
  }

  // 🔴 Sincronización en Tiempo Real con Filtros de Privacidad por Sucursal
  useRealtimeTable("transactions", async (payload: any) => {
    if (role === undefined) return

    const newItem = payload.new
    const oldItem = payload.old

    // Validar si pertenece al módulo de depósitos (Tipo 8)
    const isSolicitud = (item: any) =>
      item && Number(item.id_type_transaction) === TYPE_SOLICITUD

    // Validar si pertenece a la sucursal del usuario logueado en caso de ser Rol 3
    const belongsToBranch = (item: any) => 
      role !== 3 || (item && Number(item.id_branch) === Number(idBranch))

    // 🟢 EVENTO: INSERT
    if (payload.eventType === "INSERT" && newItem) {
      if (isSolicitud(newItem) && newItem.id_status !== STATUS_ELIMINADO && belongsToBranch(newItem)) {
        const enrichedItem = await fetchSingleWithRelations(newItem.id)
        if (enrichedItem) {
          setSoldepo(prev => [enrichedItem, ...prev])
        }
      }
    }

    // 🟡 EVENTO: UPDATE
    if (payload.eventType === "UPDATE" && newItem) {
      // Si deja de ser válido, fue eliminado lógicamente o modificado a una sucursal ajena
      if (!isSolicitud(newItem) || newItem.id_status === STATUS_ELIMINADO || !belongsToBranch(newItem)) {
        setSoldepo(prev => prev.filter(item => item.id !== newItem.id))
        return
      }

      const enrichedItem = await fetchSingleWithRelations(newItem.id)
      if (enrichedItem) {
        setSoldepo(prev =>
          prev.map(item => item.id === newItem.id ? enrichedItem : item)
        )
      }
    }

    // 🔴 EVENTO: DELETE (Físico)
    if (payload.eventType === "DELETE" && oldItem) {
      if (isSolicitud(oldItem) && belongsToBranch(oldItem)) {
        setSoldepo(prev => prev.filter(item => item.id !== oldItem.id))
      }
    }
  })

  // 🔍 Búsqueda flexible local multi-relacional
  const filteredSoldepo = soldepo.filter(item => {
    const searchLower = search.toLowerCase()

    return (
      item.detail?.toLowerCase().includes(searchLower) ||
      String(item.amount).includes(search) ||
      String(item.costo ?? "").includes(search) ||
      String(item.id).includes(search) ||
      item.customers?.name?.toLowerCase().includes(searchLower) ||
      item.cars?.name?.toLowerCase().includes(searchLower) ||
      item.branches?.name_branch?.toLowerCase().includes(searchLower) ||
      item.employees?.name?.toLowerCase().includes(searchLower)
    )
  })

  // 🟢 Crear
  const addSoldepo = async (data: SoldepoInsert): Promise<void> => {
    try {
      await createSoldepo(data)
    } catch (error) {
      console.error("Error al insertar depósito:", error)
      throw error
    }
  }

  // ✏ Actualizar
  const editSoldepo = async (id: number, data: SoldepoUpdate): Promise<void> => {
    try {
      await updateSoldepo(id, data)
    } catch (error) {
      console.error("Error al actualizar depósito:", error)
      throw error
    }
  }

  // 🗑 Eliminar lógico
  const removeSoldepo = async (id: number): Promise<void> => {
    try {
      await deleteSoldepo(id)
    } catch (error) {
      console.error("Error al eliminar depósito:", error)
      throw error
    }
  }

  return {
    soldepo,
    filteredSoldepo,
    fetchSoldepo,
    addSoldepo,
    editSoldepo,
    removeSoldepo
  }
}
