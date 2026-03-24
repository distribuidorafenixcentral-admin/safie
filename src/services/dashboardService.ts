import { supabase } from "@/lib/supabase"

// TOTAL PERSONAL
export const getTotalPersonal = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("team")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error getTotalPersonal:", error)
    return 0
  }

  return count || 0
}

// 📅 Helpers de fechas
/* const getTodayRange = () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

const getWeekRange = () => {
  const now = new Date()
  const firstDay = new Date(now.setDate(now.getDate() - now.getDay()))
  firstDay.setHours(0, 0, 0, 0)

  const lastDay = new Date()
  lastDay.setHours(23, 59, 59, 999)

  return { start: firstDay, end: lastDay }
}

const getMonthRange = () => {
  const now = new Date()

  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  return { start, end }
} */