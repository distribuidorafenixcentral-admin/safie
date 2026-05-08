// imports generales
import { useState, useEffect } from "react"
import { useForm } from "@/hooks/useForm"
import { DataTable } from "@/components/common/DataTable"
import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"
import { useAuth } from "@/context/AuthContext"
import { Plus, FileText, FileSpreadsheet } from "lucide-react"

// imports módulo
import { useSoldepo } from "@/hooks/useSoldepo"
import { getColumnsSoldepo } from "@/components/transactions/columnsSoldelpo" // 👈 Corregido typo en la ruta
import SoldepoModal from "@/components/transactions/SoldepoModal"
import { exportSoldepoToExcel } from "@/utils/export/excel/soldepoExport"
import { exportSoldepoToPDF } from "@/utils/export/pdf/soldepoExportpdf"

// imports relaciones
import { getBranches } from "@/services/branchService"
import { getEmployees } from "@/services/employeesService"
import { getCustomer } from "@/services/customerService"
import { getVehiculos } from "@/services/vehiculoService"

import type { SoldepoWithRelations } from "@/types/soldepo"

type Branch = {
  id: number
  name_branch: string
}

type Employee = {
  id: number
  name: string
  id_branch?: number | null // 👈 Requerido para el filtrado reactivo del modal
}

type Customer = {
  id: number
  name: string
}

type Car = {
  id: number
  name: string
  cost: number
  modelo: string
  marca: string
}

interface SoldepoFormState {
  id_branch: string
  id_employee: string
  id_car: string
  id_customer: string
  costo: string
  amount: string
  detail: string
  type_sale: string
  type_pay: string
}

export default function Soldepo() {
  const { profile, user, loading: authLoading } = useAuth() // 👈 Se extrae 'user' y 'loading' correctamente

  // 🔍 Búsqueda y conexión al Hook con parámetros de privacidad (Rol y Sucursal)
  const [search, setSearch] = useState("")
  const {
    filteredSoldepo,
    addSoldepo,
    editSoldepo,
    removeSoldepo
  } = useSoldepo(search, profile?.id_role, profile?.id_branch ?? undefined) // 👈 Inyectadas restricciones por rol

  // 🔹 Catálogos
  const [branches, setBranches] = useState<Branch[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cars, setCars] = useState<Car[]>([])

  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selected, setSelected] = useState<SoldepoWithRelations | null>(null)

  // 🔹 Mensajes
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")

  const confirm = useConfirm()
  const showToast = useToast()

  // 🔹 Formulario tipado estructurado
  const {
    form,
    handleChange,
    resetForm,
    setValues
  } = useForm<SoldepoFormState>({
    initialValues: {
      id_branch: "",
      id_employee: "",
      id_car: "",
      id_customer: "",
      costo: "",
      amount: "",
      detail: "",
      type_sale: "",
      type_pay: ""
    }
  })

  // 🔥 Cargar catálogos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const b = await getBranches()
        const e = await getEmployees()
        const c = await getCustomer()
        const a = await getVehiculos()

        setBranches(b)

        setEmployees(
          e.map(employee => ({
            id: employee.id,
            name: employee.name ?? "",
            id_branch: employee.id_branch // 👈 Mapeo de id_branch indispensable corregido
          }))
        )

        setCustomers(
          c.map(customer => ({
            id: customer.id,
            name: customer.name ?? ""
          }))
        )

        setCars(
          a.map(car => ({
            id: car.id,
            name: car.name ?? "",
            cost: car.cost ?? 0,
            modelo: car.modelo ?? "",
            marca: car.marca ?? ""
          }))
        )

      } catch (error) {
        console.error("Error cargando catálogos:", error)
      }
    }

    fetchData()
  }, [])

  // 🚗 Autocompletar costo de catálogo al seleccionar vehículo
  useEffect(() => {
    if (!form.id_car) return

    const selectedCar = cars.find(
      car => car.id === Number(form.id_car)
    )

    if (selectedCar) {
      setValues({
        ...form,
        costo: String(selectedCar.cost)
      })
    }
  }, [form.id_car, cars])

  // 🔥 Limpiar mensajes con temporizador de desvanecimiento
  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 2000)

    return () => clearTimeout(timer)
  }, [message])

  // ⏳ Detener el montaje gráfico si el perfil de usuario de Supabase se encuentra cargando
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 📌 Limpieza total y cierre seguro de flujos del Modal
  const handleCloseModal = () => {
    setOpen(false)
    resetForm()
    setSelected(null)
    setMode("create")
    setMessage("")
    setMessageType("")
  }

  // 📌 Apertura adaptativa de registros según el rol operativo
  const handleOpenCreate = () => {
    setMode("create")
    resetForm()
    
    // 🔒 Bloqueo UX: Auto-selecciona sucursal si el usuario es Rol 3
    if (profile?.id_role === 3 && profile?.id_branch) {
      setValues({
        id_branch: String(profile.id_branch),
        id_employee: "",
        id_car: "",
        id_customer: "",
        costo: "",
        amount: "",
        detail: "",
        type_sale: "",
        type_pay: ""
      })
    }
    setOpen(true)
  }

  // 📌 SUBMIT (Inserciones o Modificaciones estructuradas numéricamente)
  const handleSubmit = async () => {
    if (
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
      setMessage("La cuota inicial debe ser un número mayor a 0")
      setMessageType("error")
      return
    }

    try {
      const payload = {
        id_branch: Number(form.id_branch),
        id_employee: Number(form.id_employee),
        id_car: form.id_car ? Number(form.id_car) : null,
        id_customer: form.id_customer ? Number(form.id_customer) : null,
        costo: form.costo ? Number(form.costo) : null,
        amount: parsedAmount,
        detail: form.detail.trim(),
        type_sale: form.type_sale || null,
        type_pay: form.type_pay || null
      }

      if (mode === "create") {
        await addSoldepo(payload)
        setMessage("Solicitud registrada correctamente")
      }

      if (mode === "edit" && selected) {
        await editSoldepo(selected.id, payload)
        setMessage("Solicitud actualizada correctamente")
      }

      setMessageType("success")

      setTimeout(() => {
        handleCloseModal()
      }, 1200)

    } catch (error) {
      console.error(error)
      setMessage("Error en proceso")
      setMessageType("error")
    }
  }

  // 📌 EDITAR
  const handleEdit = (row: SoldepoWithRelations) => {
    setSelected(row)
    setMode("edit")

    setValues({
      id_branch: row.id_branch ? String(row.id_branch) : "",
      id_employee: row.id_employee ? String(row.id_employee) : "",
      id_car: row.id_car ? String(row.id_car) : "",
      id_customer: row.id_customer ? String(row.id_customer) : "",
      costo: row.costo ? String(row.costo) : "",
      amount: row.amount ? String(row.amount) : "",
      detail: row.detail || "",
      type_sale: row.type_sale || "",
      type_pay: row.type_pay || ""
    })

    setOpen(true)
  }

  // 📌 ELIMINAR
  const handleDelete = (row: SoldepoWithRelations) => {
    confirm({
      title: "Eliminar",
      message: "¿Seguro que deseas eliminar esta solicitud?",
      confirmText: "Confirmar",
      onConfirm: async () => {
        try {
          await removeSoldepo(row.id)
          showToast("Solicitud eliminada ✅", "success")
        } catch {
          showToast("Error en proceso", "error")
        }
      }
    })
  }

  // 📌 EXPORTACIONES
  const handleExcel = () => {
    exportSoldepoToExcel(filteredSoldepo, profile?.id_role) // 👈 Enviado el id_role para el filtrado interno
  }

  const handlePDF = () => {
    const currentUser = profile?.name || profile?.user || user?.email || "Sistema"
    exportSoldepoToPDF(filteredSoldepo, currentUser, profile?.id_role) // 👈 Enviado el id_role para el filtrado interno
  }

  const columns = getColumnsSoldepo(handleEdit, handleDelete)

  return (
    <div className="p-1">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold italic text-slate-800">
          REGISTRO DE SOLICITUDES DE DEPÓSITO
        </h2>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOpenCreate} // 👈 Vinculado al controlador de flujos por rol
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> Nuevo
          </button>

          <button
            onClick={handlePDF}
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <FileText size={18} /> PDF
          </button>

          <button
            onClick={handleExcel}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={18} /> Excel
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar solicitud por cliente, auto, detalle o monto..."
          className="border border-gray-300 px-3 py-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <DataTable data={filteredSoldepo} columns={columns} />

      {/* MODAL */}
      <SoldepoModal
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
        customers={customers}
        cars={cars}
        id_role={profile?.id_role} // 👈 Pasado el id_role para activar el bloqueo de sucursal
      />
    </div>
  )
}
