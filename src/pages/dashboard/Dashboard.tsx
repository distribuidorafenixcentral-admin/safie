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
        efectivohoy,
        bancouno,
        bancodos,
        restitucionesmes
      ] = await Promise.all([
        getTotalPersonal(),
        getIngresosHoy(),
        getGastosHoy(),
        getDepositosHoy(),
        getDepositosSemana(),
        getDepositosMes(),
        getBalanceHoy(),
        getEfectivoMes(),
        getBanco1Mes(),
        getBanco2Mes(),
        getRestitucionMes()
      ])

      setTotalPersonal(total)
      setIngresosHoy(ingresoshoy)
      setGastosHoy(gastoshoy)
      setDepositosHoy(depositoshoy)
      setDepositosSemana(depositossem)
      setDepositosMes(depositosmes)
      setBalanceHoy(balancehoy)
      setEfectivoHoy(efectivohoy)
      setBancoUno(bancouno)
      setBancoDos(bancodos)
      setRestitucionesMes(restitucionesmes)
    } catch (error) {
      console.error("Error cargando dashboard:", error)
    }
  }

  // 🔥 Realtime con Supabase
  useEffect(() => {
    loadData()

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
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

          {/* 📌 INGRESOS GENERALES HOY */}
          <StatCard
            title="Ingresos HOY"
            value={`Bs. ${ingresosHoy.toLocaleString()}`}
            icon={<ArrowDownCircle size={36} />}
            iconBg="bg-blue-200"
            iconColor="text-blue-900"
            cardBg="bg-blue-300"
          />

          {/* 🔹 GASTOS HOY */}
          <StatCard
            title="Gastos HOY"
            value={`Bs. ${gastosHoy.toLocaleString()}`}
            icon={<ArrowUpCircle size={36} />}
            iconBg="bg-red-200"
            iconColor="text-red-900"
            cardBg="bg-red-300"
          />

          {/* 🔹 BALANCE */}
          <StatCard
            title="Balance"
            value={`Bs. ${balanceHoy.toLocaleString()}`}
            icon={<DollarSign size={36} />}
            iconBg="bg-yellow-200"
            iconColor="text-yellow-900"
            cardBg="bg-yellow-300"
          />

          {/* 📌 DEPÓSITOS HOY */}
          <StatCard
            title="Depósitos HOY"
            value={`Bs. ${depositosHoy.toLocaleString()}`}
            icon={<ArrowDownCircle size={36} />}
            iconBg="bg-green-200"
            iconColor="text-green-900"
            cardBg="bg-green-300"
          />

          {/* 📌 DEPÓSITOS SEMANA */}
          <StatCard
            title="Depósitos SEMANA"
            value={`Bs. ${depositosSemana.toLocaleString()}`}
            icon={<ArrowUpCircle size={36} />}
            iconBg="bg-blue-200"
            iconColor="text-blue-900"
            cardBg="bg-blue-300"
          />

          {/* 📌 DEPÓSITOS MES */}
          <StatCard
            title="Depósitos MES"
            value={`Bs. ${depositosMes.toLocaleString()}`}
            icon={<CreditCard size={36} />}
            iconBg="bg-cyan-200"
            iconColor="text-cyan-900"
            cardBg="bg-cyan-300"
          />

          {/* 📌 EFECTIVO */}
          <StatCard
            title="Efectivo"
            value={`Bs. ${efectivoHoy.toLocaleString()}`}
            icon={<Receipt size={36} />}
            iconBg="bg-lime-200"
            iconColor="text-lime-900"
            cardBg="bg-lime-300"
          />

          {/* 📌 BANCO 1 */}
          <StatCard
            title="Banco 1"
            value={`Bs. ${bancoUno.toLocaleString()}`}
            icon={<Building2 size={36} />}
            iconBg="bg-orange-200"
            iconColor="text-orange-900"
            cardBg="bg-orange-300"
          />

          {/* 📌 BANCO 2 */}
          <StatCard
            title="Banco 2"
            value={`Bs. ${bancoDos.toLocaleString()}`}
            icon={<Building2 size={36} />}
            iconBg="bg-green-300"
            iconColor="text-green-950"
            cardBg="bg-green-400"
          />

          
          {/* 💵 RESTITUTCIONES */}
          <StatCard
            title="Restituciones"
            value={`Bs. ${restitucionesMes.toLocaleString()}`}
            icon={<DollarSign size={36} />}
            iconBg="bg-red-400"
            iconColor="text-red-950"
            cardBg="bg-red-500"
          />

          {/* 📌 PERSONAL */}
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