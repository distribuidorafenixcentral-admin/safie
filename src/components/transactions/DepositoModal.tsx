import { X, Save } from "lucide-react"

type Props = {
  open: boolean
  form: any
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
    cost: number
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

  const requiresCuenta =
    props.form.type_pay === "QR" ||
    props.form.type_pay === "Depósito en Cuenta"

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-10">

      <div className="bg-white w-200 rounded-xl border shadow-lg p-6">

        {/* HEADER */}
        <div className="mb-4 border-b-2">
          <h2 className="text-lg font-bold text-blue-900 italic">
            CONFIRMAR SOLICITUD DE DEPÓSITO
          </h2>
        </div>

        {/* MENSAJE */}
        {props.message && (
          <div
            className={`mb-4 p-2 rounded text-white text-sm ${
              props.messageType === "error"
                ? "bg-red-500"
                : "bg-green-500"
            }`}
          >
            {props.message}
          </div>
        )}

        {/* FORM */}
        <div className="grid grid-cols-2 gap-4">

          {/* Sucursal */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Sucursal
            </label>
            <select
              name="id_branch"
              value={props.form.id_branch || ""}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
            >
              <option value="">Seleccione la sucursal</option>
              {props.branches.map(b => (
                <option key={b.id} value={String(b.id)}>
                  {b.name_branch}
                </option>
              ))}
            </select>
          </div>

          {/* Empleado */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Solicitante
            </label>
            <select
              name="id_employee"
              value={props.form.id_employee || ""}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
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
            <label className="text-sm font-semibold italic">
              Cliente
            </label>
            <select
              name="id_customer"
              value={props.form.id_customer || ""}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
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
            <label className="text-sm font-semibold italic">
              Vehículo
            </label>
            <select
              name="id_car"
              value={props.form.id_car || ""}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
            >
              <option value="">Seleccione vehículo</option>
              {props.cars.map(c => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Precio final */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Precio Final
            </label>
            <input
              name="costo"
              value={props.form.costo}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
              placeholder="37000"
            />
          </div>

          {/* Cuota inicial */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Cuota Inicial
            </label>
            <input
              name="amount"
              value={props.form.amount}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
              placeholder="2500"
            />
          </div>

          {/* Tipo venta */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Tipo de venta
            </label>
            <select
              name="type_sale"
              value={props.form.type_sale || ""}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
            >
              <option value="">Seleccione tipo de venta</option>
              <option value="Contado">Contado</option>
              <option value="Crédito Directo">Crédito Directo</option>
              <option value="Crédito Bancario">Crédito Bancario</option>
            </select>
          </div>

          {/* Tipo pago */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Tipo de pago
            </label>
            <select
              name="type_pay"
              value={props.form.type_pay || ""}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
            >
              <option value="">Seleccione tipo de pago</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Depósito en Cuenta">
                Depósito en Cuenta
              </option>
              <option value="QR">QR</option>
            </select>
          </div>

          {/* Cuenta bancaria */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-sm font-semibold italic">
              Cuenta de destino
            </label>

            <select
              name="id_cuenta"
              value={props.form.id_cuenta || ""}
              onChange={props.onChange}
              disabled={!requiresCuenta}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
            >
              <option value="">
                {requiresCuenta
                  ? "Seleccione una cuenta"
                  : "No aplica para efectivo"}
              </option>

              {props.cuentas
                .filter(c => c.status === 1)
                .map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.banco} | {c.numero_cta} | {c.titular}
                  </option>
                ))}
            </select>
          </div>

          {/* Detalle */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-sm font-semibold italic">
              Detalle
            </label>
            <input
              name="detail"
              value={props.form.detail}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
              placeholder="Detalle del depósito"
            />
          </div>

        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={props.onClose}
            className="flex items-center gap-2 px-3 py-2 rounded bg-red-600 text-white hover:bg-red-800 text-sm"
          >
            <X size={18} />
            Cancelar
          </button>

          <button
            onClick={props.onConfirm}
            className="flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-800 text-sm"
          >
            <Save size={18} />
            Confirmar
          </button>

        </div>

      </div>
    </div>
  )
}