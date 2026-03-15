import type { ReactNode } from "react"

type Props = {
  title: string
  value: string
  icon: ReactNode
  iconColor?: string
  iconBg?: string
  cardBg?: string
}

export default function StatCard({ title, value, icon, iconColor="text-gray-100", iconBg ="bg-gray-100", cardBg="bg-white" }: Props) {
  return (
    <div className ={`${cardBg} rounded-xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition`}>
      <div>
        <p className="text-black text-sm font-semibold">{title}</p>
        <h2 className="text-2xl font-bold mt-1">{value}</h2>
      </div>

      <div className={`${iconBg} ${iconColor} p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
  )
}