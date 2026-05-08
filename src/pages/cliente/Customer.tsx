import { useState, useEffect } from "react"

import { useCustomers } from "@/hooks/useCustomers"
import { useForm } from "@/hooks/useForm"

import { DataTable } from "@/components/common/DataTable"
import { getColumnsCustomers } from "@/components/customers/columns"

import { useConfirm } from "@/context/ConfirmContext"
import { useToast } from "@/context/ToastContext"
import { useAuth } from "@/context/AuthContext"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"

import CustomerModal from "@/components/customers/CustomerModal"

import { getBranches } from "@/services/branchService"
import { createCustomer, updateCustomer, deleteCustomer } from "@/services/customerService"

import { exportCustomersToPDF } from "@/utils/export/pdf/customerExportpdf"
import { exportCustomerToExcel } from "@/utils/export/excel/customerExport"

import type { CustomerWithRelations } from "@/types/customer"

type Branch = {
  id: number
  name_branch: string
}

export default function Customers() {

  const [search, setSearch] = useState("")
  
  const { 
    filteredCustomers, 
    fetchCustomers,
    idRoleCurrentUser,
    idBranchCurrentUser
  } = useCustomers(search)

  const [branches, setBranches] = useState<Branch[]>([])
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selected, setSelected] = useState<CustomerWithRelations | null>(null)
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
      ci: "",
      name: "",
      celphone: "",
      reference: "",
      ciudad: "",
      id_branch: ""
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const b = await getBranches()
        setBranches(b)
      } catch (err) {
        console.error("Error al cargar sucursales:", err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 5000) // 5 segundos para que de tiempo a leer el mensaje largo de advertencia

    return () => clearTimeout(timer)
  }, [message])

  // 📌 SUBMIT
  const handleSubmit = async () => {
    const finalBranchId = idRoleCurrentUser === 3 ? String(idBranchCurrentUser) : form.id_branch

    if (!form.ci || !form.name || !finalBranchId || !form.ciudad) {
      setMessage("Campos obligatorios incompletos")
      setMessageType("error")
      return
    }

    try {
      let isCoincidence = false

      if (mode === "create") {
        const result = await createCustomer({
          ci: form.ci,
          name: form.name,
          celphone: form.celphone,
          reference: form.reference,
          ciudad: form.ciudad,
          id_branch: finalBranchId ? Number(finalBranchId) : null,
          status: 1
        })

        if (result.hasCoincidence) {
          isCoincidence = true
          setMessage(`El cliente ya existe en la sucursal "${result.originalBranch}". Por favor, consúltelo con Administración.`)
          setMessageType("error") // Banner rojo preventivo
        } else {
          setMessage("Cliente registrado correctamente")
          setMessageType("success") // Banner verde de éxito
        }
      }

      if (mode === "edit" && selected) {
        await updateCustomer(selected.id, {
          name: form.name,
          celphone: form.celphone,
          reference: form.reference,
          ciudad: form.ciudad,
          id_branch: Number(finalBranchId)
        })
        setMessage("Cliente actualizado correctamente")
        setMessageType("success")
      }

      // ⏱️ Si hay coincidencia, dejamos el modal abierto por 5 segundos para lectura. Si no, lo cerramos rápido.
      const delayTime = isCoincidence ? 5000 : 1200

      setTimeout(() => {
        setOpen(false)
        resetForm()
        setSelected(null)
        setMode("create")
        fetchCustomers()
      }, delayTime) // 🛠️ CORREGIDO: Añadidos el cierre del paréntesis y la llave del setTimeout que hacían falta

    } catch {
      setMessage("Error en proceso")
      setMessageType("error")
    }
  }

  const handleEdit = (row: CustomerWithRelations) => {
    setSelected(row)
    setMode("edit")

    setValues({
      ci: row.ci || "",
      name: row.name || "",
      celphone: row.celphone || "",
      reference: row.reference || "",
      ciudad: row.ciudad || "",
      id_branch: row.id_branch ? String(row.id_branch) : ""
    })

    setOpen(true)
  }

  const handleDelete = (row: CustomerWithRelations) => {
    confirm({
      title: "Dar de baja",
      message: "¿Seguro que deseas dar de baja a este cliente?",
      confirmText: "Confirmar",
      onConfirm: async () => {
        try {
          await deleteCustomer(row.id)
          showToast("Cliente dado de baja ✅", "success")
          fetchCustomers()
        } catch {
          showToast("Error en proceso", "error")
        }
      }
    })
  }

  const handleExcel = () => {
    exportCustomerToExcel(filteredCustomers, idRoleCurrentUser)
    showToast("Documento Excel generado 📊", "success")
  }

  const handlePDF = () => {
    const currentUser = profile?.name || profile?.user || user?.email || "Sistema"
    exportCustomersToPDF(filteredCustomers, currentUser, idRoleCurrentUser)
    showToast("Documento PDF generado 📄", "success")
  }

  const columns = getColumnsCustomers(handleEdit, handleDelete, idRoleCurrentUser)

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold italic">REGISTRO DE CLIENTES</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setMode("create")
              resetForm()
              if (idRoleCurrentUser === 3 && idBranchCurrentUser) {
                setValues({
                  ci: "",
                  name: "",
                  celphone: "",
                  reference: "",
                  ciudad: "",
                  id_branch: String(idBranchCurrentUser)
                })
              }
              setOpen(true)
            }}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            <Plus size={18}/> Nuevo
          </button>
          <button onClick={handlePDF} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded">
            <FileText size={18}/> PDF
          </button>
          <button onClick={handleExcel} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded">
            <FileSpreadsheet size={18}/> Excel
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar cliente por nombre, cédula, celular, ciudad o sucursal..."
        className="border px-3 py-1 rounded mb-4 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable data={filteredCustomers} columns={columns} />

      <CustomerModal
        open={open}
        mode={mode}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => setOpen(false)}
        message={message}
        messageType={messageType}
        branches={branches}
        idRoleCurrentUser={idRoleCurrentUser}
        idBranchCurrentUser={idBranchCurrentUser}
      />
    </div>
  )
}
