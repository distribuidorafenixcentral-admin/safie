import { useEffect, useState, useCallback } from "react"
import type { Vehiculo } from "@/types/vehiculo"
import { getVehiculos } from "@/services/vehiculoService"
import { useRealtimeTable } from "@/hooks/UseRealTimeTable"


// hook central de vehiculos
export const useVehiculos = (search: string) => {

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])

  // 🔹 Obtener datos iniciales
  const fetchVehiculos = useCallback(async () => {
    const data = await getVehiculos()
    setVehiculos(data)
  }, [])

  useEffect(() => {
    fetchVehiculos()
  }, [fetchVehiculos])

  // REALTIME (escucha cambios en la BD)
  useRealtimeTable("cars", (payload: any) => {

    // INSERT
    if (payload.eventType === "INSERT" && payload.new) {
      if (payload.new.status !== 2 && payload.new.id !== 1) {
        setVehiculos(prev => [payload.new, ...prev])
      }
    }

    // UPDATE
    if (payload.eventType === "UPDATE") {
      if (payload.new.status === 2) {
        setVehiculos(prev => prev.filter(i => i.id !== payload.new.id))
        return
      }

      setVehiculos(prev =>
        prev.map(i => i.id === payload.new.id ? payload.new : i)
      )
    }

    // DELETE
    if (payload.eventType === "DELETE") {
      setVehiculos(prev => prev.filter(i => i.id !== payload.old.id))
    }
  })

  // 🔍 Filtro buscamos por nombre, marca, costo y  por modelo del vehiculo
  const filteredVehiculos = vehiculos.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.marca?.toLowerCase().includes(search.toLowerCase()) ||
    v.cost?.toString().includes(search) ||
    v.modelo?.toLowerCase().includes(search.toLowerCase())
  )


  return {
    vehiculos,
    filteredVehiculos,
    fetchVehiculos
  }
}
  