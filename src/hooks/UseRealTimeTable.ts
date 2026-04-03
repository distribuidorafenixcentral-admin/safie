import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

type RealtimePayload<T> = {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: T | null
  old: T | null
}

export const useRealtimeTable = <T>(
  table: string,
  callback: (payload: RealtimePayload<T>) => void
) => {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {

          const formattedPayload: RealtimePayload<T> = {
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: payload.new ? (payload.new as T) : null,
            old: payload.old ? (payload.old as T) : null,
          }

          callback(formattedPayload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, callback])
}