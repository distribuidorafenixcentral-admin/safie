import { X, Save } from "lucide-react"

type Props = {
  open: boolean
  mode: "create" | "edit"
  form: any
  onChange: any
  onSubmit: any
  onClose: any
  message: string
  messageType: "error" | "success" | ""
}

export default function SucursalModal(props: Props) {

  if (!props.open) return null

  const title =
    props.mode === "create"
      ? "REGISTRO DE SUCURSAL"
      : "EDITAR SUCURSAL"

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-16">

      <div className="bg-white w-150 rounded-xl border shadow-lg p-6">

        {/* HEADER */}
        <div className="mb-4 border-b-2 ">
          <h2 className="text-lg font-bold text-blue-900 italic">
            {title}
          </h2>
        </div>

        {/* MENSAJE */}
        {props.message && (
          <div
            className={`mb-4 p-2 rounded text-white text-xl ${
              props.messageType === "error"
                ? "bg-red-500"
                : "bg-green-500"
            }`}
          >
            {props.message}
          </div>
        )}

        {/* FORMULARIO */}
        <div className="grid grid-cols- gap-4 ml-16 mr-16">

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Nombre de Sucursal
            </label>
            <input
              name="name_branch"
              value={props.form.name_branch}
              onChange={props.onChange}
              disabled={props.mode !== "create"}
              className="border p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 pl-2 italic 
              disabled:font-bold disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
              placeholder="Ej: Casa Matriz"
              autoFocus={props.mode === "create"} 
            />
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Dirección
            </label>
            <input
              name="adress_branch"
              value={props.form.adress_branch}
              onChange={props.onChange}
              className="border p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pl-2"
              placeholder="Ej: Av. Blanco Galindo"
              autoFocus={props.mode === "edit"}              
            />
          </div>

        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 mt-12">

          <button
            onClick={props.onClose}
            className="flex items-center gap-2 px-2 py-2 rounded bg-red-600 text-white hover:bg-red-800 transition text-sm"
          >
            <X size={18} />
            Cancelar
          </button>

          <button
            onClick={props.onSubmit}
            className="flex items-center gap-2 px-2 py-2 rounded bg-green-600 text-white hover:bg-green-800 transition text-sm"
          >
            <Save size={18} />
            Guardar
          </button>

        </div>

      </div>
    </div>
  )
}