import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import SucursalTable from "@/pages/sucursal/SucursalTable"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"

import {Plus, FileText, FileSpreadsheet } from "lucide-react"

export default function Sucursal() {

  const [sucursal, setSucursal] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")
  const [mode, setMode] = useState<"create" | "view" | "edit">("create")
  const [selected, setSelected] = useState<any>(null)
  const confirm = useConfirm()
  const showToast = useToast()

  const [form, setForm] = useState({
    name_branch: "",
    adress_branch: "",
  })

  useEffect(() => {
    fetchSucursal()
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

    // Recuperamos los datos de la tabla Sucursales
    const fetchSucursal = async () => {
      const { data, error } = await supabase
      .from("branches")
      .select(`
        id,
        name_branch,
        adress_branch
      `)
      .order("id", { ascending: true})
      .neq("id", 1)
      .neq("status", 2)
    
      //muestra el error en caso que sea BD
      if(error) console.error(error)
        setSucursal(data || [])
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
      name_branch: "",
      adress_branch: ""
    })
  }

  // ENVIA LOS DATOS PARA GUARDAR EL REGISTRO
    const handleSubmit = async () => {
  
      // VALIDACIÓN DE CAMPOS VACIOS
      if (
        !form.name_branch ||
        !form.adress_branch
      ) {
        setMessage("Todos los campos son obligatorios")
        setMessageType("error")
        return
      }
  
      // VALIDAR DUPLICADO SOLO EN CREATE
      if (mode === "create") {
        const { data: existing } = await supabase
          .from("branches")
          .select("name_branch")
          .eq("name_branch", form.name_branch)
  
        if (existing && existing.length > 0) {
          setMessage("El nombre de la sucursal ya está registrado")
          setMessageType("error")
          return
        }
      }
  
      // CREATE
      if (mode === "create") {
        const { error } = await supabase
          .from("branches")
          .insert({
            name_branch: form.name_branch,
            adress_branch: form.adress_branch,
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
          .from("branches")
          .update({
            adress_branch: form.adress_branch,
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
  
      fetchSucursal()
    }

      //Editar el registro
      const handleEdit = (row:any) => {
        setSelected(row)
        setMode("edit")
        setForm({
          name_branch: row.name_branch || "",
          adress_branch: row.adress_branch || "",
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
              .from("branches")
              .update({ status: 2 })
              .eq("id", row.id)

            if (error) {
              showToast("Error al eliminar", "error")
            } else {
              showToast("Proceso concluido con éxito ✅", "success")
              fetchSucursal()
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
          NOMBRE: p.name_branch,
          Nombre: p.adress_branch
        }))
    
        const worksheet = XLSX.utils.json_to_sheet(dataExport)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sucursal")
        XLSX.writeFile(workbook, "ListaSucursales.xlsx")
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
        doc.text("Reporte de Sucurdsales", 14, 10)
    
        // Columnas
        const tableColumn = [
          "ID",
          "NOMBRE SUCURSAL",
          "DIRECCION"
        ]
    
        // Filas
        const tableRows = filtered.map((p) => ([
          p.id,
          p.name_branch,
          p.adress_branch
        ]))
    
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 20
        })
        doc.save("ListaSucursales.pdf")
      }
      const filtered = sucursal.filter((p) =>
        p.name_branch?.toLowerCase().includes(search.toLowerCase())
      )

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          REGISTO DE SUCURSAL
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
      <SucursalTable
        data={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-200 border-2 border-black" >

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

            <h2 className="text-xl font-bold mb-4 italic">
              {mode === "create" && "REGISTRO DE NUEVA SUCURSAL"}
              {mode === "edit" && "EDITAR REGISTRO"}
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <h3>Nombre de Sucursal</h3>
              <h3>Dirección</h3>
              <input name="name_branch" value={form.name_branch} onChange={handleChange} disabled={mode !== "create"} placeholder="nombre de la sucursal" className="border p-2"/>
            
              <input name="adress_branch" value={form.adress_branch} onChange={handleChange} placeholder="Dirección" className="border p-2"/>
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