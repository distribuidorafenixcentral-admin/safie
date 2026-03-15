import { useState } from "react"

import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function DashboardLayout({ children }: any) {

  const [collapsed, setCollapsed] = useState(false)

  return (

    <div className="flex min-h-screen bg-gray-100">

      <Sidebar
        collapsed={collapsed}
        toggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div className="flex flex-col flex-1">

        <Navbar />

        <main className="flex-1 p-4">

          {children}

        </main>

        <Footer />

      </div>

    </div>

  )
}