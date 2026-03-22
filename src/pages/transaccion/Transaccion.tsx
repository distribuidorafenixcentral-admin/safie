import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import TransaccionTable from "./TransaccionTable"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"

export default function Transaccion() {

  const [personal, setPersonal] = useState<any[]>([])
  const [transaction, setTransaction] = useState<any[]>([])
  const [typetransaction, setTypetransaction] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const [branches, setBranches] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")
  const [mode, setMode] = useState<"create" | "view" | "edit">("create")
  const [selected, setSelected] = useState<any>(null)

  const [form, setForm] = useState({
    id_type_transaction: "",
    id_branch: "",
    id_team: "",
    amount: "",
    detail: ""
  })

  useEffect(() => {
    fetchTransaction()
    fetchPersonal()
    fetchBranches()
    fetchTypetransaction()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 2000)
      return () => clearTimeout(timer)
    }
  }, [message])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenModal(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  // ================= FETCH =================

  const fetchTransaction = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        id_type_transaction (id, description),
        id_branch (id, name_branch),
        id_team (ci, name),
        amount,
        detail,
        id_status (id, status)
      `)
      .order("id", { ascending: false })
      .eq("id_status", 1)

    if (error) console.error(error)
    setTransaction(data || [])
  }

  const fetchTypetransaction = async () => {
    const { data, error } = await supabase
      .from("type_transaction")
      .select("id, description")
<<<<<<< HEAD
      .in("id", [1, 2, 7]) 
=======
>>>>>>> feature/cargartransaccion
      .order("id")

    if (error) console.error(error)
    setTypetransaction(data || [])
  }

  const fetchPersonal = async () => {
    const { data, error } = await supabase
      .from("team")
      .select("ci, name")
      .order("name")

    if (error) console.error(error)
    setPersonal(data || [])
  }

  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("id, name_branch")
      .order("name_branch")

    if (error) console.error(error)
    setBranches(data || [])
  }

  // ================= FORM =================

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setForm({
      id_type_transaction: "",
      id_branch: "",
      id_team: "",
      amount: "",
      detail: ""
    })
  }

  // ================= SUBMIT =================

  const handleSubmit = async () => {

    if (
      !form.id_type_transaction ||
      !form.id_branch ||
      !form.id_team ||
      !form.amount ||
      !form.detail
    ) {
      setMessage("Todos los campos son obligatorios")
      setMessageType("error")
      return
    }

    const payload = {
      id_type_transaction: Number(form.id_type_transaction),
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

  // ================= ACCIONES =================

  const handleView = (row: any) => {
    setSelected(row)
    setMode("view")

    setForm({
      id_type_transaction: row.id_type_transaction?.id || "",
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
      id_type_transaction: row.id_type_transaction?.id || "",
      id_branch: row.id_branch?.id || "",
      id_team: row.id_team?.ci || "",
      amount: row.amount || "",
      detail: row.detail || ""
    })

    setOpenModal(true)
  }

  const handleDelete = async (row: any) => {
    const confirmDelete = confirm("¿Eliminar este registro?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("transactions")
      .update({ id_status: 2 })
      .eq("id", row.id)

    if (error) {
      setMessage("Error al eliminar")
      return
    }

    setMessage("Registro eliminado")
    fetchTransaction()
  }

  // ================= EXPORT =================

  const filtered = transaction.filter((p) =>
    `${p.id_team?.name || ""} ${p.id_branch?.name_branch || ""} ${p.detail || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const exportToExcel = () => {
    if (filtered.length === 0) {
      setMessage("No hay datos para exportar")
      setMessageType("error")
      return
    }

    const dataExport = filtered.map((p) => ({
      ID: p.id,
      T_Solicitud: p.id_type_transaction?.description,
      Sucursal: p.id_branch?.name_branch,
      Solicitante: p.id_team?.name || "",
      Monto: p.amount,
      Detalle: p.detail
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitudes")
    XLSX.writeFile(workbook, "Solicitudes_Transacciones_Cargadas.xlsx")
  }

  const exportToPDF = () => {
    if (filtered.length === 0) {
      setMessage("No hay datos para exportar")
      setMessageType("error")
      return
    }

    const doc = new jsPDF()

    doc.text("Solicitudes de Pagos Cargadas", 14, 10)

    const tableRows = filtered.map((p) => ([
      p.id,
      p.id_type_transaction?.description,
      p.id_branch?.name_branch,
      p.id_team?.name || "",
      p.amount,
      p.detail
    ]))

    autoTable(doc, {
      head: [["ID","T. SOLICITUD","SUCURSAL","SOLICITANTE","MONTO","DETALLE"]],
      body: tableRows,
      startY: 20
    })

    doc.save("LoadSolTrans.pdf")
  }

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
<<<<<<< HEAD
          SOLICTUDE DE PAGO
=======
          SOLICTUD DE DE PAGO
>>>>>>> feature/cargartransaccion
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
      <TransaccionTable
        data={filtered}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
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

              <select name="id_type_transaction" value={form.id_type_transaction} onChange={handleChange} disabled={mode==="view"} className="border p-2">
                <option value="">Seleccionar el tipo de solicitud</option>
                {typetransaction.map(r=>(
                  <option key={r.id} value={r.id}>{r.description}</option>
                ))}
              </select>
              
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