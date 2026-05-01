import { X, Save } from "lucide-react"

type Props = {
  open: boolean
  mode: "create" | "edit"
  form: any
  onChange: (e: any) => void
  onSubmit: () => void
  onClose: () => void
  message: string
  messageType: "error" | "success" | ""

  branches: { id: number; name_branch: string }[]
  employees: { id: number; name: string }[]
  status_transaction: { id: number; status: string }[]

  isPaid?: boolean
}

export default function MemosModal(props: Props) {
  if (!props.open) return null

  const title =
    props.mode === "create"
      ? "REGISTRAR SANCION "
      : "EDITAR REGISTRO"

  const isEdit = props.mode === "edit"
  const isPaid = props.isPaid === true

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

          {/* Sucursal */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Sucursal
            </label>
            <select
              name="id_branch"
              value={props.form.id_branch || ""}
              onChange={props.onChange}
              disabled={isEdit}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
            >
              <option value="">Seleccione la Sucursal</option>
              {props.branches.map(b => (
                <option key={b.id} value={String(b.id)}>
                  {b.name_branch}
                </option>
              ))}
            </select>
          </div>

          {/* Empleado */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Nombre del personal
            </label>
            <select
              name="id_employee"
              value={props.form.id_employee || ""}
              onChange={props.onChange}
              disabled={isEdit}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
            >
              <option value="">Seleccione el Personal</option>
              {props.employees.map(e => (
                <option key={e.id} value={String(e.id)}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* MONTO */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Monto
            </label>
            <input
              name="amount"
              value={props.form.amount}
              onChange={props.onChange}
              disabled={isEdit && isPaid}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
              placeholder="2500"
            />
          </div>

          {/* DETALLE */}
          <div className="flex flex-col w-full gap-1 col-span-2">
            <label className="text-sm font-semibold italic">
              Detalles
            </label>
            <input
              name="detail"
              value={props.form.detail}
              onChange={props.onChange}
              disabled={isEdit && isPaid}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
              placeholder="Pago de servicios del mes de junio"
            />
          </div>

          {/* ESTADO */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Estado
            </label>
            <select
              name="id_status"
              value={props.form.id_status || ""}
              onChange={props.onChange}
              disabled={isEdit && isPaid}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
            >
              <option value="">Seleccione el estado</option>
              {props.status_transaction.map(s => (
                <option key={s.id} value={String(s.id)}>
                  {s.status}
                </option>
              ))}
            </select>
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
            onClick={props.onSubmit}
            disabled={isEdit && isPaid}
            className="flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-800 text-sm disabled:bg-gray-400"
          >
            <Save size={18} />
            Guardar
          </button>

        </div>
      </div>
    </div>
  )
}