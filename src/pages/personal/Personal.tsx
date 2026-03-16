import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, FileText, FileSpreadsheet } from "lucide-react"

import PersonalTable from "./PersonalTable"

export default function Personal() {

  const [personal, setPersonal] = useState<any[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchPersonal()
  }, [])

  const fetchPersonal = async () => {

    const { data, error } = await supabase
      .from("team")
      .select(`
        id,
        name,
        id_branch ( name_branch ),
        id_role ( role )
      `)
      .order("id", { ascending: false })
      .neq("id_role", 1)
      .limit(10)

    if (error) {
      console.error(error)
      return
    }

    setPersonal(data || [])
  }

  const filtered = personal.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (

    <div>

      {/* TITULO + BOTONES */}

      <div className="flex justify-between items-center mb-2">

        <h1 className="text-xl font-bold">
          REGISTRO DE PERSONAL
        </h1>

        <div className="flex gap-3">

          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 rounded">
            <Plus size={18}/>
            Nuevo
          </button>

          <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded">
            <FileText size={18}/>
            PDF
          </button>

          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded">
            <FileSpreadsheet size={18}/>
            Excel
          </button>

        </div>

      </div>


      {/* BUSCADOR */}

      <div className="mb-2">

        <input
          type="text"
          placeholder="Buscar personal..."
          className="border px-3 py-2 rounded w-full max-w-md"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

      </div>


      {/* TABLA */}

      <div className="bg-white rounded shadow p-4">

        <PersonalTable data={filtered} />

      </div>

    </div>
  )
}