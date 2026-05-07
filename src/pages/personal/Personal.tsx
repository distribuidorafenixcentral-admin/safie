import { useState, useEffect } from "react"

import { useEmployees } from "@/hooks/useEmployees"
import { useForm } from "@/hooks/useForm"

import { DataTable } from "@/components/common/DataTable"
import { getColumnsEmployees } from "@/components/employees/columns"

import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"
import { useAuth } from "@/context/AuthContext"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"

import EmployeeModal from "@/components/employees/EmployeesModal"

import { exportEmployeesToPDF } from "@/utils/export/pdf/employeesExportpdf"
import { exportEmployeesToExcel } from "@/utils/export/excel/employeesExport"

import { getBranches } from "@/services/branchService"
import { getRoles } from "@/services/roleService"

import type { EmployeeWithRelations } from "@/types/employees"

type Branch = {
  id: number
  name_branch: string
}

type Role = {
  id: number
  role: string
}

export default function Employees() {

  // 🔍 búsqueda
  const [search, setSearch] = useState("")
  const { filteredEmployees, addEmployee, editEmployee, removeEmployee } = useEmployees(search)

  // 🔹 catálogos
  const [branches, setBranches] = useState<Branch[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selected, setSelected] = useState<EmployeeWithRelations | null>(null)

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
      ci: "",
      name: "",
      celphone: "",
      start_date: "",
      id_branch: "",
      id_role: "",
      reference: "",
      celphone_ref: ""
    }
  })

  // 🔥 cargar catálogos
  useEffect(() => {
    const fetchData = async () => {
      const b = await getBranches()
      const r = await getRoles()

      setBranches(b)
      setRoles(r)
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

    if (!form.ci || !form.name || !form.id_branch || !form.id_role) {
      setMessage("Campos obligatorios incompletos")
      setMessageType("error")
      return
    }

    try {

      if (mode === "create") {

        await addEmployee(
          {
            ci: form.ci,
            name: form.name,
            celphone: form.celphone,
            start_date: form.start_date || null,

            id_branch: form.id_branch ? Number(form.id_branch) : null,
            id_role: form.id_role ? Number(form.id_role) : null,

            reference: form.reference || null,
            celphone_ref: form.celphone_ref || null,

            status: 3,
            
          }
        )

        setMessage("Registrado correctamente")
      }

      if (mode === "edit" && selected) {

        await editEmployee(selected.id, {
          name: form.name,
          celphone: form.celphone,
          id_branch: Number(form.id_branch),
          id_role: Number(form.id_role),
          reference: form.reference,
          celphone_ref: form.celphone_ref
        })

        setMessage("Actualizado correctamente")
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
  const handleEdit = (row: EmployeeWithRelations) => {
    setSelected(row)
    setMode("edit")

    setValues({
      ci: row.ci || "",
      name: row.name || "",
      celphone: row.celphone || "",
      start_date: row.start_date || "",

      id_branch: row.id_branch ? String(row.id_branch) : "",
      id_role: row.id_role ? String(row.id_role) : "",

      reference: row.reference || "",
      celphone_ref: row.celphone_ref || ""
    })

    setOpen(true)
  }

  // 📌 DELETE
  const handleDelete = (row: EmployeeWithRelations) => {

    confirm({
      title: "Desactivar",
      message: "¿Seguro que deseas desactivar este empleado?",
      confirmText: "Confirmar",

      onConfirm: async () => {
        try {
          await removeEmployee(row.id)
          showToast("Empleado desactivado ✅", "success")
        } catch {
          showToast("Error en proceso", "error")
        }
      }
    })
  }

  // 📌 EXPORTACIONES
  const handleExcel = () => {
    exportEmployeesToExcel(filteredEmployees)
  }

  const handlePDF = () => {

    const currentUser =
      profile?.name ||
      profile?.user ||
      user?.email ||
      "Sistema"

    exportEmployeesToPDF(filteredEmployees, currentUser)
  }

  const columns = getColumnsEmployees(handleEdit, handleDelete)

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">

        <h2 className="text-xl font-bold italic">
          REGISTRO DE PERSONAL
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
        placeholder="Buscar empleado..."
        className="border px-3 py-1 rounded mb-4 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLA */}
      <DataTable data={filteredEmployees} columns={columns} />

      {/* MODAL */}
      <EmployeeModal
        open={open}
        mode={mode}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => setOpen(false)}
        message={message}
        messageType={messageType}
        branches={branches}
        roles={roles}
      />

    </div>
  )
}