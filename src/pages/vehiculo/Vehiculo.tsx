import { useState, useEffect } from "react"
import { useVehiculos } from "@/hooks/useVehiculos"
import { useForm } from "@/hooks/useForm"

import {
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
  checkDuplicateVehiculo
} from "@/services/vehiculoService"

import { DataTable } from "@/components/common/DataTable"
import VehiculoModal from "@/components/vehiculos/VehiculosModal"
import { getColumns } from "@/components/vehiculos/columns"

import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"
import { exportVehiculosToExcel } from "@/utils/export/excel/vehiculoExport"
import { exportVehiculosToPDF } from "@/utils/export/pdf/vehiculoExportpdf"


import type { Vehiculo } from "@/types/vehiculo"
import { useAuth } from "@/context/AuthContext"


export default function Vehiculo() {

  // 🔍 búsqueda
  const [search, setSearch] = useState("")
  const { filteredVehiculos } = useVehiculos(search)

  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selected, setSelected] = useState<Vehiculo | null>(null)

  // 🔹 mensajes
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")

    useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 2000)

    return () => clearTimeout(timer)
  }, [message])

  const confirm = useConfirm()
  const showToast = useToast()

  // 🔹 form
  const {
    form,
    handleChange,
    resetForm,
    setValues
  } = useForm({
    initialValues: {
      marca: "",
      name: "",
      modelo: "",
      cost: ""
    }
  })

  // 📌 Recuperamos datos de la sesion
  const { profile, user} = useAuth()

  // 📌 SUBMIT (SIN fetch → realtime)
  const handleSubmit = async () => {

    if (!form.marca || !form.name || !form.modelo || !form.cost) {
      setMessage("Todos los campos son obligatorios")
      setMessageType("error")
      return
    }

    try {

      if (mode === "create") {
        const result = await checkDuplicateVehiculo(form.name, form.modelo)

        if (result.exists) {
          setMessage("El vehiculo ya existe")
          setMessageType("error")
          return
        }
        if (result.inactive) {
          setMessage("El vehiculo ya existe pero esta en estado inactivo. Contacte a soporte técnico")
          setMessageType("error")
          return
        }

        await createVehiculo({
          ...form,
          cost: Number(form.cost)
        })
        setMessage("Guardado correctamente")
      }

      if (mode === "edit" && selected) {
        await updateVehiculo(selected.id, {
          marca: form.marca,
          name: form.name,
          modelo: form.modelo,
          cost: Number(form.cost)
        })
        setMessage("Actualizado correctamente")
      }

      setMessageType("success")

      // 🔥 SIN fetch → realtime actualiza

      setTimeout(() => {
        setOpen(false)
        resetForm()
        setSelected(null)
        setMode("create")
        setMessage("")
      }, 1200)

    } catch {
      setMessage("Error en proceso")
      setMessageType("error")
    }
  }

  // 📌 EDIT
  const handleEdit = (row: Vehiculo) => {
    setSelected(row)
    setMode("edit")
    setValues({ ...row, cost: String(row.cost) })
    setOpen(true)
  }

  // 📌 DELETE con confirm + toast (
  const handleDelete = (row: Vehiculo) => {

    confirm({
      title: "Eliminar",
      message: "¿Seguro que deseas eliminar este registro?",
      confirmText: "Eliminar",

      onConfirm: async () => {
        try {
          await deleteVehiculo(row.id)

          showToast("Proceso concluido con éxito ✅", "success")

          // 🔥 SIN fetch → realtime

        } catch {
          showToast("Error al eliminar", "error")
        }
      }
    })
  }

  // 📌 Exportar a Excel => reporte general del lo filtrado en la tabla que se muestra
  const handleExcel = () => {
    exportVehiculosToExcel(filteredVehiculos)
  } 

  // 📌 Exportar a PDF => reporte general de lo filtrado en la tabla que se muestra
const handlePDF = () => {

  const currentUser =
    profile?.name ||
    profile?.user ||
    user?.email ||
    "Sistema"

  exportVehiculosToPDF(filteredVehiculos, currentUser)
}

  const columns = getColumns(handleEdit, handleDelete)

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">

        <h2 className="text-xl font-bold italic">
          REGISTO DE VEHICULOS
        </h2>

        <div className="flex gap-3">

          <button
            onClick={() => {
              setMode("create")
              resetForm()
              setOpen(true)
            }}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            <Plus size={18}/> Nuevo
          </button>

          <button
            onClick={handlePDF}
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded"
          >
            <FileText size={18}/> PDF
          </button>

          <button
            onClick={handleExcel}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded"
          >
            <FileSpreadsheet size={18}/> Excel
          </button>         
        </div>   
      </div>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar..."
        className="border px-3 py-1 rounded mb-4 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLA */}
      <DataTable data={filteredVehiculos} columns={columns} />

      {/* MODAL */}
      <VehiculoModal
        open={open}
        mode={mode}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => setOpen(false)}
        message={message}
        messageType={messageType}
      />

    </div>
  )
}