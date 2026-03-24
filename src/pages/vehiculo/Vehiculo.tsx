import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {Plus, FileText, FileSpreadsheet } from "lucide-react"
import VehiculoTable from "./VehiculoTable"
import { useConfirm } from "@/context/ConfirmContext"
import { useToast} from "@/context/ToastContext"

export default function Vehiculo() {


  const [vehiculo, setVehiculo] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")
  const [mode, setMode] = useState<"create" | "view" | "edit">("create")
  const [selected, setSelected] = useState<any>(null)
  const confirm = useConfirm()
  const showToast = useToast()

  const [form, setForm] = useState({
    id_marca: "",
    name: "",
    modelo:"",
    cost:""
  })

  useEffect(() => {
      fetchVehiculo()
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

    
    // Recuperamos los datos de la tabla Vehiculos
    const fetchVehiculo = async () => {
      const { data, error } = await supabase
      .from("cars")
      .select(`
        id,
        id_marca,
        name,
        cost,
        modelo,
        status
      `)
      .neq("status", 2)
      .order("id", { ascending: true})     
  
    
      //muestra el error en caso que sea BD
      if(error) console.error(error)
        setVehiculo(data || [])
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
      id_marca: "",
      name: "",
      cost: "",
      modelo: ""
    })
  }

  // ENVIA LOS DATOS PARA GUARDAR EL REGISTRO
    const handleSubmit = async () => {
  
      // VALIDACIÓN DE CAMPOS VACIOS
      if (
        !form.id_marca ||
        !form.name ||
        !form.cost ||
        !form.modelo 
      ) {
        setMessage("Todos los campos son obligatorios")
        setMessageType("error")
        return
      }
  
      // CREATE
      if (mode === "create") {
        const { error } = await supabase
          .from("cars")
          .insert({
            id_marca: form.id_marca,
            name: form.name,
            cost: form.cost,
            modelo: form.modelo,            
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
          .from("cars")
          .update({
            id_marca: form.id_marca,
            name: form.name,
            cost: form.cost,
            modelo: form.modelo, 
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
  
      fetchVehiculo()
    }

      //Editar el registro
      const handleEdit = (row:any) => {
        setSelected(row)
        setMode("edit")
        setForm({           
          id_marca: row.id_marca || "",
          name: row.name || "",
          cost: row.cost || "",
          modelo: row.modelo
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
              .from("cars")
              .update({ status: 2 })
              .eq("id", row.id)

            if (error) {
              showToast("Error al eliminar", "error")
            } else {
              showToast("Proceso concluido con éxito ✅", "success")
              fetchVehiculo()
            }
          }
        })
      }

        // Filtro del buscador nombre del vehiculo
      const filtered = vehiculo.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())       
      )
    
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
          MARCA: p.id_marca,
          NOMBRE: p.name,
          MODELO: p.modelo,
          COSTO: p.cost         
        }))
    
        const worksheet = XLSX.utils.json_to_sheet(dataExport)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Vehiculos")
        XLSX.writeFile(workbook, "ListaVehiculos.xlsx")
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
        doc.text("Reporte de Vehiculos", 14, 10)
    
        // Columnas
        const tableColumn = [
          "ID",
          "MARCA",
          "VEHICULO",
          "MODELO",
          "COSTO"
        ]
    
        // Filas
        const tableRows = filtered.map((p) => ([
          p.id,
          p.id_marca,
          p.name,
          p.modelo,
          p.cost   
        ]))
    
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 20
        })
        doc.save("ListaVehiculos.pdf")
      }
      
     

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold italic">
          REGISTRO DE VEHICULOS
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
      <VehiculoTable
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
              {mode === "create" && "REGISTRO VEHICULO"}
              {mode === "edit" && "EDITAR REGISTRO"}
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <h3 className="text-blue-950 text-lg font-semibold italic">Marca</h3>
              <h3 className="text-blue-950 text-lg font-semibold italic">Vehículo</h3>
              <input name="id_marca" value={form.id_marca} onChange={handleChange} placeholder="marca" className="border p-2"/>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Vehículo" className="border p-2"/>
              <h3 className="text-blue-950 text-lg font-semibold italic">Modelo</h3>
              <h3 className="text-blue-950 text-lg font-semibold italic">Costo</h3>
              <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="Modelo" className="border p-2"/>
              <input name="cost" value={form.cost} onChange={handleChange} placeholder="costo" className="border p-2"/>
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