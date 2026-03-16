import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, FileText, FileSpreadsheet, Pencil, Eye, Trash } from "lucide-react"

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
      .order("id", {ascending: true})
      .neq("id_role", 1)
      .limit(5)

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
    <div >

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          REGISTRO DE PERSONAL
        </h1>

        <div className="flex gap-3">

          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
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

      <div className="mb-6">

        <input
          type="text"
          placeholder="Buscar personal..."
          className="border px-3 py-2 rounded w-full max-w-md"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

      </div>

      <div className="bg-white rounded shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Sucursal</th>
              <th className="p-3 text-left">Rol</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>

          </thead>

          <tbody>

            {filtered.map((p) => (

              <tr key={p.id} className="border-t hover:bg-gray-50">

                <td className="p-3">{p.id}</td>

                <td className="p-3">{p.name}</td>

                <td className="p-3">
                  {p.id_branch?.name_branch}
                </td>

                <td className="p-3">
                  {p.id_role?.role}
                </td>

                <td className="p-3 flex gap-3">

                  <button className="text-blue-600">
                    <Eye size={18}/>
                  </button>

                  <button className="text-green-600">
                    <Pencil size={18}/>
                  </button>

                  <button className="text-red-600">
                    <Trash size={18}/>
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}