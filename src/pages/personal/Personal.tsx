import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import PersonalTable from "./PersonalTable"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"

export default function Personal() {

  const [personal, setPersonal] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [openModal, setOpenModal] = useState(false)

  const [branches, setBranches] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")
  const [mode, setMode] = useState<"create" | "view" | "edit">("create")
  const [selected, setSelected] = useState<any>(null)
  const confirm = useConfirm()
  const showToast = useToast()

  // cargamos la tabla
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

  // mensajes automáticos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // cerrar modal con ESC
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

  // recuperamos los datos de la tabla Personal
  const fetchPersonal = async () => {

    const { data, error } = await supabase
      .from("team")
      .select(`
        id,
        ci,
        name,
        celphone,
        stard_date,
        reference,
        celphon_ref,
        id_branch ( id, name_branch ),
        id_role ( id, role )
      `)
      .order("id", { ascending: false })
      .neq("id_branch", 1)
      .neq("status", 2)

    //muestra el error en caso que sea BD
    if (error) console.error(error)
    setPersonal(data || [])
  }

// Recuperamos los datos de la tabla Sucursales
  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("id,name_branch")
      .order("name_branch")

    if (error) console.error(error)
    setBranches(data || [])
  }

  // Re cuperamos los datros de la tabla roles
  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from("role")
      .select("id,role")
      .order("role")

    if (error) console.error(error)
    setRoles(data || [])
  }

  // Actualiza el formulario deforma dinamica
  const handleChange = (e:any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // resetear el formulario 
  const resetForm = () => {
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
  }

  // ENVIA LOS DATOS PARA GUARDAR EL REGISTRO
  const handleSubmit = async () => {

    // VALIDACIÓN DE CAMPOS VACIOS
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

    // VALIDAR DUPLICADO SOLO EN CREATE
    if (mode === "create") {
      const { data: existing } = await supabase
        .from("team")
        .select("ci")
        .eq("ci", form.ci)

      if (existing && existing.length > 0) {
        setMessage("El CI ya está registrado")
        setMessageType("error")
        return
      }
    }

    // CREATE
    if (mode === "create") {

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
    }

    // UPDATE
    if (mode === "edit" && selected) {

      const { error } = await supabase
        .from("team")
        .update({
          name: form.name,
          celphone: form.celphone,
          stard_date: form.stard_date,
          id_branch: form.id_branch,
          id_role: form.id_role,
          reference: form.reference,
          celphon_ref: form.celphon_ref
        })
        .eq("id", selected.id)

      if (error) {
        setMessage("Error al actualizar")
        setMessageType("error")
        return
      }

      setMessage("Registro actualizado correctamente")
    }

    setMessageType("success")

    setTimeout(() => {
      setOpenModal(false)
      resetForm()
      setSelected(null)
      setMode("create")
      setMessage("")
      setMessageType("")
    }, 1500)

    fetchPersonal()

  }

  // Ver El registro
  const handleView = (row:any) => {

    setSelected(row)
    setMode("view")

    setForm({
      ci: row.ci || "",
      name: row.name || "",
      celphone: row.celphone || "",
      stard_date: row.stard_date || "",
      id_branch: row.id_branch?.id || "",
      id_role: row.id_role?.id || "",
      reference: row.reference || "",
      celphon_ref: row.celphon_ref || ""
    })

    setOpenModal(true)

  }

  //Editar el registro
  const handleEdit = (row:any) => {

    setSelected(row)
    setMode("edit")

    setForm({
      ci: row.ci || "",
      name: row.name || "",
      celphone: row.celphone || "",
      stard_date: row.stard_date || "",
      id_branch: row.id_branch?.id || "",
      id_role: row.id_role?.id || "",
      reference: row.reference || "",
      celphon_ref: row.celphon_ref || ""
    })

    setOpenModal(true)

  }

  // Eliminar el registro => cambia el status a 2
  const handleDelete = (row:any) => {
        confirm({
          title: "Eliminar registro",
          message: "¿Seguro que deseas eliminar este registro?",
          confirmText: "Eliminar",
          onConfirm: async () => {
            const { error } = await supabase
              .from("team")
              .update({ status: 2 })
              .eq("id", row.id)

            if (error) {
              showToast("Error al eliminar", "error")
            } else {
              showToast("Proceso concluido con éxito ✅", "success")
              fetchPersonal()
            }
          }
        })
      }

  // EXPORTAR EXCEL
  const exportToExcel = () => {

    if (filtered.length === 0) {
      setMessage("No hay datos para exportar")
      setMessageType("error")
      return
    }

    // formatear datos
    const dataExport = filtered.map((p) => ({
      ID: p.id,
      CI: p.ci,
      Nombre: p.name,
      Celular: p.celphone,
      Fecha_Ingreso: p.stard_date,
      Sucursal: p.id_branch?.name_branch,
      Rol: p.id_role?.role,
      Referencia: p.reference,
      Cel_Referencia: p.celphon_ref
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Personal")

    XLSX.writeFile(workbook, "personal.xlsx")

  }

  // exportar PDF
  const exportToPDF = () => {

    if (filtered.length === 0) {
      setMessage("No hay datos para exportar")
      setMessageType("error")
      return
    }

    const doc = new jsPDF()

    // Título
    doc.text("Reporte de Personal", 14, 10)

    // Columnas
    const tableColumn = [
      "ID",
      "CI",
      "Nombre",
      "Celular",
      "F. Ingreso",
      "Sucursal",
      "Rol"
    ]

    // Filas
    const tableRows = filtered.map((p) => ([
      p.id,
      p.ci,
      p.name,
      p.celphone,
      p.stard_date,
      p.id_branch?.name_branch,
      p.id_role?.role
    ]))

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20
    })

    doc.save("personal.pdf")

  }


  const filtered = personal.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl italic font-bold">
          REGISTRO DE PERSONAL
        </h2>

        <div className="flex gap-3">
          {/* BOTON NUEVO REGISTO*/}
          <button
            onClick={() => {
              setMode("create")
              resetForm()
              setOpenModal(true)
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
          >
            <Plus size={18}/>
            Nuevo
          </button>
            {/* BOTON PDF*/}
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded">
            <FileText size={18}/>
            PDF
          </button>
            {/* BOTON EXCEL*/}
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded">
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
      <PersonalTable
        data={filtered}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODAL */}
      {openModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg w-200 border-2 border-black">
            

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

            <h2 className="text-xl font-bold italic mb-4">
              {mode === "create" && "REGISTRO DE PERSONAL NUEVO"}
              {mode === "view" && "DETALLE DEL TRABAJADOR"}
              {mode === "edit" && "EDITAR REGISTRO"}
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <h3 className="text-blue-950 text-lg font-semibold italic">C.I.</h3>
              <h3 className="text-blue-950 text-lg font-semibold italic" >Nombre</h3>                          
              <input name="ci" value={form.ci} onChange={handleChange} disabled={mode !== "create"} placeholder="CI" className="border p-2"/>
              <input name="name" value={form.name} onChange={handleChange} disabled={mode==="view"} placeholder="Nombre" className="border p-2"/>
              <h3 className="text-blue-950 text-lg font-semibold italic">Teléfono</h3>
              <h3 className="text-blue-950 text-lg font-semibold italic">Fecha de Ingreso</h3>
              <input name="celphone" value={form.celphone} onChange={handleChange} disabled={mode==="view"} placeholder="Celular" className="border p-2"/>
              <input name="stard_date" value={form.stard_date} onChange={handleChange} disabled={mode==="view"} type="date" className="border p-2"/>
              <h3 className="text-blue-950 text-lg font-semibold italic">Sucursal</h3>
              <h3 className="text-blue-950 text-lg font-semibold italic">Rol</h3>     
              <select name="id_branch" value={form.id_branch} onChange={handleChange} disabled={mode==="view"} className="border p-2">
                <option value="">Seleccionar sucursal</option>
                {branches.map(b=>(
                  <option key={b.id} value={b.id}>{b.name_branch}</option>
                ))}
              </select>
              <select name="id_role" value={form.id_role} onChange={handleChange} disabled={mode==="view"} className="border p-2">
                <option value="">Seleccionar rol</option>
                {roles.map(r=>(
                  <option key={r.id} value={r.id}>{r.role}</option>
                ))}
              </select>
              <h3 className="text-blue-950 text-lg font-semibold italic">Referencia</h3>
              <h3 className="text-blue-950 text-lg font-semibold italic">Cel. Referencia</h3>
              <input name="reference" value={form.reference} onChange={handleChange} disabled={mode==="view"} placeholder="Referencia" className="border p-2"/>
              <input name="celphon_ref" value={form.celphon_ref} onChange={handleChange} disabled={mode==="view"} placeholder="Celular referencia" className="border p-2"/>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={()=>setOpenModal(false)}
                className="bg-red-400 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>

              {mode !== "view" && (
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  )
}