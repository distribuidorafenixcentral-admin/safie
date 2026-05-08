import { X, Save } from "lucide-react"
import type { SoldepoInsert } from "@/types/soldepo"

type Props = {
  open: boolean
  mode: "create" | "edit"
  form: SoldepoInsert // 👈 Tipado estricto aplicado
  onChange: (e: React.ChangeEvent<any>) => void // 👈 Tipado correcto para interoperabilidad con useForm
  onSubmit: () => void
  onClose: () => void
  message: string
  messageType: "error" | "success" | ""
   
  branches: { id: number; name_branch: string }[]
  employees: { id: number; name: string; id_branch?: number | null }[] // 👈 Añadido id_branch para el filtrado dinámico
  customers: { id: number; name: string }[]
  cars: { id: number; name: string; cost: number; modelo: string; marca: string }[]
  id_role?: number // 👈 Prop para evaluar las restricciones por rol del usuario logueado
}

export default function SoldepoModal(props: Props) {
  if (!props.open) return null

  const title =
    props.mode === "create"
      ? "REGISTRO NUEVA SOLICITUD DE DEPOSITO"
      : "EDITAR SOLICITUD"

  // 🔒 LÓGICA DINÁMICA DE FILTRADO PARA SOLICITANTES (Para todos los roles)
  // Filtra los empleados de manera reactiva según la sucursal seleccionada en el formulario
  const filteredEmployees = props.form.id_branch
    ? props.employees.filter(e => Number(e.id_branch) === Number(props.form.id_branch))
    : []

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 md:p-10">
      {/* 👈 Corregido 'w-200' por un ancho responsivo estándar max-w-2xl */}
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

          {/* Sucursal */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Sucursal
            </label>
            <select
              name="id_branch"
              value={props.form.id_branch || ""}
              onChange={props.onChange}
              disabled={props.id_role === 3} // 👈 Bloqueado dinámicamente si el rol es 3
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed text-sm"
            >
              <option value="">Seleccione la Sucursal</option>
              {props.branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name_branch}
                </option>
              ))}
            </select>
          </div>

          {/* Empleado / Solicitante */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Solicitante
            </label>
            <select
              name="id_employee"
              value={props.form.id_employee || ""}
              onChange={props.onChange}
              disabled={!props.form.id_branch} // Deshabilitado si no hay sucursal elegida previamente
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

          {/* Cliente */}      
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Cliente
            </label>
            <select
              name="id_customer"
              value={props.form.id_customer || ""}
              onChange={props.onChange}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm"
            >
              <option value="">Seleccione el Cliente</option>
              {props.customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select> 
          </div>

          {/* Vehiculo */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Vehículo
            </label>
            <select
              name="id_car"
              value={props.form.id_car || ""}
              onChange={props.onChange}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm"
            >
              <option value="">Seleccione el Vehículo</option>
              {props.cars.map(car => (
                <option key={car.id} value={car.id}>
                  {car.marca} {car.name} ({car.modelo})
                </option>
              ))}
            </select> 
          </div>

          {/* Costo */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Costo Negociado
            </label>
            <input
              type="number"
              name="costo"   
              value={props.form.costo || ""}
              onChange={props.onChange}
              disabled={props.mode !== "create"}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
              placeholder="37000"
            />
          </div>

          {/* Cuota inicial / monto */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Cuota Inicial
            </label>
            <input
              type="number"
              name="amount"   
              value={props.form.amount || ""}
              onChange={props.onChange}
              disabled={props.mode !== "create"}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
              placeholder="2500"
            />
          </div>
         
          {/* Tipo de Venta */}         
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-black mb-1 italic">
              Tipo de Venta
            </label>
            <select
              name="type_sale"
              value={props.form.type_sale || ""}
              onChange={props.onChange}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm"
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
              Modo de Pago
            </label>
            <select
              name="type_pay"
              value={props.form.type_pay || ""}
              onChange={props.onChange}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm"
            >
              <option value="">Seleccione el Tipo de Pago</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Depósito en Cuenta">Depósito en Cuenta</option>    
              <option value="QR">QR</option>       
            </select> 
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
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="Depósito de reserva por vehículo"
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
