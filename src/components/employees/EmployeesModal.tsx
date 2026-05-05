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
  roles: { id: number; role: string }[]
}

export default function EmployeeModal(props: Props) {
  if (!props.open) return null

  const title =
    props.mode === "create"
      ? "REGISTRO DE PERSONAL"
      : "EDITAR PERSONAL"

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

          {/* CI */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Cédula de identidad
            </label>
            <input
              name="ci"
              value={props.form.ci}
              onChange={props.onChange}
              disabled={props.mode !== "create"}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
              placeholder="000000"
              autoFocus={props.mode === "create"}
            />
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Nombre
            </label>
            <input
              name="name"
              disabled={props.mode !== "create"}
              value={props.form.name}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
              placeholder="Juan Pérez"
            />
          </div>

          {/* Celular */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Celular
            </label>
            <input
              name="celphone"
              value={props.form.celphone}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
              autoFocus={props.mode !== "create"}
            />
          </div>

          {/* Fecha inicio */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Fecha inicio
            </label>
            <input
              type="date"
              name="start_date"
              value={props.form.start_date || ""}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
            />
          </div>

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
          {/* Rol */}
            <div className="flex flex-col gap-1">
           <label className="text-sm font-semibold italic">
              Cargo
            </label>
          <select
            name="id_role"
            value={props.form.id_role || ""}
            onChange={props.onChange}
            className="border p-1 rounded-sm pl-2"
          >
            <option value="">Seleccione el cargo</option>
            {props.roles.map(r => (
              <option key={r.id} value={String(r.id)}>
                {r.role}
              </option>
            ))}
          </select>
          </div>

          {/* Referencia */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Referencia
            </label>
            <input
              name="reference"
              value={props.form.reference}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
            />
          </div>

          {/* Cel referencia */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Celular referencia
            </label>
            <input
              name="celphone_ref"
              value={props.form.celphone_ref}
              onChange={props.onChange}
              className="border p-1 rounded-sm pl-2"
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