import Dashboard from "@/pages/dashboard/Dashboard"
import Login from "@/pages/auth/Login"
import Personal from "@/pages/personal/Personal"
import Sucursal from "./pages/sucursal/Sucursal"
import { Routes, Route, Navigate } from "react-router-dom"
import Transaccion from "./pages/transaccion/Transaccion"
import Regdeposito from "./pages/regdeposito/Regdeposito"
import Vehiculo from "./pages/vehiculo/Vehiculo"
import Cliente from "./pages/cliente/Customer"
import Deposito from "./pages/deposito/Deposito"
import Regdeuda from "./pages/regdeuda/RegDeuda"
import Deuda from "./pages/deuda/Deuda"
import Memos from "./pages/memos/Memos"
import Compras from "./pages/compras/Compras"
import Pagossol from "./pages/pagossol/Pagossol"
import Comisiones from "./pages/comision/Comision"
import { ConfirmProvider } from "./context/ConfirmContext"
import { ToastProvider } from "./context/ToastContext"
import { AuthProvider, useAuth } from "./context/AuthContext"

function AppRoutes() {

  const { session, loading } = useAuth()

  // CLAVE
  if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-semibold italic">Cargando...</p>
    </div>
  )
}

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
        <Route path="personal" element={<Personal />} />
        <Route path="sucursal" element={<Sucursal />} />
        <Route path="transaccion" element={<Transaccion />} />
        <Route path="regdeposito" element={<Regdeposito />} />
        <Route path="regdeuda" element={<Regdeuda />} />
        <Route path="vehiculo" element={<Vehiculo />} />
        <Route path="cliente" element={<Cliente />} />
        <Route path="deposito" element={<Deposito />} />
        <Route path="deuda" element={<Deuda />} />
        <Route path="memos" element={<Memos />} />
        <Route path="comisiones" element={<Comisiones />} />
        <Route path="pagossol" element={<Pagossol />} />
        <Route path="compras" element={<Compras />} />


      </Route>

      {/* fallback */}
      <Route
        path="*"
        element={<Navigate to={session ? "/dashboard" : "/login"} />}
      />

    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AppRoutes />
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  )
}