import { useState, useEffect } from "react"
import { useMemos } from "@/hooks/useMemos"
import { useForm } from "@/hooks/useForm"

import { DataTable } from "@/components/common/DataTable"
import { getColumnsMemos } from "@/components/transactions/columnsMemos"

import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"
import { useAuth } from "@/context/AuthContext"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"
import MemosModal from "@/components/transactions/MemosModal"

import { exportMemosToPDF } from "@/utils/export/pdf/memosxportpdf"
import { exportMemosToExcel } from "@/utils/export/excel/memosExport"

import { getBranches } from "@/services/branchService"
import { getEmployees } from "@/services/employeesService"
import { getStatusTransactions } from "@/services/statustransactions"

import type { MemosWithRelations } from "@/types/memos"

type Branch = { id: number; name_branch: string }
type Employee = { id: number; name: string }
type Estado = { id: number; status: string }

export default function Memos() {

  const [search, setSearch] = useState("")

  const {
    filteredMemos,
    addMemos,
    editMemos,
    removeMemos
  } = useMemos(search)

  const [branches, setBranches] = useState<Branch[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [statusTransaction, setStatusTransaction] = useState<Estado[]>([])

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selected, setSelected] = useState<MemosWithRelations | null>(null)

  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")

  const confirm = useConfirm()
  const showToast = useToast()
  const { profile, user } = useAuth()

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
      detail: "",
      id_status: ""
    }
  })

  // 🔥 catálogos
useEffect(() => {
  const fetchData = async () => {
    const b = await getBranches()
    console.log("BRANCHES RAW:", b)

    const e = await getEmployees()
    console.log("EMPLOYEES RAW:", e)

    const d = await getStatusTransactions()
    console.log("STATUS RAW:", d)

    setBranches(b)

    const mappedEmployees = e.map(emp => ({
      id: emp.id,
      name: emp.name ?? ""
    }))
    console.log("EMPLOYEES MAPPED:", mappedEmployees)

    setEmployees(mappedEmployees)

    const mappedStatus = (d || []).map(s => ({
      id: s.id,
      status: s.status ?? ""
    }))
    console.log("STATUS MAPPED:", mappedStatus)

    setStatusTransaction(mappedStatus)
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
      !form.id_branch ||
      !form.id_employee ||
      !form.amount ||
      !form.detail ||
      !form.id_status
    ) {
      setMessage("Campos obligatorios incompletos")
      setMessageType("error")
      return
    }

    try {

      if (mode === "create") {
        await addMemos({
          id_branch: Number(form.id_branch),
          id_employee: Number(form.id_employee),
          amount: Number(form.amount),
          detail: form.detail,
          id_status: Number(form.id_status)
        })

        setMessage("Sanción registrada correctamente")
      }

      if (mode === "edit" && selected) {
        await editMemos(selected.id, {
          amount: Number(form.amount),
          id_status: Number(form.id_status)
        })

        setMessage("Sanción actualizada correctamente")
      }

      setMessageType("success")

      setTimeout(() => {
        setOpen(false)
        resetForm()
        setSelected(null)
        setMode("create")
      }, 1200)

    } catch (error: any) {
      setMessage(error.message || "Error en proceso")
      setMessageType("error")
    }
  }

  // 📌 EDIT
  const handleEdit = (row: MemosWithRelations) => {
    setSelected(row)
    setMode("edit")

    setValues({
      id_type_transaction: String(row.id_type_transaction),
      id_branch: String(row.id_branch),
      id_employee: String(row.id_employee),
      amount: String(row.amount),
      detail: row.detail || "",
      id_status: String(row.id_status)
    })

    setOpen(true)
  }

  // 📌 DELETE
  const handleDelete = (row: MemosWithRelations) => {
    confirm({
      title: "Eliminar",
      message: "¿Seguro que deseas eliminar esta sancion?",
      confirmText: "Confirmar",
      onConfirm: async () => {
        try {
          await removeMemos(row.id)
          showToast("Solicitud eliminada ✅", "success")
        } catch {
          showToast("Error en proceso", "error")
        }
      }
    })
  }

  // 📌 EXPORT
  const handleExcel = () => {
    exportMemosToExcel(filteredMemos)
  }

  const handlePDF = () => {
    const currentUser =
      profile?.name ||
      profile?.user ||
      user?.email ||
      "Sistema"

    exportMemosToPDF(filteredMemos, currentUser)
  }

  const columns = getColumnsMemos(handleEdit, handleDelete)

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">

        <h2 className="text-xl font-bold italic">
          COBRO DE MEMOS Y SANCIONES 
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
      <DataTable data={filteredMemos} columns={columns} />

      {/* MODAL */}
      <MemosModal
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
        status_transaction={statusTransaction}
        isPaid={selected?.id_status === 2} // 🔥 CLAVE
      />

    </div>
  )
}