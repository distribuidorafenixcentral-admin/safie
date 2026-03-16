import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import PersonalTable from "./PersonalTable"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"

export default function Personal() {

  const [personal, setPersonal] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [openModal, setOpenModal] = useState(false)

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
      .order("id", { ascending: true })
      .neq("id_role", 1)

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

    <div className="p-6">

      {/* TITULO Y BOTONES */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          REGISTRO DE PERSONAL
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
          >
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

      <div className="mb-6">

        <input
          type="text"
          placeholder="Buscar personal..."
          className="border px-3 py-2 rounded w-full max-w-md"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

      </div>


      {/* TABLA */}

      <PersonalTable data={filtered} />


      {/* MODAL */}

      {openModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg w-125">

            <h1 className="text-xl font-bold mb-4">
              MODAL DE REGISTRO DE PERSONAL
            </h1>

            <button
              onClick={() => setOpenModal(false)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>

          </div>

        </div>

      )}

    </div>
  )
}