import {
  ArrowLeftRight,
  FileText, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FilePlusCorner
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

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
        { name: "Nueva Sucursal", path: "/dashboard/sucursal" },
        { name: "Nuevo Personal", path: "/dashboard/personal" },
        { name: "Transaccion", path: "/dashboard/transaccion"},
        { name: "Depósito", path: "/regdeposito"},
        { name: "Vehiculo", path: "/vehiculo"},
        { name: "Cliente", path: "/cliente"}   
      ]
    },
    {
      name: "Transacciones",
      icon: ArrowLeftRight,
      children: [
        { name: "Deposito", path: "/deposito" },
        { name: "Pago Deudas", path: "/deudas"},
        { name: "Memos / sanciones", path: "/sancines"},      
        { name: "Pago Comisiones", path: "/comisiones" },
        { name: "Pago Sueldos", path: "/sueldos" },
        { name: "Pago Servicios", path: "/servicios" },
        { name: "Pago Alquileres", path: "/alquileres"},
        { name: "Material de escritorio", path: "/matescritorio"},
        { name: "Material de limpieza", path: "/matlimpieza"},
        { name: "Compras varias", path: "/varios"},
        { name: "Devoluciones", path: "/devoluciones"}
      ]
    },
    {
      name: "Reportes",
      icon: FileText,
      children: [
        { name: "Cierre diario", path: "/cierre" },
        { name: "Sucursales", path: "/repsucursales" },
        { name: "Personal", path: "/reopersonal" },
        { name: "Movimiento General", path: "/repmovgeneral"},
        { name: "Depósitos", path: "/repdepositos" },
        { name: "Gastos", path: "/repgastos" },
        { name: "Clientes", path: "/repclientes"},
        { name: "Vehiculos", path: "/repvehiculos"}
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

                    <Link
                        key={i}
                        to={sub.path || "#"}
                        className="text-sm text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded"
                      >
                        {sub.name}
                    </Link>

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