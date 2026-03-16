import { useEffect, useState } from "react"
import Dashboard from "@/pages/dashboard/Dashboard"
import Login from "@/pages/auth/Login"
import Personal from "@/pages/personal/Personal"
import Sucursal from "./pages/sucursal/Sucursal"
import { supabase } from "@/lib/supabase"
import { Routes, Route, Navigate } from "react-router-dom"
import Transaccion from "./pages/transaccion/Transaccion"
import Regdeposito from "./pages/regdeposito/Regdeposito"
import Vehiculo from "./pages/vehiculo/Vehiculo"
import Cliente from "./pages/cliente/Cliente"

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

  return (

    <Routes>

      {/* Login */}
      <Route
        path="/login"
        element={!session ? <Login /> : <Navigate to="/dashboard" />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={session ? <Dashboard /> : <Navigate to="/login" />}
      >

        {/* Página Personal dentro del Dashboard */}
        <Route
          path="personal"
          element={<Personal />}
        />
        {/* Página Sucursal dentro del Dashboard */}
        <Route
          path="sucursal"
          element={<Sucursal />}
        />
         {/* Página Transaccion dentro del Dashboard */}
        <Route
          path="transaccion"
          element={<Transaccion />}
        />
        {/* Página Registo Depósito dentro del Dashboard */}
        <Route
          path="regdeposito"
          element={<Regdeposito />}
        />
         {/* Página Registro de Vehículo dentro del Dashboard */}
        <Route
          path="vehiculo"
          element={<Vehiculo />}
        />

         {/* Página Registo de cliente dentro del Dashboard */}
        <Route
          path="cliente"
          element={<Cliente />}
        />

      </Route>

      {/* Redirección general */}
      <Route
        path="*"
        element={<Navigate to={session ? "/dashboard" : "/login"} />}
      />

    </Routes>

  )
}

export default App