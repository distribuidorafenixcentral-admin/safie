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
  customers: { id: number; name: string }[]
  cars: { id: number; name: string; cost: number; modelo: string; marca: string }[]

}

export default function SoldepoModal(props: Props) {
  if (!props.open) return null

  const title =
    props.mode === "create"
      ? "REGISTRO NUEVA SOLICITUD DE DEPOSITO"
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
          {/* Cliente */}      
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Cliente
            </label>
            <select
                name="id_customer"
                value={props.form.id_customer || ""}
                onChange={props.onChange}
                className="border p-1 rounded-sm pl-2"
                >
                <option value="">Seleccione el Cliente</option>
                {props.customers.map(b => (
                    <option key={b.id} value={String(b.id)}>
                    {b.name}
                    </option>
                ))}
            </select> 
          </div>
          {/* Vehiculo */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Vehiculo
            </label>
            <select
                name="id_car"
                value={props.form.id_car || ""}
                onChange={props.onChange}
                className="border p-1 rounded-sm pl-2"
                >
                <option value="">Seleccione el Vehiculo</option>
                {props.cars.map(b => (
                    <option key={b.id} value={String(b.id)}>
                    {b.name}
                    </option>
                ))}
            </select> 
          </div>
          {/* Costo */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Costo
            </label>
            <input
              name="costo"   
              value={props.form.costo}
              onChange={props.onChange}
              disabled={props.mode !== "create"}
              className="border p-1 rounded-sm pl-2 disabled:bg-gray-200"
              placeholder="37000"
            />
          </div>
          {/* Cuota incial / monto */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Cuota inicial
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
         
          {/* Tipo de Venta */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Tipo de venta
            </label>
            <select
                name="type_sale"
                value={props.form.type_sale || ""}
                onChange={props.onChange}
                className="border p-1 rounded-sm pl-2"
                >
                <option value="">Seleccione el Tipo de Venta</option>
                <option value="Contado">Contado</option>
                <option value="Crédito Directo">Crédito Directo</option>    
                <option value="Crédito Bancario">Crédito Bancario</option>       
            </select> 
          </div>
          {/* Modo de pago */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Modo de pago
            </label>
            <select
                name="type_pay"
                value={props.form.type_pay || ""}
                onChange={props.onChange}
                className="border p-1 rounded-sm pl-2"
                >
                <option value="">Seleccione el Tipo de pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Deposito en Cuenta">Deposito en Cuenta</option>    
                <option value="QR">QR</option>       
            </select> 
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