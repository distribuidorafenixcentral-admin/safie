import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import MemosTable from "./MemosTable"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { logo64 } from "@/utils/pdf/logo64"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"
import { generatePDF } from "@/utils/pdf/templates/pdfTemplates"

// 🔹 REGLAS TIPO DE PAGO
const TYPE_PAY_RULES: Record<number, { requireBank: boolean }> = {
  1: { requireBank: false }, // EFECTIVO
  2: { requireBank: true },
  3: { requireBank: true },
  4: { requireBank: true },
}

export default function Memos() {

  const [personal, setPersonal] = useState<any[]>([])
  const [cuentas, setCuentas] = useState<any[]>([])
  const [tpago, setTpago] = useState<any[]>([])
  const [transaction, setTransaction] = useState<any[]>([])
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
    id_type_pay: "",
    amount: "",
    id_cuenta: "",
    detail: ""
  })

  // 🔹 DERIVADOS
  const currentTypePay = Number(form.id_type_pay)
  const requireBank = TYPE_PAY_RULES[currentTypePay]?.requireBank ?? false

  // 🔹 FILTRO PERSONAL POR SUCURSAL
  const filteredPersonal = personal.filter(p =>
    form.id_branch ? p.id_branch == form.id_branch : true
  )


  //Imprimir el documento para firma
  
  const handleExport = () => {
  const header = {
    title: "Reporte de Depósitos",
    subtitle: "Sistema Financiero",
    date: new Date().toLocaleDateString(),
    logo: logo64 
  }

  const table = {
    head: ["Banco", "Titular", "Monto", "Detalle"],
    body: transaction.map(item => [
  item.id_cuenta?.banco,
  item.id_cuenta?.titular,
  item.amount,
  item.detail
])  
  }

  const doc = generatePDF(header, table)
  doc.output("dataurlnewwindow") 
}
  useEffect(() => {
    fetchTransaction()
    fetchPersonal()
    fetchCuentas()
    fetchTpago()
    fetchBranches()
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
        id_type_pay (id, type_p),
        amount,
        detail,
        id_cuenta (id, banco, titular, numero_cta),
        id_status (id, status)
      `)
      .eq("id_status", 2)
      .eq("id_type_transaction" , 9)
      .order("id", { ascending: false })

    if (error) console.error(error)
    setTransaction(data || [])
  }

  const fetchPersonal = async () => {
    const { data, error } = await supabase
      .from("team")
      .select("ci, name, id_branch") // 🔹 IMPORTANTE
      .order("name")

    if (error) console.error(error)
    setPersonal(data || [])
  }

  const fetchTpago = async () => {
    const { data, error } = await supabase
      .from("type_pay")
      .select("id, type_p")
      .order("id")

    if (error) console.error(error)
    setTpago(data || [])
  }

  const fetchCuentas = async () => {
    const { data, error} = await supabase
      .from("cuentas")
      .select("id, banco, numero_cta, titular")
      .order("id")
    
    if (error) console.error(error)
    else setCuentas(data || [])
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
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === "id_branch" && { id_team: "" }) // 🔹 reset personal al cambiar sucursal
    }))
  }

  const resetForm = () => {
    setForm({
      id_type_transaction: "",
      id_branch: "",
      id_team: "",
      id_cuenta:"",
      id_type_pay:"",
      amount: "",
      detail: ""
    })
  }

  // ================= SUBMIT =================

  const handleSubmit = async () => {


    if (
      !form.id_branch ||
      !form.id_type_pay ||
      !form.id_team ||
      !form.amount ||
      !form.detail 
    ) {
      setMessage("Todos los campos son obligatorios")
      setMessageType("error")
      return
    }

    const payload = {
      id_type_transaction: 9,
      id_branch: Number(form.id_branch),
      id_team: form.id_team,
      id_cuenta: requireBank ? Number(form.id_cuenta) : null, 
      id_type_pay: Number(form.id_type_pay),
      amount: Number(form.amount),
      detail: form.detail,
      id_status: 2
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
    handleExport()
  }

  // 

  // Filtro del buscador

  const filtered = transaction.filter((p) =>
    `${p.id_team?.name || ""} ${p.id_branch?.name_branch || ""}
     ${p.id_cuenta?.banco || ""} ${p.detail || ""} ${p.amount}
     ${p.id_cuenta?.titular || ""} ${p.id_cuenta?.numero_cta || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // Export PDF

  const exportToExcel = () => {
    if (filtered.length === 0) {
      setMessage("No hay datos para exportar")
      setMessageType("error")
      return
    }

    const dataExport = filtered.map((p) => ({
      ID: p.id,
      Sucursal: p.id_branch?.name_branch,
      Personal: p.id_team?.name || "",
      T_Pago: p.id_type_pay?.type_p,
      Banco: p.id_cuenta?.banco,
      N_Cuenta: p.id_cuenta?.numero_cta,
      Titular: p.id_cuenta?.titular,
      Monto: p.amount,
      Detalle: p.detail
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "HisMemos")
    XLSX.writeFile(workbook, "Historial_Memos_Sanciones.xlsx")
  }

  const exportToPDF = () => {
    if (filtered.length === 0) {
      setMessage("No hay datos para exportar")
      setMessageType("error")
      return
    }

    const doc = new jsPDF()

    doc.text("Historial de Memos y Sanciones", 14, 10)

    const tableRows = filtered.map((p) => ([
      p.id,
      p.id_branch?.name_branch,
      p.id_team?.name || "",
      p.id_type_pay?.type_p,
      p.id_cuenta?.banco,
      p.id_cuenta?.numero_cta,
      p.id_cuenta?.titular,
      p.amount,
      p.detail
    ]))

    autoTable(doc, {
      head: [["ID","SUCURSAL", "PERSONAL", "T.PAGO",  "BANCO","N° CUENTA","TITULAR","MONTO","DETALLE"]],
      body: tableRows,
      startY: 20
    })

    doc.save("HistorialMemosSanciones.pdf")
  }

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl italic font-bold">
          COBRO MEMORANDUMS Y SANCIONES
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

          <button onClick={exportToPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded">
            <FileText size={18}/>
            PDF
          </button>

          <button onClick={exportToExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded">
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
      <MemosTable data={filtered} onView={handleExport} />

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

         <div className="bg-white p-6 rounded-lg w-200 border-2 border-black" >

            {message && (
              <div className={`mb-4 p-2 rounded text-white ${
                messageType === "error" ? "bg-red-500" : "bg-green-500"
              }`}>
                {message}
              </div>
            )}

            <h2 className="text-xl font-bold italic mb-3">
              {mode === "create" && "MEMO - SANCIONES"}
              {mode === "view" && "DETALLE DE LA SOLICITUD"}
            </h2>

            <div className="grid grid-cols-2 gap-2">

              <h3 className="text-blue-950 text-lg font-semibold italic">Sucursal</h3>
              <h3 className="text-blue-950 text-lg font-semibold italic">Personal</h3>             

              <select name="id_branch" value={form.id_branch} onChange={handleChange} disabled={mode==="view"} className="border p-2">
                <option value="">Seleccionar sucursal</option>
                {branches.map(b=>(
                  <option key={b.id} value={b.id}>{b.name_branch}</option>
                ))}
              </select>

              {/* 🔹 PERSONAL DEPENDIENTE */}
              <select name="id_team" value={form.id_team} onChange={handleChange} disabled={mode==="view"} className="border p-2">
                <option value="">Seleccionar Solicitante</option>
                {filteredPersonal.map(b=>(
                  <option key={b.ci} value={b.ci}>{b.name}</option>
                ))}
              </select>

              <h3 className="text-blue-950 text-lg font-semibold italic">Tipo de pago</h3>
              <h3 className="text-blue-950 text-lg font-semibold italic">Banco</h3>

              <select name="id_type_pay" value={form.id_type_pay} onChange={handleChange} disabled={mode==="view"} className="border p-2">
                <option value="">Seleccionar Tipo de pago</option>
                {tpago.map(b=>(
                  <option key={b.id} value={b.id}>{b.type_p}</option>
                ))}
              </select>

              {/* 🔹 BANCO DINÁMICO */}
              <select
                name="id_cuenta"
                value={form.id_cuenta}
                onChange={handleChange}
                disabled={mode==="view" || !requireBank}
                className="border p-2"
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.banco} - {c.numero_cta} - {c.titular}
                  </option>
                ))}
              </select>

              <h3 className="text-blue-950 text-lg font-semibold italic">Monto</h3>
              <h3 className="text-blue-950 text-lg font-semibold italic">Detalle</h3>

              <input name="amount" value={form.amount} onChange={handleChange} disabled={mode==="view"} className="border p-2"/>
              <input name="detail" value={form.detail} onChange={handleChange} disabled={mode==="view"} className="border p-2"/>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button onClick={()=>setOpenModal(false)} className="bg-red-400 text-white px-4 py-2 rounded">
                Cancelar
              </button>

              {mode !== "view" && (
                <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
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