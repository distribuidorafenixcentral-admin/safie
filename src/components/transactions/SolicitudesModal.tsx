import { X, Save } from "lucide-react"
import type { SolicitudInsert } from "@/types/solicitudes"

type Props = {
  open: boolean
  mode: "create" | "edit"
  form: SolicitudInsert
  onChange: (e: React.ChangeEvent<any>) => void 
  onSubmit: () => void
  onClose: () => void
  message: string
  messageType: "error" | "success" | ""
  branches: { id: number; name_branch: string }[]
  employees: { id: number; name: string; id_branch?: number | null }[]
  id_role?: number
}

export default function SolicitudModal(props: Props) {
  if (!props.open) return null

  const title =
    props.mode === "create"
      ? "REGISTRO NUEVA SOLICITUD"
      : "EDITAR SOLICITUD"

  // 🔒 LÓGICA DINÁMICA DE EMPLEADOS (Para todos los roles)
  // Si hay una sucursal seleccionada en el formulario (ya sea fija por Rol 3 o elegida por Rol 1/2),
  // filtramos los empleados para que coincidan estrictamente con ese id_branch.
  const filteredEmployees = props.form.id_branch
    ? props.employees.filter(e => Number(e.id_branch) === Number(props.form.id_branch))
    : [] // Si un Admin no ha elegido sucursal, se muestra vacío para forzar la selección previa

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 md:p-10">
      <div className="bg-white max-w-2xl w-full rounded-xl border shadow-lg p-6 animate-in fade-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="mb-4 border-b-2 pb-2">
          <h2 className="text-lg font-bold text-blue-900 italic">
            {title}
          </h2>
        </div>

        {/* MENSAJE */}
        {props.message && (
          <div
            className={`mb-4 p-2 rounded text-white text-sm font-medium ${
              props.messageType === "error"
                ? "bg-red-500"
                : "bg-green-500"
            }`}
          >
            {props.message}
          </div>
        )}

        {/* FORM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Tipo de solicitud */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Tipo de Solicitud
            </label>
            <select
              name="id_type_transaction"
              value={props.form.id_type_transaction || ""}
              onChange={props.onChange}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">Seleccione el tipo de solicitud</option>
              <option value={1}>Pago de Servicios</option>
              <option value={2}>Pago de Alquiler</option>
              <option value={3}>Pago de Sueldo</option>
            </select>
          </div>

          {/* Sucursal */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Sucursal
            </label>
            <select
              name="id_branch"
              value={props.form.id_branch || ""}
              onChange={props.onChange}
              disabled={props.id_role === 3} // Bloqueado solo si es Rol 3
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <option value="">Seleccione la Sucursal</option>
              {props.branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name_branch}
                </option>
              ))}
            </select>
          </div>

          {/* Empleado / Solicitante (Dinamismo aplicado) */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Solicitante
            </label>
            <select
              name="id_employee"
              value={props.form.id_employee || ""}
              onChange={props.onChange}
              disabled={!props.form.id_branch} // Deshabilitado si no hay sucursal seleccionada (roles 1 y 2)
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            >
              {props.form.id_branch ? (
                <>
                  <option value="">Seleccione el Solicitante</option>
                  {filteredEmployees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">⚠️ Primero seleccione una sucursal</option>
              )}
            </select> 
          </div>

          {/* MONTO */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Monto
            </label>
            <input
              type="number"
              name="amount"
              value={props.form.amount || ""}
              onChange={props.onChange}
              disabled={props.mode !== "create"}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="2500"
            />
          </div>

          {/* Detalle */}
          <div className="flex flex-col w-full gap-1 sm:col-span-2">
            <label className="text-sm font-semibold italic">
              Detalles
            </label>
            <input
              type="text"
              name="detail"
              value={props.form.detail || ""}
              onChange={props.onChange}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Pago de servicios del mes de junio"
            />
          </div>           
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 mt-8 border-t pt-4">
          <button
            type="button"
            onClick={props.onClose}
            className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <X size={18} />
            Cancelar
          </button>

          <button
            type="button"
            onClick={props.onSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Save size={18} />
            Guardar
          </button>
        </div>

      </div>
    </div> 
  )
}
