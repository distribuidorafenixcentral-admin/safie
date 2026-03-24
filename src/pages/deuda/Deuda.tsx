import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import DeudaTable from "./DeudaTable"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { FileText, FileSpreadsheet, } from "lucide-react"

export default function Deuda() {

  // tabla principal
  const [transaction, setTransaction] = useState<any[]>([])
  // tablas referenciales
  const [branches, setBranches] = useState<any[]>([])
  const [personal, setPersonal] = useState<any[]>([])
  // funcionales  
  const [search, setSearch] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [selected, setSelected] = useState<any>(null)

  //formualario
  const [form, setForm] = useState({
    id_branch: "",
    id_team: "",    
    amount: "",
    detail: "",
    amortizado:"" ,
    saldo:"" 
  })

  useEffect(() => {
    fetchTransaction()
    fetchPersonal()
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

  // FETCH

  // Fetch Principal
  const fetchTransaction = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        id_type_transaction (id, description),
        id_branch (id, name_branch),
        id_team (ci, name),
        id_type_sale (id, atype),
        id_type_pay (id, type_p),
        id_customer (ci, name),
        id_car (id, name, cost),
        amount,
        c_inicial,
        detail,
        id_status (id, status)
      `)
      .order("id", { ascending: false })
      .eq("id_status", 1)
      .eq("id_type_transaction", 10)

    if (error) console.error(error)
      
    setTransaction(data || [])
  }

  // Fetch tabla team => personal
  const fetchPersonal = async () => {
    const { data, error } = await supabase
      .from("team")
      .select("ci, name")
      .order("name")

    if (error) console.error(error)
    setPersonal(data || [])
  }

  // Fetch tabla sucursales
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

  // Submit
  const handleSubmit = async () => {

    // Control de campos vacios
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

    const payload = {
      id_branch: Number(form.id_branch),
      id_team: form.id_team,
      amount: Number(form.amount),
      detail: form.detail,
      id_type_transaction: 10,    
      id_status: 1
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
      setMode("edit")         
      setMessage("")
      setMessageType("")
    }, 1500)

    fetchTransaction()
  }

  // ================= ACCIONES =================



  // Se corrigen posibles cambios en el proceso del depósito
  const handleEdit = (row: any) => {
      setSelected(row)
      setMode("edit")

      setForm({
        id_branch: row.id_branch?.id || "",
        id_team: row.id_team?.ci || "",        
        amount: row.amount || "",
        detail: row.detail || "",
        amortizado: row.amortizado || "",
        saldo: row.saldo || ""     
      })

      setOpenModal(true)
    }


  // ================= EXPORT =================

  // Filtro asesor, sucursal, detalle, tipo de venta, tipo de pago, cliente
  const filtered = transaction.filter((p) =>
    `${p.id_team?.name || ""} ${p.id_branch?.name_branch || ""} ${p.id_customer?.name || ""} ${p.detail || ""} ${p.id_type_sale?.atype || ""} ${p.id_type_pay?.type_p || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  //Excel
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

  //PDF
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

  // Vista del archivo
  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl text-blue-800 font-bold italic">
         DEPÓSITOS
        </h2>

        <div className="flex gap-3">    
      
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
      <DeudaTable
        data={filtered}        
        onEdit={handleEdit}        
      />

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

            <h2 className="text-2xl font-bold mb-4 text-blue-800 italic">           
              {mode === "edit" && "DETALLE DE LA DEUDA"}
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <select name="id_branch" value={form.id_branch} onChange={handleChange} disabled={mode==="edit"} className="border p-2">
                <option value="">Seleccionar sucursal</option>
                {branches.map(b=>(
                  <option key={b.id} value={b.id}>{b.name_branch}</option>
                ))}
              </select>

              <select name="id_team" value={form.id_team} onChange={handleChange} disabled={mode==="edit"} className="border p-2">
                <option value="">Seleccionar Solicitante</option>
                {personal.map(b=>(
                  <option key={b.ci} value={b.ci}>{b.name}</option>
                ))}
              </select>          
              <input name="detail" value={form.detail} onChange={handleChange} disabled={mode==="edit"} placeholder="Detalle" className="border p-2"/>
              <br />
              <div className="flex gap-6">
              <input name="amount" value={form.amount} onChange={handleChange} disabled={mode==="edit"} placeholder="Monto" className="border p-2"/>
              
              <input name="amortizado" value={form.amortizado} onChange={handleChange} disabled={mode==="view"} placeholder="Amotizado" className="border p-2"/>
              <input name="saldo" value={form.saldo} onChange={handleChange} disabled={mode==="view"} placeholder="Saldo" className="border p-2"/>
              </div>
             
            
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
                  Guardar Cambios
                </button>         
            </div>
          </div>
        </div>
      )}

    </div>
  )
}