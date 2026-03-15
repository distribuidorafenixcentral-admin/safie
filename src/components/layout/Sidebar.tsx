import {
  ArrowLeftRight,
  FileText, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FilePlusCorner
} from "lucide-react"
import { useState } from "react"

type Props = {
  collapsed: boolean
  toggleCollapse: () => void
}

export default function Sidebar({ collapsed, toggleCollapse }: Props) {

  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const menu = [
    {
      name: "Registros",
      icon: FilePlusCorner,
       children: [
        { name: "Nueva Sucursal" },
        { name: "Nuevo Personal" },
        { name: "Depósito"},
        { name: "Vehiculo"},
        { name: "Cliente"}   
      ]
    },
    {
      name: "Transacciones",
      icon: ArrowLeftRight,
      children: [
        { name: "Deposito" },
        { name: "Pago Deudas"},
        { name: "Memos / sanciones"},      
        { name: "Pago Comisiones" },
        { name: "Pago Sueldos" },
        { name: "Pago Servicios" },
        { name: "Pago Alquileres"},
        { name: "Material de escritorio"},
        { name: "Material de limpieza"},
        { name: "Compras varias"},
        { name: "Devoluciones"}
      ]
    },
    {
      name: "Reportes",
      icon: FileText,
      children: [
        { name: "Cierre diario" },
        { name: "Sucursales" },
        { name: "Personal" },
        { name: "Movimiento General"},
        { name: "Depósitos" },
        { name: "Gastos" },
        { name: "Clientes"},
        { name: "Vehiculos"}
      ]
    } 
  ]

  return (
    <aside
      className={`
        bg-gray-900 text-white
        h-screen
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        flex flex-col
      `}
    >

      {/* Logo */}

      <div className="flex items-center justify-between p-4">

        {!collapsed && (
          <h2 className="text-xl font-bold">
            SAFIE
          </h2>
        )}

        <button
          onClick={toggleCollapse}
          className="hover:bg-gray-800 p-1 rounded"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

      </div>

      {/* Menu */}

      <nav className="flex flex-col gap-1 px-2 mt-6">

        {menu.map((item, index) => {

          const Icon = item.icon

          return (

            <div key={index}>

              {/* item principal */}

              <button
                onClick={() => item.children && toggleMenu(item.name)}
                className="flex items-center justify-between w-full hover:bg-gray-800 p-3 rounded-lg transition"
              >

                <div className="flex items-center gap-3">

                  {Icon && <Icon size={20} />}

                  {!collapsed && item.name}

                </div>

                {!collapsed && item.children && (
                  <ChevronDown
                    size={16}
                    className={`transition ${
                      openMenu === item.name ? "rotate-180" : ""
                    }`}
                  />
                )}

              </button>

              {/* Submenu */}

              {!collapsed && item.children && openMenu === item.name && (

                <div className="ml-8 mt-1 flex flex-col gap-1">

                  {item.children.map((sub, i) => (

                    <a
                      key={i}
                      className="text-sm text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded"
                    >
                      {sub.name}
                    </a>

                  ))}

                </div>

              )}

            </div>

          )

        })}

      </nav>

    </aside>
  )
}