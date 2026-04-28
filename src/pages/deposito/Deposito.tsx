import { useState, useEffect } from "react"
import { useForm } from "@/hooks/useForm"

import { DataTable } from "@/components/common/DataTable"

import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"
import { useAuth } from "@/context/AuthContext"

import { FileText, FileSpreadsheet } from "lucide-react"

// 🔹 Hook módulo
import { useDepositos } from "@/hooks/useDepositos"

// 🔹 Columns
import { getColumnsDepositos } from "@/components/transactions/columnsDepositos"

// 🔹 Modal
import DepositosModal from "@/components/transactions/DepositoModal"

// 🔹 Export
import { exportDepositosToExcel } from "@/utils/export/excel/depositoExport"
import { exportDepositosToPDF } from "@/utils/export/pdf/depositoExportpdf"

// 🔹 Catálogos
import { getBranches } from "@/services/branchService"
import { getEmployees } from "@/services/employeesService"
import { getCustomer } from "@/services/customerService"
import { getVehiculos } from "@/services/vehiculoService"

import type {
  DepositoWithRelations,
  Deposito
} from "@/types/deposito"

type Branch = {
  id: number
  name_branch: string
}

type Employee = {
  id: number
  name: string
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

export default function Depositos() {

  // 🔍 búsqueda
  const [search, setSearch] = useState("")

  const {
    filteredDepositos,
    editDeposito,
    removeDeposito
  } = useDepositos(search)

  // 🔹 catálogos
  const [branches, setBranches] = useState<Branch[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cars, setCars] = useState<Car[]>([])

  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [selected, setSelected] =
    useState<DepositoWithRelations | null>(null)

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
      id_customer: "",
      id_car: "",
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
      const c = await getCustomer()
      const a = await getVehiculos()

      setBranches(b)

      setEmployees(
        e.map(emp => ({
          id: emp.id,
          name: emp.name ?? ""
        }))
      )

      setCustomers(
        c.map(cli => ({
          id: cli.id,
          name: cli.name ?? ""
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
  const handleView = (row: DepositoWithRelations) => {
    setSelected(row)

    setValues({
      id_branch: row.id_branch
        ? String(row.id_branch)
        : "",

      id_employee: row.id_employee
        ? String(row.id_employee)
        : "",

      id_customer: row.id_customer
        ? String(row.id_customer)
        : "",

      id_car: row.id_car
        ? String(row.id_car)
        : "",

      costo: row.costo
        ? String(row.costo)
        : "",

      amount: row.amount
        ? String(row.amount)
        : "",

      detail: row.detail || "",
      type_sale: row.type_sale || "",
      type_pay: row.type_pay || ""
    })

    setOpen(true)
  }

  // 📌 Confirmar depósito
  const handleConfirm = async () => {

    if (!selected) return

    try {
      await editDeposito(selected.id, {
        id_branch: Number(form.id_branch),
        id_employee: Number(form.id_employee),
        id_customer: form.id_customer
          ? Number(form.id_customer)
          : null,

        id_car: form.id_car
          ? Number(form.id_car)
          : null,

        costo: form.costo
          ? Number(form.costo)
          : null,

        amount: Number(form.amount),

        detail: form.detail,

        type_sale: form.type_sale || null,
        type_pay: form.type_pay || null
      })

      setMessage("Depósito confirmado correctamente")
      setMessageType("success")

      setTimeout(() => {
        setOpen(false)
        resetForm()
        setSelected(null)
      }, 1200)

    } catch {
      setMessage("Error al confirmar depósito")
      setMessageType("error")
    }
  }

  // 📌 Dar baja
  const handleDelete = (row: Deposito) => {
    confirm({
      title: "Dar de baja depósito",
      message:
        "¿Seguro que deseas dar de baja esta solicitud?",
      confirmText: "Confirmar",

      onConfirm: async () => {
        try {
          await removeDeposito(row.id)
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
    exportDepositosToExcel(filteredDepositos)
  }

  const handlePDF = () => {
    const currentUser =
      profile?.name ||
      profile?.user ||
      user?.email ||
      "Sistema"

    exportDepositosToPDF(
      filteredDepositos,
      currentUser
    )
  }

  // 📌 Columns
  const columns = getColumnsDepositos(
    handleView,
    handleDelete
  )

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">

        <h2 className="text-xl font-bold italic">
          CONFIRMACIÓN DE DEPÓSITO
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
        data={filteredDepositos}
        columns={columns}
      />

      {/* MODAL */}
      <DepositosModal
        open={open}
        form={form}
        onChange={handleChange}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
        message={message}
        messageType={messageType}
        branches={branches}
        employees={employees}
        customers={customers}
        cars={cars}
      />

    </div>
  )
}

