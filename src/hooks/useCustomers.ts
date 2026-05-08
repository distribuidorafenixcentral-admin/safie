import { useEffect, useState, useCallback, useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import type { CustomerWithRelations } from "@/types/customer"
import { getCustomer } from "@/services/customerService"   
import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

// Hook central de clientes
export const useCustomers = (search: string) => {
  const { profile, loading } = useAuth() // 👈 Importamos 'loading' de tu AuthContext
  const [customers, setCustomers] = useState<CustomerWithRelations[]>([])

  // 🧠 Lógica de Roles: Calcula qué id_branch pasarle al servicio
  const branchIdToFilter = useMemo(() => {
    if (!profile) return null
    
    // Roles 1 y 2: Administradores Globales (retorna null para traer todos los clientes)
    if (profile.id_role === 1 || profile.id_role === 2) {
      return null
    }
    
    // Rol 3: Administrador de Sucursal (retorna el id de su sucursal asignada)
    if (profile.id_role === 3) {
      return profile.id_branch
    }

    return null
  }, [profile])

  // 🔹 Obtener datos iniciales       
  const fetchCustomers = useCallback(async () => {
    // ✋ BLOQUEO DE SEGURIDAD: Si el Auth Context está cargando o no hay perfil, NO hacemos la consulta a la BD.
    if (loading || !profile) return

    try {
      const data = await getCustomer(branchIdToFilter)
      setCustomers(data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }, [branchIdToFilter, profile, loading]) // 👈 Añadido loading a las dependencias

  // Efecto controlado por el estado del perfil
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // 🔴 Realtime estable
  useRealtimeTable("customers", async (payload: any) => {
    if (
      payload.eventType === "INSERT" ||
      payload.eventType === "UPDATE" ||
      payload.eventType === "DELETE"
    ) {
      await fetchCustomers()
    }
  })

  // 🔍 Filtro de búsqueda en Frontend (Protegido contra nulos)
  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.ci ?? "").toLowerCase().includes(search.toLowerCase()) ||  
      (c.ciudad ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.reference ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.celphone ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.branch?.name_branch ?? "").toLowerCase().includes(search.toLowerCase())
    )
  }, [customers, search])

  return {
    customers,
    filteredCustomers,
    fetchCustomers,
    
    // 💡 Propiedades listas para tu vista, sincronizadas con el estado real de la sesión
    idRoleCurrentUser: loading ? null : profile?.id_role,
    idBranchCurrentUser: loading ? null : profile?.id_branch
  }
}
