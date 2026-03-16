import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import PersonalTable from "./PersonalTable"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"

export default function Personal() {

  const [personal, setPersonal] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [openModal, setOpenModal] = useState(false)

  const [branches, setBranches] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])

  const [form, setForm] = useState({
    ci: "",
    name: "",
    celphone: "",
    stard_date: "",
    id_branch: "",
    id_role: "",
    reference: "",
    celphon_ref: ""
  })

  useEffect(() => {
    fetchPersonal()
    fetchBranches()
    fetchRoles()
  }, [])

  const fetchPersonal = async () => {

    const { data, error } = await supabase
      .from("team")
      .select(`
        id,
        ci,
        name,
        id_branch ( name_branch ),
        id_role ( role )
      `)
      .order("id", { ascending: false })
      .neq("id_branch", 1)

    if (error) console.error(error)

    setPersonal(data || [])

  }

  const fetchBranches = async () => {

    const { data, error } = await supabase
      .from("branches")
      .select("id,name_branch")
      .order("name_branch")

    if (error) console.error(error)

    setBranches(data || [])

  }

  const fetchRoles = async () => {

    const { data, error } = await supabase
      .from("role")
      .select("id,role")
      .order("role")

    if (error) console.error(error)

    setRoles(data || [])

  }

  const handleChange = (e:any) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    })

  }

  const handleSubmit = async () => {

    const { error } = await supabase
      .from("team")
      .insert({

        ci: form.ci,
        name: form.name,
        celphone: form.celphone,
        stard_date: form.stard_date,
        id_branch: form.id_branch,
        id_role: form.id_role,
        reference: form.reference,
        celphon_ref: form.celphon_ref,

        status: 1,
        user_id: null

      })

    if (error) {

      console.error(error)
      return

    }

    setOpenModal(false)

    setForm({
      ci: "",
      name: "",
      celphone: "",
      stard_date: "",
      id_branch: "",
      id_role: "",
      reference: "",
      celphon_ref: ""
    })

    fetchPersonal()

  }

  const filtered = personal.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (

    <div className="p-6">

      {/* HEADER */}

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

      <input
        type="text"
        placeholder="Buscar..."
        className="border px-3 py-2 rounded mb-6 w-full max-w-md"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />


      {/* TABLA */}

      <PersonalTable data={filtered} />


      {/* MODAL */}

      {openModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg w-150">

            <h2 className="text-xl font-bold mb-4">
              REGISTRO DE PERSONAL
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <input name="ci" placeholder="CI" className="border p-2" onChange={handleChange}/>
              <input name="name" placeholder="Nombre" className="border p-2" onChange={handleChange}/>
              <input name="celphone" placeholder="Celular" className="border p-2" onChange={handleChange}/>
              <input name="stard_date" type="date" className="border p-2" onChange={handleChange}/>

              <select name="id_branch" className="border p-2" onChange={handleChange}>
                <option>Seleccionar sucursal</option>
                {branches.map(b=>(
                  <option key={b.id} value={b.id}>
                    {b.name_branch}
                  </option>
                ))}
              </select>

              <select name="id_role" className="border p-2" onChange={handleChange}>
                <option>Seleccionar rol</option>
                {roles.map(r=>(
                  <option key={r.id} value={r.id}>
                    {r.role}
                  </option>
                ))}
              </select>

              <input name="reference" placeholder="Referencia" className="border p-2" onChange={handleChange}/>
              <input name="celphon_ref" placeholder="Celular referencia" className="border p-2" onChange={handleChange}/>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={()=>setOpenModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}