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
}

export default function SolicitudModal(props: Props) {
  if (!props.open) return null

  const title =
    props.mode === "create"
      ? "REGISTRO NUEVA SOLICITUD"
      : "EDITAR SOLICITUD"

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

        {/* Tipo de solicitud */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-black mb-1 italic">
                Tipo de Solicitud
              </label>

              <select
                name="id_type_transaction"
                value={props.form.id_type_transaction}
                onChange={props.onChange}
                className="border p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pl-2"
              >
                <option value="">Seleccione un el tip de solicitud</option>
                <option value="1">Pago de Servicios</option>
                <option value="2">Pago de Alquiler</option>
                <option value="3">Pago de Sueldo</option>
              </select>
            </div>
          {/* sucursal */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black mb-1 italic">
                  Sucursal
                </label>
                 <select
                    name="id_branch"
                    value={props.form.id_branch || ""}
                    onChange={props.onChange}
                    className="border p-1 rounded-sm pl-2"
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
              Solicitante
            </label>
            <select
                name="id_employee"
                value={props.form.id_employee || ""}
                onChange={props.onChange}
                className="border p-1 rounded-sm pl-2"
                >
                <option value="">Seleccione el Solicitante</option>
                {props.employees.map(b => (
                    <option key={b.id} value={String(b.id)}>
                    {b.name}
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
              disabled={props.mode !== "create"}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
              placeholder="2500"
            />
          </div>
          {/* detalle */}
          <div className="flex flex-col w-full gap-1 col-span-2">
            <label className="text-sm font-semibold italic">
              Detalles
            </label>
            <input
              name="detail"
              value={props.form.detail}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
              placeholder="Pago de servicios del mes de junio"
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
            onClick={props.onSubmit}
            className="flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-800 text-sm"
          >
            <Save size={18} />
            Guardar
          </button>

        </div>
      </div>
    </div> 
  )
}       