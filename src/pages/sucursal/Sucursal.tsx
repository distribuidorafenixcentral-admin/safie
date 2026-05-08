import { useState, useEffect } from "react"
import { useBranches } from "@/hooks/useBranches"
import { useForm } from "@/hooks/useForm"

import {
  createBranch,
  updateBranch,
  deleteBranch,
  checkDuplicateBranch
} from "@/services/branchService"

import { DataTable } from "@/components/common/DataTable"
import SucursalModal from "@/components/sucursal/SucursalModal"
import { getColumns } from "@/components/sucursal/columns"

import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"
import { exportBranchesToExcel } from "@/utils/export/excel/branchExport"
import { exportBranchesToPDF } from "@/utils/export/pdf/branchExportpdf"

import type { Branch } from "@/types/branch"
import { useAuth } from "@/context/AuthContext"


export default function Sucursal() {

  // 🔍 búsqueda
  const [search, setSearch] = useState("")
  const { filteredBranches } = useBranches(search)

  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selected, setSelected] = useState<Branch | null>(null)

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
      name_branch: "",
      adress_branch: ""
    }
  })

  // 📌 Recuperamos datos de la sesion
  const { profile, user} = useAuth()

  // 📌 SUBMIT (SIN fetch → realtime)
  const handleSubmit = async () => {

    if (!form.name_branch || !form.adress_branch) {
      setMessage("Registre todos los campos, son obligatorios")
      setMessageType("error")
      return
    }

    try {

      if (mode === "create") {
        const result = await checkDuplicateBranch(form.name_branch)

        if (result.exists) {
          setMessage("La sucursal ya existe, consulte su estado con soporte técnico")
          setMessageType("error")
          return
        }
        if (result.inactive) {
          setMessage("La sucursal ya existe pero esta en estado inactivo. Contacte a soporte técnico")
          setMessageType("error")
          return
        }

        await createBranch(form)
        setMessage("Sucursal registrada con éxito")
      }

      if (mode === "edit" && selected) {
        await updateBranch(selected.id, {
          adress_branch: form.adress_branch
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
      }, 2200)

    } catch {
      setMessage("Error en proceso")
      setMessageType("error")
    }
  }

  // 📌 EDIT
  const handleEdit = (row: Branch) => {
    setSelected(row)
    setMode("edit")
    setValues(row)
    setOpen(true)
  }

  // 📌 DELETE con confirm + toast (
  const handleDelete = (row: Branch) => {

    confirm({
      title: "Eliminar",
      message: "¿Seguro que deseas eliminar este registro?",
      confirmText: "Eliminar",

      onConfirm: async () => {
        try {
          await deleteBranch(row.id)

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
    exportBranchesToExcel(filteredBranches)
  } 

  // 📌 Exportar a PDF => reporte general de lo filtrado en la tabla que se muestra
const handlePDF = () => {

  const currentUser =
    profile?.name ||
    profile?.user ||
    user?.email ||
    "Sistema"

  exportBranchesToPDF(filteredBranches, currentUser)
}

  const columns = getColumns(handleEdit, handleDelete)

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">

        <h2 className="text-xl font-bold italic">
          REGISTO DE SUCURSAL
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
      <DataTable data={filteredBranches} columns={columns} />

      {/* MODAL */}
      <SucursalModal
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