import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import SucursalTable from "@/pages/sucursal/SucursalTable"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"
import { Plus, FileText, FileSpreadsheet } from "lucide-react"
import { useRealtimeTable } from "@/hooks/UseRealTimeTable"

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

  const fetchSucursal = useCallback(async () => {
    const { data, error } = await supabase
      .from("branches")
      .select(`
        id,
        name_branch,
        adress_branch,
        status
      `)
      .order("id", { ascending: false })
      .neq("id", 1)
      .neq("status", 2)

    if (error) console.error(error)
    setSucursal(data || [])
  }, [])

  useEffect(() => {
    fetchSucursal()
  }, [fetchSucursal])

  // 🔥 REALTIME
  useRealtimeTable("branches", (payload: any) => {

    if (payload.eventType === "INSERT" && payload.new) {
      if (payload.new.status !== 2 && payload.new.id !== 1) {
        setSucursal((prev) => {
          const exists = prev.some(i => i.id === payload.new.id)
          if (exists) return prev
          return [payload.new, ...prev]
        })
      }
    }

    if (payload.eventType === "UPDATE" && payload.new) {

      if (payload.new.status === 2) {
        setSucursal((prev) =>
          prev.filter((item) => item.id !== payload.new.id)
        )
        return
      }

      setSucursal((prev) =>
        prev.map((item) =>
          item.id === payload.new.id ? payload.new : item
        )
      )
    }

    if (payload.eventType === "DELETE" && payload.old) {
      setSucursal((prev) =>
        prev.filter((item) => item.id !== payload.old.id)
      )
    }
  })

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

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setForm({
      name_branch: "",
      adress_branch: ""
    })
  }

  const handleSubmit = async () => {

    if (!form.name_branch || !form.adress_branch) {
      setMessage("Todos los campos son obligatorios")
      setMessageType("error")
      return
    }

    if (mode === "create") {
      const { data: existing } = await supabase
        .from("branches")
        .select("name_branch")
        .eq("name_branch", form.name_branch)

      if (existing && existing.length > 0) {
        setMessage("El nombre ya existe")
        setMessageType("error")
        return
      }

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

      setMessage("Guardado correctamente")
    }

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

      setMessage("Actualizado correctamente")
    }

    setMessageType("success")

    await fetchSucursal()

    setTimeout(() => {
      setOpenModal(false)
      resetForm()
      setSelected(null)
      setMode("create")
      setMessage("")
    }, 1500)
  }

  const handleEdit = (row: any) => {
    setSelected(row)
    setMode("edit")
    setForm({
      name_branch: row.name_branch || "",
      adress_branch: row.adress_branch || "",
    })
    setOpenModal(true)
  }

  const handleDelete = (row: any) => {
    confirm({
      title: "Eliminar",
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
          await fetchSucursal()
        }
      }
    })
  }

  const filtered = sucursal.filter((p) =>
    p.name_branch?.toLowerCase().includes(search.toLowerCase())
  )

  const exportToExcel = () => {
    if (filtered.length === 0) return

    const dataExport = filtered.map((p) => ({
      ID: p.id,
      NOMBRE: p.name_branch,
      DIRECCION: p.adress_branch
    }))

    const ws = XLSX.utils.json_to_sheet(dataExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sucursal")
    XLSX.writeFile(wb, "Sucursales.xlsx")
  }

  const exportToPDF = () => {
    if (filtered.length === 0) return

    const doc = new jsPDF()
    doc.text("Reporte de Sucursales", 14, 10)

    autoTable(doc, {
      head: [["ID", "NOMBRE", "DIRECCION"]],
      body: filtered.map((p) => [
        p.id,
        p.name_branch,
        p.adress_branch
      ])
    })

    doc.save("Sucursales.pdf")
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold italic">
          REGISTO DE SUCURSAL
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
            <Plus size={18}/> Nuevo
          </button>

          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded">
            <FileText size={18}/> PDF
          </button>

          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded">
            <FileSpreadsheet size={18}/> Excel
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar..."
        className="border px-3 py-2 rounded mb-6 w-full max-w-md"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />

      <SucursalTable
        data={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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

            <h2 className="text-xl font-bold mb-4 italic">
              {mode === "create" && "REGISTRO DE NUEVA SUCURSAL"}
              {mode === "edit" && "EDITAR REGISTRO"}
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <h3 className="text-blue-950 text-lg font-semibold italic">Nombre</h3>
              <h3 className="text-blue-950 text-lg font-semibold italic">Dirección</h3>

              <input name="name_branch" value={form.name_branch} onChange={handleChange} disabled={mode !== "create"} className="border p-2"/>
              <input name="adress_branch" value={form.adress_branch} onChange={handleChange} className="border p-2"/>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={()=>setOpenModal(false)} className="bg-red-400 text-white px-4 py-2 rounded">
                Cancelar
              </button>

              <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}