import {
  ArrowLeftRight,
  // FileText, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FilePlusCorner,
  PhoneCallIcon
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { can, PERMISSIONS} from "@/auth"
import type { Role } from "@/auth"

type Props = {
  collapsed: boolean
  toggleCollapse: () => void
}


export default function Sidebar({ collapsed, toggleCollapse }: Props) {

  // Datos del perfil
  const { profile} = useAuth()

  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const menu = [
    {
      name: "Registros",
      icon: FilePlusCorner,
       children: [
        { name: "Nueva Sucursal", path: "/dashboard/sucursal", permission: PERMISSIONS.CREATE_BRANCH},
        { name: "Nuevo Personal", path: "/dashboard/personal", permission: PERMISSIONS.CREATE_PERSONAL},
        { name: "Vehiculo", path: "/dashboard/vehiculo", permission: PERMISSIONS.CREATE_CAR},
        { name: "Cliente", path: "/dashboard/cliente", permission: PERMISSIONS.CREATE_CUSTOMER},   
      ]
    },
    {
      name: "Solicitudes",
      icon: PhoneCallIcon,
      children: [
        { name: "Pago Servicios", path: "/dashboard/transaccion", permission: PERMISSIONS.CREATE_REGTRANSACTION},
        { name: "Depósito", path: "/dashboard/regdeposito", permission: PERMISSIONS.CREATE_REGDEPOSIT}
      ]
    },
    {
      name: "T. Ingresos",
      icon: ArrowLeftRight,
      children: [
        { name: "Deposito", path: "/dashboard/deposito", permission: PERMISSIONS.DEPOSITS},       
        { name: "Memos / sanciones", path: "/dashboard/memos", permission: PERMISSIONS.MEMORANDUM}
      ]
    ,},
      {
      name: "T. Egresos",
      icon: ArrowLeftRight,
      children: [  
        { name: "Pago Comisiones", path: "/dashboard/comisiones", permission: PERMISSIONS.PAGO_COMISION },
        { name: "Pago Solicitudes pendientes", path: "/dashboard/pagossol", permission: PERMISSIONS.PAGO_SUELDO},
        { name: "Compras varias", path: "/dashboard/compras", permission: PERMISSIONS.PAGO_COMPRAS},
        { name: "Restituciones", path: "/dashboard/restitutions", permission: PERMISSIONS.DEVOLUCIONES},
      ]
    },
   /*  {
      name: "Reportes",
      icon: FileText,
      children: [
        { name: "Cierre diario", path: "/cierre", permission: PERMISSIONS.CREATE_BRANCH },
        { name: "Sucursales", path: "/repsucursales" },
        { name: "Personal", path: "/reopersonal" },
        { name: "Movimiento General", path: "/repmovgeneral"},
        { name: "Depósitos", path: "/repdepositos" },
        { name: "Gastos", path: "/repgastos" },
        { name: "Clientes", path: "/repclientes"},
        { name: "Vehiculos", path: "/repvehiculos"}
      ]
    }  */
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

                  {item.children
                  .filter(sub => !sub.permission || can(profile?.roleName as Role | undefined, sub.permission))
                  .map((sub, i) => (

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