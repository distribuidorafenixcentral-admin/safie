import { supabase } from "@/lib/supabase"

export const getRoles = async () => {
  const { data, error } = await supabase
    .from("role")
    .select("id, role")

  if (error) throw new Error(error.message)
  return data
}