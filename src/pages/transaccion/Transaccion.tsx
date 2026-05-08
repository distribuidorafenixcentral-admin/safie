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

import type { SolicitudWithRelations, SolicitudInsert } from "@/types/solicitudes"

type Branch = {
  id: number
  name_branch: string
}

type Employee = {
  id: number
  name: string
}

interface SolicitudFormState {
  id_type_transaction: string
  id_branch: string
  id_employee: string
  amount: string
  detail: string
}

export default function Solicitudes() {
  const { profile, user, loading: authLoading } = useAuth()

  // 🔍 Búsqueda y conexión al Hook inyectando Rol y Sucursal (Control de Acceso)
  const [search, setSearch] = useState("")
  const {
    filteredSolicitudes,
    addSolicitud,
    editSolicitud,
    removeSolicitud 
  } = useSolicitudes(search, profile?.id_role, profile?.id_branch ?? undefined)

  // 🔹 Catálogos
  const [branches, setBranches] = useState<Branch[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selected, setSelected] = useState<SolicitudWithRelations | null>(null)

  // 🔹 Mensajes en pantalla
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")

  const confirm = useConfirm()
  const showToast = useToast()

  // 🔹 Estado interno del formulario
  const {
    form,
    handleChange,
    resetForm,
    setValues
  } = useForm<SolicitudFormState>({
    initialValues: {
      id_type_transaction: "",
      id_branch: "",
      id_employee: "",
      amount: "",
      detail: ""
    }
  })

  // 🔥 Cargar catálogos iniciales
  // 🔥 Cargar catálogos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const b = await getBranches()
        const e = await getEmployees()

        setBranches(b)
        setEmployees(
          e.map((employee) => ({
            id: employee.id,
            name: employee.name ?? "",
            id_branch: employee.id_branch // 👈 Asegúrate de mapear el id_branch que viene de tu servicio de empleados
          }))
        )
      } catch (error) {
        console.error("Error al cargar catálogos:", error)
      }
    }

    fetchData()
  }, [])


  // 🔥 Auto-limpieza de notificaciones flash
  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 2000)

    return () => clearTimeout(timer)
  }, [message])

  // ⏳ Esperar a que el contexto verifique el perfil en Supabase antes de pintar la UI
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 📌 Limpieza total y cierre del Modal
  const handleCloseModal = () => {
    setOpen(false)
    resetForm()
    setSelected(null)
    setMode("create")
    setMessage("")
    setMessageType("")
  }

  // 📌 Apertura adaptativa según el Rol asignado
  const handleOpenCreate = () => {
    setMode("create")
    resetForm()
    
    // 🔒 Si el usuario es de Rol 3, se asigna sucursal automáticamente en el Form
    if (profile?.id_role === 3 && profile?.id_branch) {
      setValues({
        id_type_transaction: "",
        id_branch: String(profile.id_branch),
        id_employee: "",
        amount: "",
        detail: ""
      })
    }
    
    setOpen(true)
  }

  // 📌 Procesar Formulario (Submit)
  const handleSubmit = async () => {
    if (
      !form.id_type_transaction.trim() ||
      !form.id_branch.trim() ||
      !form.id_employee.trim() ||
      !form.amount.trim() ||
      !form.detail.trim()
    ) {
      setMessage("Campos obligatorios incompletos")
      setMessageType("error")
      return
    }

    const parsedAmount = Number(form.amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage("El monto debe ser un número válido mayor a 0")
      setMessageType("error")
      return
    }

    const payload: SolicitudInsert = {
      id_type_transaction: Number(form.id_type_transaction),
      id_branch: Number(form.id_branch),
      id_employee: Number(form.id_employee),
      amount: parsedAmount,
      detail: form.detail.trim()
    }

    try {
      if (mode === "create") {
        await addSolicitud(payload)
        setMessage("Solicitud registrada correctamente")
      }

      if (mode === "edit" && selected) {
        await editSolicitud(selected.id, payload)
        setMessage("Solicitud actualizada correctamente")
      }

      setMessageType("success")

      setTimeout(() => {
        handleCloseModal()
      }, 1200)

    } catch (error) {
      setMessage("Error en proceso")
      setMessageType("error")
    }
  }

  // 📌 Editar Fila
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

  // 📌 Eliminar Fila
  const handleDelete = (row: SolicitudWithRelations) => {
    confirm({
      title: "Eliminar",
      message: "¿Seguro que deseas eliminar esta solicitud?",
      confirmText: "Confirmar",
      onConfirm: async () => {
        try {
          await removeSolicitud(row.id)
          showToast("Solicitud eliminada ✅", "success")
        } catch (error) {
          showToast("Error en proceso", "error")
        }
      }
    })
  }

  // 📌 Exportaciones
  // 📌 EXPORTACIONES
  const handleExcel = () => {
    // 👈 Pasamos el id_role como segundo parámetro para aplicar la regla dinámica
    exportSolicitudesToExcel(filteredSolicitudes, profile?.id_role)
  }


  // 📌 EXPORTACIONES
  const handlePDF = () => {
    const currentUser =
      profile?.name ||
      profile?.user ||
      user?.email ||
      "Sistema"

    // 👈 Pasamos el id_role como tercer parámetro para aplicar la regla dinámica
    exportSolicitudesToPDF(filteredSolicitudes, currentUser, profile?.id_role)
  }


  const columns = getColumnsSolicitudes(handleEdit, handleDelete)

  return (
    <div className="p-1">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold italic text-slate-800">
          REGISTRO DE SOLICITUDES
        </h2>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={18}/> Nuevo
          </button>

          <button
            onClick={handlePDF}
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <FileText size={18}/> PDF
          </button>

          <button
            onClick={handleExcel}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={18}/> Excel
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar solicitud por detalle, monto, sucursal o solicitante..."
          className="border border-gray-300 px-3 py-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <DataTable data={filteredSolicitudes} columns={columns} />

      {/* MODAL */}
         {/* MODAL */}
      <SolicitudModal
        open={open}
        mode={mode}
        form={form as any}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
        message={message}
        messageType={messageType}
        branches={branches}
        employees={employees}
        id_role={profile?.id_role} // 👈 Enviamos el rol actual al modal
      />

    </div>
  )
}
