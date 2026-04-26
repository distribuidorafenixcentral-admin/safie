import { useState, useEffect } from "react"

import { useSolicitudes } from "@/hooks/useSolicitudes"
import { useForm } from "@/hooks/useForm"

import { DataTable } from "@/components/common/DataTable"
import { getColumnsSolicitudes } from "@/components/transactions/columnsSolicitudes"

import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"
import { useAuth } from "@/context/AuthContext"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"

import SolicitudModal from "@/components/transactions/SolicitudesModal"

import { exportSolicitudesToPDF } from "@/utils/export/pdf/solicitudExportpdf"
import { exportSolicitudesToExcel } from "@/utils/export/excel/solicitudesExport"

import { getBranches } from "@/services/branchService"
import { getEmployees } from "@/services/employeesService"

import type { SolicitudWithRelations } from "@/types/solicitudes"

type Branch = {
  id: number
  name_branch: string
}

type Employee = {
  id: number
  name: string
}


export default function Solicitudes() {

  // 🔍 búsqueda
  const [search, setSearch] = useState("")
  const {
    filteredSolicitudes,
     addSolicitud,
    editSolicitud,
    removeSolicitud 
  } = useSolicitudes(search)

  // 🔹 catálogos
  const [branches, setBranches] = useState<Branch[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])


  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selected, setSelected] = useState<SolicitudWithRelations | null>(null)

  // 🔹 mensajes
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")

  const confirm = useConfirm()
  const showToast = useToast()
  const { profile, user } = useAuth()

  // 🔹 form
  const {
    form,
    handleChange,
    resetForm,
    setValues
  } = useForm({
    initialValues: {
      id_type_transaction: "",
      id_branch: "",
      id_employee: "",
      amount: "",
      detail: ""
    }
  })

  // 🔥 cargar catálogos
  useEffect(() => {
    const fetchData = async () => {
      const b = await getBranches()
      const e = await getEmployees()

      setBranches(b)

      setEmployees(
        e.map((employee) => ({
          id: employee.id,
          name: employee.name ?? ""
        }))
      )
    }

    fetchData()
  }, [])

  // 🔥 limpiar mensajes
  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 2000)

    return () => clearTimeout(timer)
  }, [message])

  // 📌 SUBMIT
  const handleSubmit = async () => {

    if (
      !form.id_type_transaction ||
      !form.id_branch ||
      !form.id_employee ||
      !form.amount ||
      !form.detail
    ) {
      setMessage("Campos obligatorios incompletos")
      setMessageType("error")
      return
    }

    try {

      if (mode === "create") {

        await addSolicitud({
          id_type_transaction: Number(form.id_type_transaction),
          id_branch: Number(form.id_branch),
          id_employee: Number(form.id_employee),
          amount: Number(form.amount),
          detail: form.detail
        })

        setMessage("Solicitud registrada correctamente")
      }

      if (mode === "edit" && selected) {

        await editSolicitud(selected.id, {
          id_type_transaction: Number(form.id_type_transaction),
          id_branch: Number(form.id_branch),
          id_employee: Number(form.id_employee),
          amount: Number(form.amount),
          detail: form.detail
        })

        setMessage("Solicitud actualizada correctamente")
      }

      setMessageType("success")

      setTimeout(() => {
        setOpen(false)
        resetForm()
        setSelected(null)
        setMode("create")
      }, 1200)

    } catch {
      setMessage("Error en proceso")
      setMessageType("error")
    }
  }

  // 📌 EDIT
  const handleEdit = (row: SolicitudWithRelations) => {
    setSelected(row)
    setMode("edit")

    setValues({
      id_type_transaction: row.id_type_transaction ? String(row.id_type_transaction) : "",
      id_branch: row.id_branch ? String(row.id_branch) : "",
      id_employee: row.id_employee ? String(row.id_employee) : "",
      amount: row.amount ? String(row.amount) : "",
      detail: row.detail || ""
    })

    setOpen(true)
  }

  // 📌 DELETE
  const handleDelete = (row: SolicitudWithRelations) => {

    confirm({
      title: "Eliminar",
      message: "¿Seguro que deseas eliminar esta solicitud?",
      confirmText: "Confirmar",

      onConfirm: async () => {
        try {
          await removeSolicitud(row.id)
          showToast("Solicitud eliminada ✅", "success")
        } catch {
          showToast("Error en proceso", "error")
        }
      }
    })
  }

  // 📌 EXPORTACIONES
  const handleExcel = () => {
    exportSolicitudesToExcel(filteredSolicitudes)
  }

  const handlePDF = () => {

    const currentUser =
      profile?.name ||
      profile?.user ||
      user?.email ||
      "Sistema"

    exportSolicitudesToPDF(filteredSolicitudes, currentUser)
  }

  const columns = getColumnsSolicitudes(handleEdit, handleDelete)

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">

        <h2 className="text-xl font-bold italic">
          REGISTRO DE SOLICITUDES
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

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar solicitud..."
        className="border px-3 py-1 rounded mb-4 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLA */}
      <DataTable data={filteredSolicitudes} columns={columns} />

      {/* MODAL */}
      <SolicitudModal
        open={open}
        mode={mode}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => setOpen(false)}
        message={message}
        messageType={messageType}
        branches={branches}
        employees={employees}
      />

    </div>
  )
}