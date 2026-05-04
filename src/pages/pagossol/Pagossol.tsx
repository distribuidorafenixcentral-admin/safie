import { useState, useEffect } from "react"
import { useForm } from "@/hooks/useForm"

import { DataTable } from "@/components/common/DataTable"

import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"
import { useAuth } from "@/context/AuthContext"

import { FileText, FileSpreadsheet } from "lucide-react"

// 🔹 Hook módulo
import { usePagossol } from "@/hooks/usePagossol"

// 🔹 Columns
import { getColumnsPagossol } from "@/components/transactions/columnPagossol"

// 🔹 Modal
import PagossolModal from "@/components/transactions/PagossolModal"

// 🔹 Export
import { exportPagosToExcel } from "@/utils/export/excel/pagossolExport"
import { exportPagossolToPDF } from "@/utils/export/pdf/pagossolExportpdf"

// 🔹 Catálogos
import { getBranches } from "@/services/branchService"
import { getEmployees } from "@/services/employeesService"
import { getCuentas } from "@/services/cuentasService"

import type { PagosolWithRelations, Pagosol } from "@/types/pagosol"

type Branch = {
  id: number
  name_branch: string
}

type Employee = {
  id: number
  name: string
}

type Cuenta = {
  id: number
  numero_cta: string
  banco: string
  titular: string
  status: number
}

export default function Pagossol() {

  // 🔍 búsqueda
  const [search, setSearch] = useState("")

  const {
    filteredPagossol,
    editPagossol,
    removePagossol
  } = usePagossol(search)

  // 🔹 catálogos
  const [branches, setBranches] = useState<Branch[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [cuentas, setCuentas] = useState<Cuenta[]>([])

  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [selected, setSelected] =
    useState<PagosolWithRelations | null>(null)

  // 🔹 mensajes
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] =
    useState<"error" | "success" | "">("")

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
      id_branch: "",
      id_employee: "",
      id_cuenta: "",
      costo: "",
      amount: "",
      detail: "",
      type_sale: "",
      type_pay: ""
    }
  })

  // 🔥 cargar catálogos
  useEffect(() => {
    const fetchData = async () => {
      const b = await getBranches()
      const e = await getEmployees()
      const cuentasData = await getCuentas()

      setBranches(b)

      setEmployees(
        e.map(emp => ({
          id: emp.id,
          name: emp.name ?? ""
        }))
      )

      setCuentas(
        cuentasData.filter((c: any) => c.status === 1)
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

  // 📌 Ver detalle
  const handleView = (row: PagosolWithRelations) => {
    setSelected(row)

    setValues({
      id_branch: row.id_branch
        ? String(row.id_branch)
        : "",

      id_employee: row.id_employee
        ? String(row.id_employee)
        : "",

      id_cuenta: row.id_cuenta
        ? String(row.id_cuenta)
        : "",

      amount: row.amount
        ? String(row.amount)
        : "",

      detail: row.detail || "",
      type_pay: row.type_pay || ""
    })

    setOpen(true)
  }

  // 📌 Confirmar pago de la solicitud pendiente
  const handleConfirm = async () => {

    if (!selected) return

    // 🔒 Validación cuenta obligatoria
    if (
      (form.type_pay === "QR" ||
        form.type_pay === "Depósito en Cuenta") &&
      !form.id_cuenta
    ) {
      setMessage(
        "Debe seleccionar una cuenta para este tipo de pago"
      )
      setMessageType("error")
      return
    }

    try {
      await editPagossol(selected.id, {
        id_branch: Number(form.id_branch),

        id_employee: Number(form.id_employee),

        id_cuenta:
          form.type_pay === "Efectivo"
            ? null
            : form.id_cuenta
            ? Number(form.id_cuenta)
            : null,

        amount: Number(form.amount),

        detail: form.detail,
        type_pay: form.type_pay || null
      })

      setMessage("Pago confirmado correctamente")
      setMessageType("success")

      setTimeout(() => {
        setOpen(false)
        resetForm()
        setSelected(null)
      }, 1200)

    } catch {
      setMessage("Error al confirmar el pago")
      setMessageType("error")
    }
  }

  // 📌 Dar baja
  const handleDelete = (row: Pagosol) => {
    confirm({
      title: "Pago no autorizado",
      message:
        "¿Seguro que deseas dar de baja esta solicitud?",
      confirmText: "Confirmar",

      onConfirm: async () => {
        try {
          await removePagossol(row.id)

          showToast(
            "Solicitud dada de baja correctamente ✅",
            "success"
          )

        } catch {
          showToast(
            "Error en proceso",
            "error"
          )
        }
      }
    })
  }

// 📌 Exportaciones
  const handleExcel = () => {
    exportPagosToExcel(filteredPagossol)
  }

  const handlePDF = () => {
    const currentUser =
      profile?.name ||
      profile?.user ||
      user?.email ||
      "Sistema"

    exportPagossolToPDF(
      filteredPagossol,
      currentUser
    )
  } 

  // 📌 Columns
  const columns = getColumnsPagossol(
    handleView,
    handleDelete
  )

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">

        <h2 className="text-xl font-bold italic">
          CONFIRMACIÓN DE SOLICITUDES DE PAGO PENDIENTES
        </h2>

        <div className="flex gap-3">

          <button
            onClick={handlePDF}
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded"
          >
            <FileText size={18} />
            PDF
          </button>

          <button
            onClick={handleExcel}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

        </div>
      </div>

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar depósito..."
        className="border px-3 py-1 rounded mb-4 w-full max-w-md"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      {/* TABLA */}
      <DataTable
        data={filteredPagossol}
        columns={columns}
      />

      {/* MODAL */}
      <PagossolModal
        open={open}
        form={form}
        onChange={handleChange}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
        message={message}
        messageType={messageType}
        branches={branches}
        employees={employees}
        cuentas={cuentas}
      />

    </div>
  )
}