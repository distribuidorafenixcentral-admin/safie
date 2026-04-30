import DashboardLayout from "@/layouts/DashboardLayout"
import StatCard from "@/components/cards/StarCard"
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

import {
  getTotalPersonal,
  getIngresosHoy,
  getGastosHoy,
  getDepositosHoy,
  getDepositosSemana,
  getDepositosMes,
  getBalanceHoy,  
  getEfectivo,
  getBanco1,
  getBanco2
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
  const [totalPersonal, setTotalPersonal] = useState(0)
  const [ingresosHoy, setIngresosHoy] = useState(0)
  const [gastosHoy, setGastosHoy] = useState(0)
  const [depositosHoy, setDepositosHoy] = useState(0)
  const [depositosSemana, setDepositosSemana] = useState(0)
  const [depositosMes, setDepositosMes] = useState(0)
  const [balanceHoy, setBalanceHoy] = useState(0)
  const [efectivoHoy, setEfectivoHoy] = useState(0)
  const [bancoUno, setBancoUno] = useState(0)
  const [bancoDos, setBancoDos] = useState(0)


  // 🔥 Cargar datos
  useEffect(() => {
    const loadData = async () => {
      const total = await getTotalPersonal()
      const ingresoshoy = await getIngresosHoy()
      const gastoshoy = await getGastosHoy()
      const depositoshoy = await getDepositosHoy()
      const depositossem = await getDepositosSemana()
      const depositosmes = await getDepositosMes()
      const balancehoy = await getBalanceHoy()
      const efectivohoy = await getEfectivo()
      const bancouno = await getBanco1()
      const bancodos = await getBanco2()

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

      
    }

    loadData()
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
          {/* 🔹 gastos hoy */}
          <StatCard
            title="Gastos HOY"
            value={`Bs. ${gastosHoy.toLocaleString()}`}
            icon={<ArrowUpCircle size={36} />}
            iconBg="bg-red-200"
            iconColor="text-red-900"
            cardBg="bg-red-300"
          />
          {/* 🔹 balanace hoy */}
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

   

          <StatCard
            title="Efectivo"
            value={`Bs. ${efectivoHoy.toLocaleString()}`}
            icon={<Receipt size={36} />}
            iconBg="bg-lime-200"
            iconColor="text-lime-900"
            cardBg="bg-lime-300"
          />

          <StatCard
            title="Banco 1"
             value={`Bs. ${bancoUno.toLocaleString()}`}
            icon={<Building2 size={36} />}
            iconBg="bg-orange-200"
            iconColor="text-orange-900"
            cardBg="bg-orange-300"
          />
              <StatCard
            title="Banco 2"
             value={`Bs. ${bancoDos.toLocaleString()}`}
            icon={<Building2 size={36} />}
            iconBg="bg-green-300"
            iconColor="text-green-950"
            cardBg="bg-green-400"
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