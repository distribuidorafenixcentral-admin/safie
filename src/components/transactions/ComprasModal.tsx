import { X, Save } from "lucide-react"

type Props = {
  open: boolean
  mode: "create" | "view"
  form: any
  onChange: (e: any) => void
  onSubmit: () => void
  onClose: () => void
  message: string
  messageType: "error" | "success" | ""

  branches: { id: number; name_branch: string }[]
  employees: { id: number; name: string }[]
  cuentas?: { id:number; numero_cta: string; banco: string; titular: string }[]
}

export default function CompraModal(props: Props) {
  if (!props.open) return null

  const isView = props.mode === "view"
  const isCash = props.form.type_pay === "Efectivo"

  const cuentas = props.cuentas ?? [] // 🔥 protección

  const title =
    props.mode === "create"
      ? "REGISTRO NUEVA COMPRA"
      : "DETALLE DE LA COMPRA"

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-10">

      <div className="bg-white w-200 rounded-xl border shadow-lg p-6">

        {/* HEADER */}
        <div className="mb-4 border-b-2">
          <h2 className="text-lg font-bold text-blue-900 italic">
            {title}
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

          {/* Tipo */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Tipo de compra
            </label>

            <select
              name="id_type_transaction"
              value={props.form.id_type_transaction || ""}
              onChange={props.onChange}
              disabled={isView}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
            >
              <option value="">Seleccione el tipo</option>
              <option value="5">Material de escritorio</option>
              <option value="6">Material de limpieza</option>
              <option value="7">Compras varias</option>
            </select>
          </div>

          {/* sucursal */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Sucursal
            </label>

            <select
              name="id_branch"
              value={props.form.id_branch || ""}
              onChange={props.onChange}
              disabled={isView}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
            >
              <option value="">Seleccione la sucursal</option>
              {props.branches.map(b => (
                <option key={b.id} value={String(b.id)}>
                  {b.name_branch}
                </option>
              ))}
            </select>
          </div>

          {/* empleado */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Solicitante
            </label>

            <select
              name="id_employee"
              value={props.form.id_employee || ""}
              onChange={props.onChange}
              disabled={isView}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
            >
              <option value="">Seleccione encargado</option>
              {props.employees.map(e => (
                <option key={e.id} value={String(e.id)}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* monto */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Monto
            </label>

            <input
              type="number"
              name="amount"
              value={props.form.amount || ""}
              onChange={props.onChange}
              disabled={isView}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
            />
          </div>

          {/* detalle */}
          <div className="flex flex-col col-span-2 gap-1">
            <label className="text-sm font-semibold italic">
              Detalles
            </label>

            <input
              name="detail"
              value={props.form.detail || ""}
              onChange={props.onChange}
              disabled={isView}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
            />
          </div>

          {/* tipo pago */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Tipo de Pago
            </label>

            <select
              name="type_pay"
              value={props.form.type_pay || ""}
              onChange={props.onChange}
              disabled={isView}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
            >
              <option value="">Seleccione</option>
              <option value="Efectivo">Efectivo</option>
              <option value="QR">QR</option>
              <option value="Deposito">Depósito</option>
            </select>
          </div>

          {/* 🆕 CUENTAS */}
          {!isCash && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold italic">
                Cuenta bancaria
              </label>

              <select
                name="id_cuenta"
                value={props.form.id_cuenta || ""}
                onChange={props.onChange}
                disabled={isView}
                className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
              >
                <option value="">Seleccione cuenta</option>

                {cuentas.map(d => (
                  <option key={d.id} value={String(d.id)}>
                    {d.banco} - {d.numero_cta}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={props.onClose}
            className="flex items-center gap-2 px-3 py-2 rounded bg-red-600 text-white"
          >
            <X size={18} /> Cancelar
          </button>

          {!isView && (
            <button
              onClick={props.onSubmit}
              className="flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white"
            >
              <Save size={18} /> Guardar
            </button>
          )}

        </div>
      </div>
    </div>
  )
}