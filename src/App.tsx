import { useEffect, useState } from "react"
import Dashboard from "@/pages/dashboard/Dashboard"
import Login from "@/pages/auth/Login"
import { supabase } from "@/lib/supabase"
import Loader from "@/components/ui/Loader"

function App() {

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const init = async () => {

      const { data } = await supabase.auth.getSession()
      setSession(data.session)

      // Delay garantizado (prueba)
      setTimeout(() => {
        setLoading(false)
      }, 2000) // 2 segundo
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  if (loading) return <Loader />

  return session ? <Dashboard /> : <Login />
}

export default App