import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import ClienteTable from "./ClienteTable"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import {Plus, FileText, FileSpreadsheet } from "lucide-react"

export default function Cliente() {

  const [cliente, setCliente] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")
  const [mode, setMode] = useState<"create" | "view" | "edit">("create")
  const [selected, setSelected] = useState<any>(null)

  const [form, setForm] = useState({
    id: "",
    ci:"",
    name:"",
    celphone:"",
    reference: "",
    id_ciudad:"",
    status:""
  })

  useEffect(() => {
    fetchCliente()
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

    // Recuperamos los datos de la tabla Clientes
    const fetchCliente = async () => {
      const { data, error } = await supabase
      .from("customers")
      .select(`
        id,
        ci,
        name,
        celphone,
        reference,
        id_ciudad,
        status
      `)
      .order("id", { ascending: true})     
      .eq("status", 1)
    
      //muestra el error en caso que sea BD
      if(error) console.error(error)

        setCliente(data || [])
    }

  
   // Actualiza el formulario deforma dinamica
  const handleChange = (e:any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

    // Resetea el formulario 
  const resetForm = () => {
    setForm({     
      id:"",
      ci: "",
      name: "",
      celphone: "",
      reference: "",
      id_ciudad: "",
      status:""
    })
  }

  // ENVIA LOS DATOS PARA GUARDAR EL REGISTRO
    const handleSubmit = async () => {
  
      // VALIDACIÓN DE CAMPOS VACIOS
      if (
        !form.ci ||
        !form.name ||
        !form.celphone ||
        !form.reference ||
        !form.id_ciudad 
      ) {
        setMessage("Todos los campos son obligatorios")
        setMessageType("error")
        return
      }
  
      // VALIDAR DUPLICADO SOLO EN CREATE
      if (mode === "create") {
        const { data: existing } = await supabase
          .from("customers")
          .select("ci")
          .eq("ci", form.ci)
  
        if (existing && existing.length > 0) {
          setMessage("El cliente ya está registrado")
          setMessageType("error")
          return
        }
      }
  
      // CREATE
      if (mode === "create") {
        const { error } = await supabase
          .from("customers")
          .insert({
            ci: form.ci,
            name: form.name,
            celphone: form.celphone,
            reference: form.reference,
            id_ciudad: form.id_ciudad,
            status: 1
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
          .from("customers")
          .update({
            name: form.name,
            celphone: form.celphone,
            reference: form.reference,
            id_ciudad: form.id_ciudad
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
  
      fetchCliente()
    }

      //Editar el registro
      const handleEdit = (row:any) => {
        setSelected(row)
        setMode("edit")
        setForm({
          id: row.id || "",
          ci: row.ci || "",
          name: row.name || "",
          celphone: row.celphone || "",
          reference: row.reference || "",
          id_ciudad: row.id_ciudad || "",
          status: row.status || ""
        })
        setOpenModal(true)
      }
    
      // Eliminar el registro => cambia el status a 2
      const handleDelete = async (row:any) => {
        const confirmDelete = confirm("¿Eliminar este registro?")
        if (!confirmDelete) return
        const { error } = await supabase
          .from("customers")
          .update({ status: 2 })
          .eq("id", row.id)
    
        if (error) {
          setMessage("Error al eliminar")
          return
        }
        setMessage("Registro eliminado")
        fetchCliente()
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
          NOMBRE: p.name,
          CELULAR: p.celphone,
          REFERENCIA: p.reference,
          CIUDAD: p.id_ciudad
        }))
    
        const worksheet = XLSX.utils.json_to_sheet(dataExport)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes")
        XLSX.writeFile(workbook, "ListaClientes.xlsx")
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
        doc.text("Reporte de Clientes", 14, 10)
    
        // Columnas
        const tableColumn = [
          "ID",
          "CI",
          "NOMBRE",
          "CELULAR",
          "REFERENCIA",
          "CIUDAD"
        ]
    
        // Filas
        const tableRows = filtered.map((p) => ([
          p.id,
          p.ci,
          p.name,
          p.celphone,
          p.reference,
          p.id_ciudad
        ]))
    
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 20
        })
        doc.save("ListaClientes.pdf")
      }
      const filtered = cliente.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      )

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          REGISTO DE CLIENTE
        </h2>
        <div className="flex gap-3">
          {/* BOTON REGISTRO NUEVO*/}
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
        
          {/* BOTON EXCEL */}
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
      <ClienteTable
        data={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
              {mode === "create" && "REGISTRO DE CLIENTE"}
              {mode === "edit" && "EDITAR REGISTRO"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <input name="ci" value={form.ci} onChange={handleChange} placeholder="CI" className="border p-2"/>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="border p-2"/>
              <input name="celphone" value={form.celphone} onChange={handleChange}  placeholder="Celular" className="border p-2"/>
              <input name="reference" value={form.reference} onChange={handleChange} placeholder="Referencia" className="border p-2"/>
              <input name="id_ciudad" value={form.id_ciudad} onChange={handleChange}  placeholder="Ciudad" className="border p-2"/>
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