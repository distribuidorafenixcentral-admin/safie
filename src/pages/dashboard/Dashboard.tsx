import DashboardLayout from "@/layouts/DashboardLayout"
import StatCard from "@/components/cards/StarCard"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import {
  getTotalPersonal,
  getIngresosHoy,
  getGastosHoy,
  getDepositosHoy,
  getDepositosSemana,
  getDepositosMes,
  getBalanceHoy,
  getEfectivoMes,
  getBanco1Mes,
  getBanco2Mes,
  getRestitucionMes
} from "@/services/dashboardService"

import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  UserRound,
  Building2,
  Receipt,
  DollarSign
} from "lucide-react"

export default function Dashboard() {
  const location = useLocation()

  // 🔹 Estados dashboard
  const [totalPersonal, setTotalPersonal] = useState<number>(0)
  const [ingresosHoy, setIngresosHoy] = useState<number>(0)
  const [gastosHoy, setGastosHoy] = useState<number>(0)
  const [depositosHoy, setDepositosHoy] = useState<number>(0)
  const [depositosSemana, setDepositosSemana] = useState<number>(0)
  const [depositosMes, setDepositosMes] = useState<number>(0)
  const [balanceHoy, setBalanceHoy] = useState<number>(0)
  const [efectivoHoy, setEfectivoHoy] = useState<number>(0)
  const [bancoUno, setBancoUno] = useState<number>(0)
  const [bancoDos, setBancoDos] = useState<number>(0)
  const [restitucionesMes, setRestitucionesMes] = useState<number>(0)

  // 🔥 Función principal para cargar datos
  const loadData = async () => {
    try {
      const [
        total,
        ingresoshoy,
        gastoshoy,
        depositoshoy,
        depositossem,
        depositosmes,
        balancehoy,
        efectivomes,
        bancounomes,
        bancodosmes,
        restitucionesmes
      ] = await Promise.all([
        getTotalPersonal(),
        getIngresosHoy(),
        getGastosHoy(),
        getDepositosHoy(),
        getDepositosSemana(),
        getDepositosMes(),
        getBalanceHoy(),
        getEfectivoMes(), // Retorna: Ingresos - Gastos (Efectivo)
        getBanco1Mes(),   // Retorna: Ingresos - Gastos (Banco 1)
        getBanco2Mes(),   // Retorna: Ingresos - Gastos (Banco 2)
        getRestitucionMes()
      ])

      setTotalPersonal(total || 0)
      setIngresosHoy(ingresoshoy || 0)
      setGastosHoy(gastoshoy || 0)
      setDepositosHoy(depositoshoy || 0)
      setDepositosSemana(depositossem || 0)
      setDepositosMes(depositosmes || 0)
      setBalanceHoy(balancehoy || 0)
      setEfectivoHoy(efectivomes || 0)
      setBancoUno(bancounomes || 0)
      setBancoDos(bancodosmes || 0)
      setRestitucionesMes(restitucionesmes || 0)
    } catch (error) {
      console.error("Error cargando dashboard:", error)
    }
  }

  useEffect(() => {
    loadData()

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        async () => {
          await loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const showCards = location.pathname === "/dashboard"

  return (
    <DashboardLayout>
      {showCards ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <StatCard
            title="Ingresos HOY"
            value={`Bs. ${ingresosHoy.toLocaleString()}`}
            icon={<ArrowDownCircle size={36} />}
            iconBg="bg-blue-200"
            iconColor="text-blue-900"
            cardBg="bg-blue-300"
          />

          <StatCard
            title="Gastos HOY"
            value={`Bs. ${gastosHoy.toLocaleString()}`}
            icon={<ArrowUpCircle size={36} />}
            iconBg="bg-red-200"
            iconColor="text-red-900"
            cardBg="bg-red-300"
          />

          <StatCard
            title="Balance"
            value={`Bs. ${balanceHoy.toLocaleString()}`}
            icon={<DollarSign size={36} />}
            iconBg="bg-yellow-200"
            iconColor="text-yellow-900"
            cardBg="bg-yellow-300"
          />

          <StatCard
            title="Depósitos HOY"
            value={`Bs. ${depositosHoy.toLocaleString()}`}
            icon={<ArrowDownCircle size={36} />}
            iconBg="bg-green-200"
            iconColor="text-green-900"
            cardBg="bg-green-300"
          />

          <StatCard
            title="Depósitos SEMANA"
            value={`Bs. ${depositosSemana.toLocaleString()}`}
            icon={<ArrowUpCircle size={36} />}
            iconBg="bg-blue-200"
            iconColor="text-blue-900"
            cardBg="bg-blue-300"
          />

          <StatCard
            title="Depósitos MES"
            value={`Bs. ${depositosMes.toLocaleString()}`}
            icon={<CreditCard size={36} />}
            iconBg="bg-cyan-200"
            iconColor="text-cyan-900"
            cardBg="bg-cyan-300"
          />

          {/* 📌 SALDO EFECTIVO (NETO) */}
          <StatCard
            title="Efectivo"
            value={`Bs. ${efectivoHoy.toLocaleString()}`}
            icon={<Receipt size={36} />}
            iconBg="bg-lime-200"
            iconColor="text-lime-900"
            cardBg="bg-lime-300"
          />

          {/* 📌 SALDO BANCO 1 (NETO) */}
          <StatCard
            title="Banco 1"
            value={`Bs. ${bancoUno.toLocaleString()}`}
            icon={<Building2 size={36} />}
            iconBg="bg-orange-200"
            iconColor="text-orange-900"
            cardBg="bg-orange-300"
          />

          {/* 📌 SALDO BANCO 2 (NETO) */}
          <StatCard
            title="Banco 2"
            value={`Bs. ${bancoDos.toLocaleString()}`}
            icon={<Building2 size={36} />}
            iconBg="bg-green-300"
            iconColor="text-green-950"
            cardBg="bg-green-400"
          />

          <StatCard
            title="Restituciones"
            value={`Bs. ${restitucionesMes.toLocaleString()}`}
            icon={<DollarSign size={36} />}
            iconBg="bg-red-400"
            iconColor="text-red-950"
            cardBg="bg-red-500"
          />

          <StatCard
            title="Personal"
            value={totalPersonal.toString()}
            icon={<UserRound size={36} />}
            iconBg="bg-purple-200"
            iconColor="text-purple-900"
            cardBg="bg-purple-300"
          />
        </div>
      ) : (
        <Outlet />
      )}
    </DashboardLayout>
  )
}
