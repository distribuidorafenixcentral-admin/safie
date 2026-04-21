import { useEffect, useState, useCallback } from "react";
import type { Customer } from "@/types/customer";   
import { getCustomer } from "@/services/customerService";   
import { useRealtimeTable } from "@/hooks/UseRealTimeTable";

// Hook central de clientes
export const useCustomers = (search: string) => {

  const [customers, setCustomers] = useState<Customer[]>([])

    // 🔹 Obtener datos iniciales       
    const fetchCustomers = useCallback(async () => {
      const data = await getCustomer()
      setCustomers(data)
    }, [])

    useEffect(() => {
      fetchCustomers()
    }, [fetchCustomers])

    //realtime (escucha cambios en la BD)
    useRealtimeTable("customers", (payload: any) => {

        // INSERT
        if (payload.eventType === "INSERT" && payload.new) {
          if (payload.new.status !== 2) {
            setCustomers(prev => [payload.new, ...prev])
          } 
        }

        // UPDATE
        if (payload.eventType === "UPDATE") {
          if (payload.new.status === 2) {
            setCustomers(prev => prev.filter(i => i.id !== payload.new.id))
            return
          }
          setCustomers(prev =>
            prev.map(i => i.id === payload.new.id ? payload.new : i)
          )
        }

        // DELETE
        if (payload.eventType === "DELETE") {
          setCustomers(prev => prev.filter(i => i.id !== payload.old.id))
        }
    })

    // 🔍 Filtro buscamos por nombre, carnet de identidad, ciudad y referencia del client
    const filteredCustomers = customers.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.ci.toLowerCase().includes(search.toLowerCase()) ||  
      c.ciudad.toLowerCase().includes(search.toLowerCase()) ||
      c.reference.toLowerCase().includes(search.toLowerCase())
    )

    return {
      customers,
      filteredCustomers,
      fetchCustomers
    }


}
