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
import Deposito from "./pages/deposito/Deposito"
import Regdeuda from "./pages/regdeuda/RegDeuda"
import Deuda from "./pages/deuda/Deuda"
import Memos from "./pages/memos/Memos"
import { ConfirmProvider } from "./context/ConfirmContext"
import { ToastProvider } from "./context/ToastContext"



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
    <ToastProvider>
    <ConfirmProvider>
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

         {/* Página Registro de Deuda dentro del Dashboard */}
        <Route
          path="regdeuda"
          element={<Regdeuda />}
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

        {/* INGRESOS
         */}
        {/* Página Depositos dentro del Dashboard */}
        <Route
          path="deposito"
          element={<Deposito />}
        />
         {/* Página Deudas dentro del Dashboard */}
        <Route
          path="deuda"
          element={<Deuda />}
        />
         {/* Página Memos dentro del Dashboard */}
        <Route
          path="memos"
          element={<Memos/>}
        />

      </Route>

      {/* Redirección general */}
      <Route
        path="*"
        element={<Navigate to={session ? "/dashboard" : "/login"} />}
      />

    </Routes>
    </ConfirmProvider>
    </ToastProvider>
  )
}

export default App