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

  // 💡 Nuevas propiedades necesarias para discriminar el Select
  idRoleCurrentUser?: number | null
  idBranchCurrentUser?: number | null
}

export default function EmployeeModal(props: Props) {
  if (!props.open) return null

  const title =
    props.mode === "create"
      ? "REGISTRO DE PERSONAL"
      : "EDITAR PERSONAL"

  // 🧠 Evaluamos si el usuario es Rol 3 (Administrador de sucursal)
  const isBranchManager = props.idRoleCurrentUser === 3

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

         {/* Sucursal (Discriminada por Rol) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold italic">
              Sucursal
            </label>
            <select
              name="id_branch"
              // 🔥 Si es Rol 3 y está creando, fuerza su id_branch de sesión. Si no, usa el valor del formulario.
              value={isBranchManager && props.mode === "create" ? String(props.idBranchCurrentUser) : (props.form.id_branch || "")}
              onChange={props.onChange}
              // 🔒 Si es Rol 3, el select queda completamente deshabilitado y bloqueado con fondo gris
              disabled={isBranchManager}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              {isBranchManager ? (
                /* 🏢 Escenario Rol 3: Solo renderiza su sucursal correspondiente */
                props.branches
                  .filter(b => b.id === props.idBranchCurrentUser)
                  .map(b => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name_branch}
                    </option>
                  ))
              ) : (
                /* 🌍 Escenario Rol 1 o 2: Renderiza el listado completo de sucursales */
                <>
                  <option value="">Seleccione la sucursal</option>
                  {props.branches.map(b => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name_branch}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
{/* Cargo / Rol (Discriminado por Rol del usuario actual) */}
<div className="flex flex-col gap-1">
  <label className="text-sm font-semibold italic">
    Cargo
  </label>
  <select
    name="id_role"
    // 🔥 Si es Rol 3 y está creando, fuerza el rol 5 (Asesor de ventas). Si no, usa el del formulario.
    value={isBranchManager && props.mode === "create" ? "5" : (props.form.id_role || "")}
    onChange={props.onChange}
    // 🔒 Si es Rol 3, bloqueamos el select para que no pueda cambiarlo por código o error
    disabled={isBranchManager}
    className="border p-1 rounded-sm pl-2 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
  >
    {isBranchManager ? (
      /* 💼 Escenario Rol 3: Solo renderiza la opción de Asesor de Ventas (ID 5) */
      props.roles
        .filter(r => r.id === 5)
        .map(r => (
          <option key={r.id} value={String(r.id)}>
            {r.role}
          </option>
        ))
    ) : (
      /* 🌍 Escenario Rol 1 o 2: Renderiza todos los cargos disponibles */
      <>
        <option value="">Seleccione el cargo</option>
        {props.roles.map(r => (
          <option key={r.id} value={String(r.id)}>
            {r.role}
          </option>
        ))}
      </>
    )}
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
