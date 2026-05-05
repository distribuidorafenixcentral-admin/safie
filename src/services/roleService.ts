import { supabase } from "@/lib/supabase"

export const getRoles = async () => {
  const { data, error } = await supabase
    .from("role")
    .select("id, role")
    .in("id", [3, 4, 5, 6]) // excluimos usuarios con id 1 "gerente" y 2 "administrador"

  if (error) throw new Error(error.message)
  return data
}