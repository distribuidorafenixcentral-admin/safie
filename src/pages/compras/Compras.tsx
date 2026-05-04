import { useState, useEffect } from "react"

import { useCompras } from "@/hooks/useCompras"
import { useForm } from "@/hooks/useForm"

import { DataTable } from "@/components/common/DataTable"
import { getColumnsCompras } from "@/components/transactions/columnsCompras"
import CompraModal from "@/components/transactions/ComprasModal"

import { useToast } from "@/context/ToastContext"

import { Plus, FileText, FileSpreadsheet } from "lucide-react"

import { getBranches } from "@/services/branchService"
import { getEmployees } from "@/services/employeesService"
import { getCuentas } from "@/services/cuentasService"

import type { CompraWithRelations } from "@/types/compra"

type Branch = { id: number; name_branch: string }
type Employee = { id: number; name: string }
type Cuentas = { id:number; numero_cta: string; banco: string; titular: string}

export default function Compras() {
    console.log("RENDER COMPRAS")

  const [search, setSearch] = useState("")
  const toast = useToast()

  const { filteredCompra, addCompra } = useCompras(search)

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "view">("create")

  const [branches, setBranches] = useState<Branch[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [cuentas, setCuentas] = useState<Cuentas[]>([])

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
      type_pay: "Efectivo",
      id_cuenta: ""
    }
  })

  useEffect(() => {
      console.log("ENTRANDO")
    const load = async () => {
      console.log("ANTES DEL GET")

      const b = await getBranches()
       console.log("DESPUES DEL GET:", b)
      const e = await getEmployees()
      const d = await getCuentas()
      console.log("DESPUES DEL GET CUENTAS:", d)

      setBranches(b)
      setCuentas(d ?? []) // 🔥 protección

      const mappedEmployees = e.map(emp => ({
        id: emp.id,
        name: emp.name ?? ""
      }))

      setEmployees(mappedEmployees)
    }

    load()
  }, [])

  const handleView = (row: CompraWithRelations) => {
    setMode("view")

    setValues({
      id_type_transaction: String(row.id_type_transaction),
      id_branch: String(row.id_branch),
      id_employee: String(row.id_employee),
      amount: String(row.amount),
      detail: row.detail ?? "",
      type_pay: row.type_pay ?? "Efectivo",
      id_cuenta: row.id_cuenta ? String(row.id_cuenta) : "" 
    })

    setOpen(true)
  }

  const handleSubmit = async () => {
    try {

      if (form.type_pay !== "Efectivo" && !form.id_cuenta) {
        toast("Debe seleccionar una cuenta", "error")
        return
      }

      await addCompra({
        id_type_transaction: Number(form.id_type_transaction),
        id_branch: Number(form.id_branch),
        id_employee: Number(form.id_employee),
        amount: Number(form.amount),
        detail: form.detail,
        type_pay: form.type_pay,
        id_cuenta: form.id_cuenta ? Number(form.id_cuenta) : null 
      })

      toast("Compra registrada correctamente", "success")

      setOpen(false)
      resetForm()

    } catch (error: any) {
      toast(error.message || "Error al registrar", "error")
    }
  }

  const columns = getColumnsCompras(handleView)

  return (
    
    <div>
 <div>HOLA COMPRAS</div>
      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-bold italic">
          REGISTRO DE COMPRAS
        </h2>

        <div className="flex gap-3">

          <button
            onClick={() => {
              setMode("create")
              resetForm()
              setOpen(true)
            }}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded"
          >
            <Plus size={18} /> Nuevo
          </button>

          <button className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded">
            <FileText size={18} /> PDF
          </button>

          <button className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded">
            <FileSpreadsheet size={18} /> Excel
          </button>

        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar compra..."
        className="border px-3 py-1 rounded mb-4 w-full max-w-md"
      />

      <DataTable data={filteredCompra} columns={columns} />

      <CompraModal
        open={open}
        mode={mode}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => setOpen(false)}
        message=""
        messageType=""
        branches={branches}
        employees={employees}
        cuentas={cuentas}
      />

    </div>
  )
}