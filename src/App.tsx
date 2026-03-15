import { useEffect, useState } from "react"
import { Routes, Route } from "react-router-dom"
import Dashboard from "@/pages/dashboard/Dashboard"
import Login from "@/pages/auth/Login"
import { supabase } from "@/lib/supabase"
import Loader from "@/components/ui/Loader"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

function App() {

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)

      setTimeout(() => {
        setLoading(false)
      }, 2000)
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

  return (
    <Routes>

      {/* Ruta pública */}
      <Route path="/login" element={<Login />} />

      {/* Ruta protegida */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute session={session}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}

export default App