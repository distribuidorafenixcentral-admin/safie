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
import { getColumnsSoldepo } from "@/components/transactions/columnsSoldelpo"
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


export default function Soldepo() {

  // 🔍 búsqueda
  const [search, setSearch] = useState("")

  const {
    filteredSoldepo,
    addSoldepo,
    editSoldepo,
    removeSoldepo
  } = useSoldepo(search)


  // 🔹 catálogos
  const [branches, setBranches] = useState<Branch[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cars, setCars] = useState<Car[]>([])


  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selected, setSelected] = useState<SoldepoWithRelations | null>(null)


  // 🔹 mensajes
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")


  const confirm = useConfirm()
  const showToast = useToast()
  const { profile, user } = useAuth()


  // 🔹 formulario
  const {
    form,
    handleChange,
    resetForm,
    setValues
  } = useForm({
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
            name: employee.name ?? ""
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


  // 🚗 Autocompletar costo al seleccionar vehículo
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


  // 🔥 Limpiar mensajes
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
      !form.detail
    ) {
      setMessage("Campos obligatorios incompletos")
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
        amount: Number(form.amount),
        detail: form.detail,
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
        setOpen(false)
        resetForm()
        setSelected(null)
        setMode("create")
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
    exportSoldepoToExcel(filteredSoldepo)
  }

  const handlePDF = () => {
    const currentUser =
      profile?.name ||
      profile?.user ||
      user?.email ||
      "Sistema"

    exportSoldepoToPDF(filteredSoldepo, currentUser)
  }


  const columns = getColumnsSoldepo(
    handleEdit,
    handleDelete
  )


  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">

        <h2 className="text-xl font-bold italic">
          REGISTRO DE SOLICITUDES DE DEPÓSITO
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
            <Plus size={18} />
            Nuevo
          </button>

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
        placeholder="Buscar solicitud..."
        className="border px-3 py-1 rounded mb-4 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />


      {/* TABLA */}
      <DataTable
        data={filteredSoldepo}
        columns={columns}
      />


      {/* MODAL */}
      <SoldepoModal
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
        customers={customers}
        cars={cars}
      />

    </div>
  )
}