import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import RegdeudaTable from "./RegdeudaTable"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"

export default function Regdeuda() {

  // tabla Principal
   const [transaction, setTransaction] = useState<any[]>([])
  //tablas relacionadas
  const [personal, setPersonal] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  // Funcionales  
  const [search, setSearch] = useState("")
  const [openModal, setOpenModal] = useState(false)  
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")
  const [mode, setMode] = useState<"create" | "view" | "edit">("create")
  const [selected, setSelected] = useState<any>(null)

  // Formulario
  const [form, setForm] = useState({    
    id_branch: "",
    id_team: "",
    amount: "",
    detail: ""
  })

  // Efectos por cambio de informacion
  useEffect(() => {
    fetchTransaction()
    fetchPersonal()
    fetchBranches()   
  }, [])

  // Mensajes 
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 2000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Cerrar el modal con el boton ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenModal(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  // Fetch

  // Fetch tabla principal
  const fetchTransaction = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,       
        id_branch (id, name_branch),
        id_team (ci, name),
        amount,
        detail,
        id_status (id, status)
      `)
      .order("id", { ascending: false })
      .eq("id_status", 1)
      .eq("id_type_transaction", 10)

    if (error) console.error(error)
    setTransaction(data || [])
  }

  // Fetch deudor
  const fetchPersonal = async () => {
    const { data, error } = await supabase
      .from("team")
      .select("ci, name")
      .order("name")

    if (error) console.error(error)
    setPersonal(data || [])
  }

  // Fetch sucursal
  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("id, name_branch")
      .order("name_branch")

    if (error) console.error(error)
    setBranches(data || [])
  }

  // Formulario
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // Resetear el formulario
  const resetForm = () => {
    setForm({      
      id_branch: "",
      id_team: "",
      amount: "",
      detail: ""
    })
  }

  // Submit

  const handleSubmit = async () => {

    // control campos obligatorios
    if (     
      !form.id_branch ||
      !form.id_team ||
      !form.amount ||
      !form.detail
    ) {
      setMessage("Todos los campos son obligatorios")
      setMessageType("error")
      return
    }

    // cargar el formulario 
    const payload = {     
      id_type_transaction: 10,
      id_branch: Number(form.id_branch),
      id_team: form.id_team,
      amount: Number(form.amount),
      detail: form.detail,
      id_status: 1
    }

    if (mode === "create") {
      const { error } = await supabase
        .from("transactions")
        .insert(payload)

      if (error) {
        console.error("INSERT ERROR:", error)
        setMessage(error.message)
        setMessageType("error")
        return
      }

      setMessage("Registro guardado correctamente")
    }

    if (mode === "edit" && selected) {
      const { error } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", selected.id)

      if (error) {
        console.error("UPDATE ERROR:", error)
        setMessage(error.message)
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

    fetchTransaction()
  }

  // Acciones de los botones ver, editar 

  const handleView = (row: any) => {
    setSelected(row)
    setMode("view")

    setForm({      
      id_branch: row.id_branch?.id || "",
      id_team: row.id_team?.ci || "",
      amount: row.amount || "",
      detail: row.detail || ""
    })

    setOpenModal(true)
  }

  const handleEdit = (row: any) => {
    setSelected(row)
    setMode("edit")

    setForm({      
      id_branch: row.id_branch?.id || "",
      id_team: row.id_team?.ci || "",
      amount: row.amount || "",
      detail: row.detail || ""
    })

    setOpenModal(true)
  }

    // NO SE PERMITE LA ELIMINACION DESDE ESTE MODULO
    // => CUANDO LA DEUDA SE CANCELE SE CAMBIARA EL ESTADO DE LA DEUDA 
    // DESDE OTRO MODULO

  // Filtro y Exportar

  // filtro
  const filtered = transaction.filter((p) =>
    `${p.id_team?.name || ""} ${p.amount || ""} ${p.id_branch?.name_branch || ""} ${p.detail || ""} `
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // Exportar Excel
  const exportToExcel = () => {
    if (filtered.length === 0) {
      setMessage("No hay datos para exportar")
      setMessageType("error")
      return
    }

    const dataExport = filtered.map((p) => ({
      ID: p.id,      
      Sucursal: p.id_branch?.name_branch,
      Solicitante: p.id_team?.name || "",
      Monto: p.amount,
      Detalle: p.detail
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deuda")
    XLSX.writeFile(workbook, "RegistroDeuda.xlsx")
  }

  // Exportar PDF
  const exportToPDF = () => {
    if (filtered.length === 0) {
      setMessage("No hay datos para exportar")
      setMessageType("error")
      return
    }

    const doc = new jsPDF()

    doc.text("Registro de deudas vigentes", 14, 10)

    const tableRows = filtered.map((p) => ([
      p.id,      
      p.id_branch?.name_branch,
      p.id_team?.name || "",
      p.amount,
      p.detail
    ]))

    autoTable(doc, {
      head: [["ID", "SUCURSAL","SOLICITANTE","MONTO","DETALLE"]],
      body: tableRows,
      startY: 20
    })

    doc.save("RegDeudasVigentes.pdf")
  }

  // MAIN
  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-violet-900 font-bold italic">
          REGISTRO DE DEUDAS
        </h2>
        <div className="flex gap-3">
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
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded">
            <FileText size={18}/>
            PDF
          </button>
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
      <RegdeudaTable
        data={filtered}
        onView={handleView}
        onEdit={handleEdit}        
      />

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-150">
            {message && (
              <div className={`mb-4 p-2 rounded text-white ${
                messageType === "error" ? "bg-red-500" : "bg-green-500"
              }`}>
                {message}
              </div>
            )}
            <h2 className="text-xl font-bold mb-4">
              {mode === "create" && "REGISTRAR NUEVA SOLICITUD"}
              {mode === "view" && "DETALLE DE LA SOLICITUD"}
              {mode === "edit" && "EDITAR SOLICITUD"}
            </h2>

            <div className="grid grid-cols-2 gap-4">             
              
              <select name="id_branch" value={form.id_branch} onChange={handleChange} disabled={mode==="view"} className="border p-2">
                <option value="">Seleccionar sucursal</option>
                {branches.map(b=>(
                  <option key={b.id} value={b.id}>{b.name_branch}</option>
                ))}
              </select>
              <select name="id_team" value={form.id_team} onChange={handleChange} disabled={mode==="view"} className="border p-2">
                <option value="">Seleccionar Solicitante</option>
                {personal.map(b=>(
                  <option key={b.ci} value={b.ci}>{b.name}</option>
                ))}
              </select>
              <input name="amount" value={form.amount} onChange={handleChange} disabled={mode==="view"} placeholder="Monto" className="border p-2"/>
              <input name="detail" value={form.detail} onChange={handleChange} disabled={mode==="view"} placeholder="Detalle" className="border p-2"/>
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