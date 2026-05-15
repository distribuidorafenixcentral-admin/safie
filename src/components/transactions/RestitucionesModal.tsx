import { useState, useEffect, type ChangeEvent } from "react"
import { X, Check } from "lucide-react"
import type { RestitutionWithRelations } from "@/types/restitution"

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (data: {
    amount: number
    detail: string
    type_pay: string
    id_cuenta: number | null
  }) => void
  selectedItem: RestitutionWithRelations | null
  cuentas: {
    id: number
    numero_cta: string
    banco: string
    titular: string
    status: number
  }[]
}

export default function RestitucionesModal({ open, onClose, onConfirm, selectedItem, cuentas }: Props) {
  // 🔹 Estados para los 4 campos adicionales solicitados
  const [amount, setAmount] = useState<string>("")
  const [detail, setDetail] = useState<string>("")
  const [typePay, setTypePay] = useState<string>("")
  const [idCuenta, setIdCuenta] = useState<string>("")

  // Restablecer los campos cada vez que el modal se abra o cambie el registro leído
  useEffect(() => {
    if (open && selectedItem) {
      setAmount(String(selectedItem.amount || ""))
      setDetail("")
      setTypePay("")
      setIdCuenta("")
    }
  }, [open, selectedItem])

  if (!open || !selectedItem) return null

  // 🏦 Regla: El selector de recursos dinámico se requiere si el tipo de pago NO es Efectivo
  const requiresCuenta = typePay !== "" && typePay !== "Efectivo"

  // 🔒 Limpiar la cuenta si el usuario cambia el tipo de pago de regreso a Efectivo
  const handleTypePayChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setTypePay(val)
    if (val === "Efectivo") {
      setIdCuenta("")
    }
  }

  // 🚫 Validaciones básicas para evitar envíos con datos corruptos o vacíos
  const isInvalid =
    !amount || 
    Number(amount) <= 0 || 
    Number(amount) > selectedItem.amount || // No se puede devolver más de lo depositado
    !detail.trim() || 
    !typePay || 
    (requiresCuenta && !idCuenta)

  const handleSubmit = () => {
    if (isInvalid) return
    onConfirm({
      amount: Number(amount),
      detail: detail.trim(),
      type_pay: typePay,
      id_cuenta: requiresCuenta ? Number(idCuenta) : null
    })
  }

  const formatBs = (val: number) =>
    new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(val)

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-fadeIn max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">
              PROCESAR RESTITUCIÓN DE FONDOS
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Enlace directo al depósito original <span className="font-mono text-blue-700 font-bold">#{selectedItem.id}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO DEL FORMULARIO */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* 🔒 SECCIÓN 1: DATOS LEÍDOS DE ORIGEN (BLOQUEADOS) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div className="col-span-2 border-b border-slate-200 pb-1 mb-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider">Información del Depósito Origen</span>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Sucursal:</p>
              <p className="font-semibold text-slate-700">{selectedItem.branches?.name_branch || "No indicada"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Empleado Solicitante:</p>
              <p className="font-semibold text-slate-700">{selectedItem.employees?.name || "No indicado"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Tipo Venta / Pago Original:</p>
              <p className="font-semibold text-slate-700">{selectedItem.type_sale || "S/V"} — {selectedItem.type_pay || "S/P"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Fecha de Confirmación:</p>
              <p className="font-semibold text-slate-700">
                {selectedItem.confirmed_at ? new Date(selectedItem.confirmed_at).toLocaleDateString("es-BO") : "S/F"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 font-medium">Monto Máximo del Depósito Base:</p>
              <p className="font-bold text-slate-900 text-sm">{formatBs(selectedItem.amount)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 font-medium">Nota de Comisión Registrada:</p>
              <p className="text-slate-600 italic bg-white p-2 rounded border border-slate-100 mt-0.5">
                {selectedItem.commission_note || "Sin observaciones previas."}
              </p>
            </div>
          </div>

          {/* ⚡ SECCIÓN 2: NUEVOS CAMPOS DEL FORMULARIO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block border-b pb-1 mb-2">
                Especificaciones de la Devolución
              </span>
            </div>

            {/* 1. Input: Monto a devolver */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Monto a Devolver (Bs.)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-slate-300 p-2 text-sm rounded-lg shadow-sm font-bold text-rose-700 bg-rose-50/20 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                placeholder="0.00"
                min="1"
                max={selectedItem.amount}
              />
              {Number(amount) > selectedItem.amount && (
                <span className="text-[10px] text-red-600 font-bold italic">
                  No puede exceder el monto original de {formatBs(selectedItem.amount)}.
                </span>
              )}
            </div>

            {/* 2. Input: Tipo de pago */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Tipo de Pago / Egreso
              </label>
              <select
                value={typePay}
                onChange={handleTypePayChange}
                className="border border-slate-300 p-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-white"
              >
                <option value="">Seleccione el tipo de pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="QR">Código QR</option>
                <option value="Depósito en Cuenta">Depósito en Cuenta</option>
              </select>
            </div>

            {/* 3. Select: Recursos (Dinámico en base al tipo de pago) */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Recursos de Destino (Cuenta Bancaria)
              </label>
              <select
                value={idCuenta}
                onChange={(e) => setIdCuenta(e.target.value)}
                disabled={!requiresCuenta}
                className="border border-slate-300 p-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {requiresCuenta ? "Seleccione la cuenta de donde saldrá el dinero" : "No aplica para egresos en Efectivo"}
                </option>
                {cuentas
                  .filter((c) => c.status === 1)
                  .map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.banco} — N° {c.numero_cta} ({c.titular})
                    </option>
                  ))}
              </select>
            </div>

            {/* 4. Input: Detalle */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Detalle / Motivo de la Restitución
              </label>
              <input
                type="text"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="border border-slate-300 p-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Devolución por anulación de contrato, corrección de depósito..."
              />
            </div>
          </div>
        </div>

        {/* ACCIONES DEL BOTÓN */}
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-sm font-semibold rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isInvalid}
            onClick={handleSubmit}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
              isInvalid
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-red-600 hover:bg-red-700 active:scale-95"
            }`}
          >
            <Check size={16} />
            Efectuar Devolución
          </button>
        </div>

      </div>
    </div>
  )
}
