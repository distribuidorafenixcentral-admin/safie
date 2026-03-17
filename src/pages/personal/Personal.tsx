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
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")

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

    useEffect(() => {

    if (message) {

      const timer = setTimeout(() => {
        setMessage("")
      }, 2000) // 2 segundos

      return () => clearTimeout(timer)

    }

  }, [message])

  useEffect(() => {

  const handleEsc = (e: KeyboardEvent) => {

    if (e.key === "Escape") {
      setOpenModal(false)
    }

  }
  
  

  window.addEventListener("keydown", handleEsc)

  return () => {
    window.removeEventListener("keydown", handleEsc)
  }

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
      
      // Validación de campos
      if (
        !form.ci ||
        !form.name ||
        !form.celphone ||
        !form.stard_date ||
        !form.id_branch ||
        !form.id_role ||
        !form.reference ||
        !form.celphon_ref
      ) {
        setMessage("Todos los campos son obligatorios")
        setMessageType("error")
        return
      }

      // Validación de llave primaria duplicada (ci=> carnet de identidad)
      const { data: existing } = await supabase
        .from("team")
        .select("ci")
        .eq("ci", form.ci)

     if (existing && existing.length > 0) {
        setMessage("El CI ya está registrado")
        setMessageType("error")
        return
      }
       
      // Si se pasa la validación, se guarda recien
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
        setMessage("Error al guardar")
        setMessageType("error")
        return
      }

    setMessage("Registro guardado correctamente")
    setMessageType("success")

    // se cerrara despues de 1.5 segundos
    setTimeout(() => {

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

      setMessage("")
      setMessageType("")

    }, 1500)

    fetchPersonal()

  }

  const filtered = personal.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (

    <div className="p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        {message && (
          <div className="mb-4 bg-purple-200 text-purple-800 p-2 rounded">
            {message}
          </div>
        )}

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

            {message && (
              <div
                className={`mb-4 p-2 rounded text-white ${
                  messageType === "error"
                    ? "bg-red-500"
                    : "bg-green-500"
                }`}
              >
                {message}
              </div>
            )}

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
                className="bg-red-400 text-white px-4 py-2 rounded"
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