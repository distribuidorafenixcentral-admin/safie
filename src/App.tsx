import { useEffect, useState } from "react"
import Dashboard from "@/pages/dashboard/Dashboard"
import Login from "@/pages/auth/Login"
import { supabase } from "@/lib/supabase"

function App() {

  const [session, setSession] = useState<any>(null)

  useEffect(() => {

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  return session ? <Dashboard /> : <Login />
}

export default App