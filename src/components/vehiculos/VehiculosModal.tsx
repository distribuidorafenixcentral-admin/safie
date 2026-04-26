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

export default function VehiculoModal(props: Props) {

  if (!props.open) return null

  const title =
    props.mode === "create"
      ? "REGISTRO DE VEHÍCULO"
      : "EDITAR VEHÍCULO"

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

          {/* Marca */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Marca
            </label>
            <select
              name="marca"
              value={props.form.marca}  
              onChange={props.onChange}
              disabled={props.mode !== "create"}
              className="border p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 pl-2 italic 
              disabled:font-bold disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
              autoFocus={props.mode === "create"} 
            >
              <option value="">Selecciona una marca</option>
              <option value="Baw">Baw</option>
              <option value="Brillance">Brillance</option>
              <option value="Changan">Changan</option>
              <option value="Dongfeng">Dongfeng</option>
              <option value="Foday">Foday</option>

              <option value="Forland">Forland</option>
              <option value="Foton">Foton</option>
              <option value="Dongfeng Sokon">Dongfeng Sokon</option>
              <option value="Golden Dragon">Golden Dragon</option>
              <option value="Helmarv">Helmarv</option>

              <option value="Higer">Higer</option>
              <option value="Hyundai">Hyundai</option>
              <option value="JAC">JAC</option>
              <option value="Jetour">Jetour</option>
              <option value="Kama">Kama</option>

              <option value="Chery">Chery</option>
              <option value="Baic">Baic</option>
              <option value="Keyton">Keyton</option>
              <option value="KIA">KIA</option>
              <option value="King Long">King Long</option>

              <option value="Mazda">Mazda</option>
              <option value="Nissan">Nissan</option>             
              <option value="Renault">Renault</option>
              <option value="Shineray">Shineray</option>
              <option value="Soueast">Soueast</option>

              <option value="Subaru">Subaru</option>
              <option value="Suzuki">Suzuki</option>
              <option value="SWN">SWN</option>
              <option value="T-King">T-King</option>
              <option value="Toyota">Toyota</option>

              <option value="Deepal">Deepal</option>
              <option value="Neta">Neta</option>
              <option value="JIM">JIM</option>
            </select>
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Nombre
            </label>
            <input
              name="name"
              value={props.form.name}
              onChange={props.onChange}              
              className="border p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 pl-2 italic 
              disabled:font-bold disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
              placeholder="New Alto"
            />
          </div>

          {/* modelo */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              modelo
            </label>
           <select name="modelo"
              value={props.form.modelo}
              onChange={props.onChange}       
              className="border p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pl-2"    
            >
              <option value="">Selecciona el año</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>              
            </select>
          </div>

          {/* Costo */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Costo
            </label>
            <input
              name="cost"
              value={props.form.cost}
              onChange={props.onChange}             
              className="border p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 pl-2 italic 
              disabled:font-bold disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
              placeholder="35000"
              autoFocus={props.mode === "create"} 
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