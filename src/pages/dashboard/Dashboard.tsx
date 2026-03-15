import DashboardLayout from "@/layouts/DashboardLayout"
import StatCard from "@/components/cards/StarCard"

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

  return (

    <DashboardLayout>
     {/* stadistcs Cards */}
    <div>    

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Depósitos HOY"
            value="$12,430"
            icon={<ArrowDownCircle size={36} />}
            iconBg="bg-green-200"
            iconColor="text-green-900"
            cardBg="bg-green-300"
          />
          <StatCard
            title="Gastos HOY"
            value="$ 1,100"
            icon={<ArrowUpCircle size={36} />}
            iconBg="bg-red-200"
            iconColor="text-red-900"
            cardBg="bg-red-300"
          />

          <StatCard
            title="Balance"
            value="$ 11,330"
            icon={<DollarSign size={36} />}
            iconBg="bg-yellow-200"
            iconColor="text-yellow-900"
            cardBg="bg-yellow-300"
          />

          <StatCard
            title="Depósitos SEMANA"
            value="$ 24,210"
            icon={<ArrowUpCircle size={36} />}
            iconBg="bg-blue-200"
            iconColor="text-blue-900"
            cardBg="bg-blue-300"
          />

          <StatCard
            title="Depósitos MES"
            value="$ 318,220"
            icon={<CreditCard size={36} />}
            iconBg="bg-cyan-200"
            iconColor="text-cyan-900"
            cardBg="bg-cyan-300"
          />
          <StatCard
            title="Personal"
            value="56"
            icon={<UserRound size={36} />}
            iconBg="bg-purple-200"
            iconColor="text-purple-900"
            cardBg="bg-purple-300"
          />
          <StatCard
            title="Efectivo"
            value="$15,000"
            icon={<Receipt size={36} />}
            iconBg="bg-lime-200"
            iconColor="text-lime-900"
            cardBg="bg-lime-300"
          />

          <StatCard
            title="Banco"
            value="$10,000"
            icon={<Building2 size={36} />}
            iconBg="bg-orange-200"
            iconColor="text-orange-900"
            cardBg="bg-orange-300"
            
          />
        </div>

    </div>
           

    </DashboardLayout>

  )

}