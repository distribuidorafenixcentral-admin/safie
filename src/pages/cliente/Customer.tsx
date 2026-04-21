import { useState, useEffect } from "react"
import { useCustomers } from "@/hooks/useCustomers"
import { useForm } from "@/hooks/useForm"

import { DataTable } from "@/components/common/DataTable"
import { getColumns } from "@/components/sucursal/columns"

import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

import { checkDuplicateCustomer, createCustomer, deleteCustomer, updateCustomer } from "@/services/customerService"
import type { Customer } from "@/types/customer"
import { exportCustomersToPDF } from "@/utils/export/pdf/customerExportpdf"
import { exportCustomerToExcel } from "@/utils/export/excel/customerExport"
import CustomerModal from "@/components/customers/CustomerModal"



export default function Customer() {

  // 🔍 búsqueda
  const [search, setSearch] = useState("")
  const { filteredCustomers } = useCustomers(search)
  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selected, setSelected] = useState<Customer | null>(null)
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
      ci: "",
      name: "",
      celphone: "",
      ciudad: "",
      reference: "",
    }
  })

  // 📌 Recuperamos datos de la sesion
  const { profile, user} = useAuth()

  // 📌 SUBMIT (SIN fetch → realtime)
  const handleSubmit = async () => {

    if (!form.ci || !form.ciudad || !form.name || !form.celphone || !form.reference) {
      setMessage("Todos los campos son obligatorios")
      setMessageType("error")
      return
    }

    try {

      if (mode === "create") {
        const result = await checkDuplicateCustomer(form.ci)

        if (result) {
          setMessage("El cliente ya existe")
          setMessageType("error")
          return
        }

        await createCustomer(form)
        setMessage("Guardado correctamente")
      }

      if (mode === "edit" && selected) {
        await updateCustomer(selected.id, {
          name: form.name,
          celphone: form.celphone,
          ciudad: form.ciudad,
          reference: form.reference,
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
  const handleEdit = (row: Customer) => {
    setSelected(row)
    setMode("edit")
    setValues(row)
    setOpen(true)
  }

  // 📌 DELETE con confirm + toast (
  const handleDelete = (row: Customer) => {

    confirm({
      title: "Eliminar",
      message: "¿Seguro que deseas eliminar este registro?",
      confirmText: "Eliminar",

      onConfirm: async () => {
        try {
          await deleteCustomer(row.id)

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
    exportCustomerToExcel(filteredCustomers)
  } 

  // 📌 Exportar a PDF => reporte general de lo filtrado en la tabla que se muestra
const handlePDF = () => {

  const currentUser =
    profile?.name ||
    profile?.user ||
    user?.email ||
    "Sistema"

  exportCustomersToPDF(filteredCustomers, currentUser)
}

  const columns = getColumns(handleEdit, handleDelete)

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">

        <h2 className="text-xl font-bold italic">
          REGISTO DE CLIENTES
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
      <DataTable data={filteredCustomers} columns={columns} />

      {/* MODAL */}
      <CustomerModal
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