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
import { getCuentas } from "@/services/cuentasService"

import type { DepositoWithRelations, Deposito } from "@/types/deposito"

type Branch = { id: number; name_branch: string }
type Employee = { id: number; name: string }
type Customer = { id: number; name: string }
type Car = { id: number; name: string; costo: number; modelo: string; marca: string }
type Cuenta = { id: number; numero_cta: string; banco: string; titular: string; status: number }

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
  const [cuentas, setCuentas] = useState<Cuenta[]>([])

  // 🔹 UI
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<DepositoWithRelations | null>(null)

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
      id_branch: "",
      id_employee: "",
      id_customer: "",
      id_car: "",
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
      try {
        const b = await getBranches()
        const e = await getEmployees()
        const c = await getCustomer()
        const a = await getVehiculos()
        const cuentasData = await getCuentas()

        setBranches(b)
        setEmployees(e.map(emp => ({ id: emp.id, name: emp.name ?? "" })))
        setCustomers(c.map(cli => ({ id: cli.id, name: cli.name ?? "" })))
        
        // 🚗 Corrección de llave de costo sincronizada con la BD
        setCars(a.map(car => ({
          id: car.id,
          name: car.name ?? "",
          costo: car.cost ?? car.cost ?? 0,
          modelo: car.modelo ?? "",
          marca: car.marca ?? ""
        })))

        setCuentas(cuentasData.filter((c: any) => c.status === 1))
      } catch (err) {
        console.error("Error cargando catálogos de depósitos:", err)
      }
    }

    fetchData()
  }, [])

  // 🔥 limpiar mensajes temporales
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 2500)
    return () => clearTimeout(timer)
  }, [message])

  // 📌 Ver detalle / mapear a formulario
  const handleView = (row: DepositoWithRelations) => {
    setSelected(row)

    setValues({
      id_branch: row.id_branch ? String(row.id_branch) : "",
      id_employee: row.id_employee ? String(row.id_employee) : "",
      id_customer: row.id_customer ? String(row.id_customer) : "",
      id_car: row.id_car ? String(row.id_car) : "",
      id_cuenta: row.id_cuenta ? String(row.id_cuenta) : "",
      costo: row.costo !== null && row.costo !== undefined ? String(row.costo) : String(row.cars?.cost ?? ""),
      amount: String(row.amount),
      detail: row.detail || "",
      type_sale: row.type_sale || "",
      type_pay: row.type_pay || ""
    })

    setOpen(true)
  }

  // 📌 Confirmar depósito en backend
  const handleConfirm = async () => {
    if (!selected) return

    // 🔒 Validación de cuenta bancaria obligatoria para depósitos y transferencias electrónicos
    const requiereBanco = 
      form.type_pay === "QR" || 
      form.type_pay === "Depósito en Cuenta" || 
      form.type_pay === "Transferencia"

    if (requiereBanco && !form.id_cuenta) {
      setMessage("Debe seleccionar una cuenta bancaria de destino para este tipo de pago")
      setMessageType("error")
      return
    }

    try {
      await editDeposito(selected.id, {
        type_pay: form.type_pay || null,
        id_cuenta: form.type_pay === "Efectivo" ? null : (form.id_cuenta ? Number(form.id_cuenta) : null),
        costo: form.costo ? Number(form.costo) : null,
        amount: Number(form.amount),
        detail: form.detail,
        type_sale: form.type_sale || null
      } as any)

      setMessage("¡Depósito verificado y confirmado correctamente!")
      setMessageType("success")

      setTimeout(() => {
        setOpen(false)
        resetForm()
        setSelected(null)
      }, 1500)

    } catch (error) {
      setMessage("Ocurrió un error al intentar procesar la confirmación")
      setMessageType("error")
    }
  }

  // 📌 Dar de baja con cuadro de diálogo de confirmación
  const handleDelete = (row: Deposito) => {
    confirm({
      title: "Dar de baja depósito",
      message: `¿Está seguro de que desea anular y dar de baja la solicitud N° ${row.id}? Esta acción no se puede deshacer.`,
      confirmText: "Dar de Baja",
      onConfirm: async () => {
        try {
          await removeDeposito(row.id)
          showToast("La solicitud ha sido dada de baja del sistema correctamente ✅", "success")
        } catch {
          showToast("Error al procesar la baja de la transacción", "error")
        }
      }
    })
  }

  // 📌 Exportaciones de archivos
  const handleExcel = () => exportDepositosToExcel(filteredDepositos)

  const handlePDF = () => {
    const currentUser = profile?.name || profile?.user || user?.email || "Sistema"
    exportDepositosToPDF(filteredDepositos, currentUser)
  }

  // 📌 Obtención dinámica de definición de columnas
  const columns = getColumnsDepositos(handleView, handleDelete)

  return (
    <div className="p-1 container mx-auto">
      {/* HEADER DE LA PÁGINA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          VALIDACIÓN Y CONFIRMACIÓN DE DEPÓSITOS
        </h2>

        <div className="flex gap-2">
          <button
            onClick={handlePDF}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 transition-colors text-white px-4 py-1.5 rounded-lg font-medium text-sm shadow-sm"
          >
            <FileText size={16} />
            Exportar PDF
          </button>

          <button
            onClick={handleExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-4 py-1.5 rounded-lg font-medium text-sm shadow-sm"
          >
            <FileSpreadsheet size={16} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* FILTRO DE BÚSQUEDA */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Buscar por cliente, vehículo, solicitante, detalle o importes..."
          className="border border-slate-300 px-4 py-2 rounded-lg text-sm w-full max-w-xl shadow-sm focus:outline-none focus:border-blue-500 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* DATA TABLE CENTRAL */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <DataTable data={filteredDepositos} columns={columns} />
      </div>

      {/* FORMULARIO DE ACCIONES (MODAL) */}
      <DepositosModal
        open={open}
        form={form}
        onChange={handleChange}
        onConfirm={handleConfirm}
        onClose={() => {
          setOpen(false)
          resetForm()
          setSelected(null)
        }}
        message={message}
        messageType={messageType}
        branches={branches}
        employees={employees}
        customers={customers}
        cars={cars}
        cuentas={cuentas}
      />
    </div>
  )
}
