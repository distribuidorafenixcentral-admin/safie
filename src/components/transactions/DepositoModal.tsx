
import { X, Check } from "lucide-react"
import type { DepositoUpdate } from "@/types/deposito"

type Props = {
  open: boolean
  // 🔥 Extendemos de forma exhaustiva el estado del formulario para la UI
  form: Omit<DepositoUpdate, "id_cuenta" | "amount" | "costo"> & { 
    id_branch?: number | string | null
    id_employee?: number | string | null
    id_customer?: number | string | null
    id_car?: number | string | null
    id_cuenta?: number | string | null
    costo?: number | string | null    
    amount?: number | string | null    
    type_sale?: string | null
    detail?: string 
  }
  onChange: (e: any) => void
  onConfirm: () => void
  onClose: () => void

  message: string
  messageType: "error" | "success" | ""

  branches: { id: number; name_branch: string }[]
  employees: { id: number; name: string }[]
  customers: { id: number; name: string }[]
  cars: {
    id: number
    name: string
    costo: number
    modelo: string
    marca: string
  }[]

  cuentas: {
    id: number
    numero_cta: string
    banco: string
    titular: string
    status: number
  }[]
}

export default function DepositosModal(props: Props) {
  if (!props.open) return null

  // 🏦 Requiere cuenta si es QR, Depósito en Cuenta o Transferencia Bancaria
  const requiresCuenta =
    props.form.type_pay === "QR" ||
    props.form.type_pay === "Depósito en Cuenta" ||
    props.form.type_pay === "Transferencia"

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-xl border shadow-xl p-6 overflow-y-auto max-h-[90vh]">

        {/* HEADER */}
        <div className="mb-5 pb-2 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-blue-900 tracking-wide">
            CONFIRMAR SOLICITUD DE DEPÓSITO
          </h2>
          <button onClick={props.onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* MENSAJE DE RETROALIMENTACIÓN */}
        {props.message && (
          <div
            className={`mb-4 p-3 rounded-lg text-white text-sm font-medium ${
              props.messageType === "error" ? "bg-red-500" : "bg-emerald-500"
            }`}
          >
            {props.message}
          </div>
        )}

        {/* FORMULARIO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Sucursal */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Sucursal
            </label>
            <select
              name="id_branch"
              value={props.form.id_branch || ""}
              onChange={props.onChange}
              className="border p-2 rounded bg-gray-50 text-sm focus:outline-blue-500"
              disabled // Deshabilitado para mantener la integridad del registro original
            >
              <option value="">Seleccione la sucursal</option>
              {props.branches.map(b => (
                <option key={b.id} value={String(b.id)}>
                  {b.name_branch}
                </option>
              ))}
            </select>
          </div>

          {/* Empleado Solicitante */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Solicitante
            </label>
            <select
              name="id_employee"
              value={props.form.id_employee || ""}
              onChange={props.onChange}
              className="border p-2 rounded bg-gray-50 text-sm focus:outline-blue-500"
              disabled // Deshabilitado por auditoría
            >
              <option value="">Seleccione empleado</option>
              {props.employees.map(e => (
                <option key={e.id} value={String(e.id)}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Cliente
            </label>
            <select
              name="id_customer"
              value={props.form.id_customer || ""}
              onChange={props.onChange}
              className="border p-2 rounded bg-gray-50 text-sm focus:outline-blue-500"
              disabled
            >
              <option value="">Seleccione cliente</option>
              {props.customers.map(c => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehículo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Vehículo
            </label>
            <select
              name="id_car"
              value={props.form.id_car || ""}
              onChange={props.onChange}
              className="border p-2 rounded bg-gray-50 text-sm focus:outline-blue-500"
              disabled
            >
              <option value="">Seleccione vehículo</option>
              {props.cars.map(c => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} ({c.modelo})
                </option>
              ))}
            </select>
          </div>

          {/* Precio final */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Precio Final (Bs.)
            </label>
            <input
              type="number"
              name="costo"
              value={props.form.costo ?? ""}
              onChange={props.onChange}
              className="border p-2 rounded text-sm focus:outline-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Monto Depósito / Cuota Inicial */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Monto a Confirmar (Bs.)
            </label>
            <input
              type="number"
              name="amount"
              value={props.form.amount ?? ""}
              onChange={props.onChange}
              className="border p-2 rounded text-sm font-semibold text-emerald-700 focus:outline-blue-500 border-emerald-300 bg-emerald-50/30"
              placeholder="0.00"
            />
          </div>

          {/* Tipo venta */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Tipo de venta
            </label>
            <select
              name="type_sale"
              value={props.form.type_sale || ""}
              onChange={props.onChange}
              className="border p-2 rounded text-sm focus:outline-blue-500"
            >
              <option value="">Seleccione tipo de venta</option>
              <option value="Contado">Contado</option>
              <option value="Crédito Directo">Crédito Directo</option>
              <option value="Crédito Bancario">Crédito Bancario</option>
            </select>
          </div>

          {/* Tipo pago */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              Tipo de pago
            </label>
            <select
              name="type_pay"
              value={props.form.type_pay || ""}
              onChange={props.onChange}
              className="border p-2 rounded text-sm font-medium border-blue-300 focus:outline-blue-500 bg-blue-50/10"
            >
              <option value="">Seleccione tipo de pago</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Depósito en Cuenta">Depósito en Cuenta</option>
              <option value="QR">QR</option>
              <option value="Transferencia">Transferencia Bancaria</option>
            </select>
          </div>

          {/* Cuenta bancaria destino */}
          <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Cuenta Destino
            </label>
            <select
              name="id_cuenta"
              value={requiresCuenta ? (props.form.id_cuenta || "") : ""}
              onChange={props.onChange}
              disabled={!requiresCuenta}
              className="border p-2 rounded text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:outline-blue-500"
            >
              <option value="">
                {requiresCuenta ? "Seleccione la cuenta destino" : "No aplica para pagos en Efectivo"}
              </option>
              {props.cuentas
                .filter(c => c.status === 1)
                .map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.banco} — N° {c.numero_cta} ({c.titular})
                  </option>
                ))}
            </select>
          </div>

          {/* Detalle */}
          <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Observaciones / Detalle
            </label>
            <input
              type="text"
              name="detail"
              value={props.form.detail || ""}
              onChange={props.onChange}
              className="border p-2 rounded text-sm focus:outline-blue-500"
              placeholder="Escriba aclaraciones sobre la validación del depósito"
            />
          </div>

        </div>

        {/* ACCIONES DEL MODAL */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={props.onClose}
            className="flex items-center gap-2 px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            type="button"
            onClick={props.onConfirm}
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm"
          >
            <Check size={16} />
            Confirmar Depósito
          </button>
        </div>

      </div>
    </div>
  )
}
