import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { Role } from "@/auth"

// 🔹 Tipos
type Profile = {
  ci: string
  name: string
  user_id: string
  id_role: number
  role: {
    role: string
    code: Role
  } | null
  roleName: Role | null
  user: string
}

type AuthContextType = {
  user: any
  session: any
  profile: Profile | null
  loading: boolean
}

// 🔹 Contexto
const AuthContext = createContext<AuthContextType | null>(null)

// 🔹 Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setUser(data.session?.user ?? null)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  useEffect(() => {

    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const getProfile = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          role (
            role,
            code
          ),
          branches ( name_branch)
        `)
        .eq("user_id", user.id)
        .single()

      if (!error && data) {

        // 🔥 Normalizar (array u objeto)
        const roleData = Array.isArray(data.role)
          ? data.role[0]
          : data.role

        setProfile({
          ...data,
          role: roleData,
          roleName: roleData?.code as Role || null
        })

      } else {
        console.error("Error profile:", error)
        setProfile(null)
      }

      setLoading(false)
    }

    getProfile()

  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// 🔹 Hook
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }

  return context
}