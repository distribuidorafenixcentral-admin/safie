import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { User } from "lucide-react"

export default function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const today = new Date()

  const fecha = today.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
      
  }

  // Obtener datos del usuario
  useEffect(() => {

    const getUserData = async () => {

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("team")
        .select(`
          name,
          user,
          id_role (role ), 
          id_branch ( name_branch )
        `)
        .eq("user_id", user.id)
        .single()

      setUserData(data)
    }

    getUserData()

  }, [])

  // cerrar dropdown al hacer clic fuera
  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }

    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, [])

  return (
    <header className="bg-white border-b px-4 py-2 flex justify-between items-center">

      {/* Fecha dinámica */}
      <h1 className="text-sm text-purple-950 font-semibold italic capitalize">
        {fecha}
      </h1>

      <div ref={dropdownRef} className="flex items-center gap-4 relative">

        {/* Usuario */}
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold">
            {userData?.user || "Cargando..."}
          </p>

          <p className="text-xs text-gray-500">
            {userData?.id_role?.role || ""}
          </p>

          <p className="text-xs text-gray-400">
            {userData?.id_branch?.name_branch || ""}
          </p>
        </div>

        {/* Avatar con Lucide */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
        >
          <User size={20} />
        </button>

        {/* Dropdown */}
        <div
          className={`
          absolute right-0 top-12 w-44 bg-white border rounded-lg shadow-md
          transition-all duration-200 origin-top-right
          ${menuOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"}
        `}
        >

          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Perfil
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            Cerrar sesión
          </button>

        </div>

      </div>

    </header>
  )
}