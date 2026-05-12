import { useState, useEffect } from "react"
import { X, Save, Info } from "lucide-react"
import type { CommissionDetail } from "@/types/commission"

type Props = {
  open: boolean
  onClose: () => void
  details: CommissionDetail[]
  historyCount: number
  onToggle: (id: number) => void
  onSelectAll: (value: boolean) => void
  onChangeAmount: (id: number, value: number) => void
  total: number // Total Bruto (sumatoria de comisiones seleccionadas)
  onPay: (discount: number, detail: string) => void
}

export default function CommissionModal(props: Props) {
  const [discount, setDiscount] = useState(0)
  const [note, setNote] = useState("")

  // Reiniciar campos al abrir el modal
  useEffect(() => {
    if (props.open) {
      setDiscount(0)
      setNote("")
    }
  }, [props.open])

  if (!props.open) return null

  const selectedCount = props.details.filter(d => d.selected).length
  const allSelected = props.details.length > 0 && props.details.every(d => d.selected)
  const totalFinal = props.total - discount

  // Validaciones: Debe haber ítems seleccionados y el total no puede ser negativo
  const isInvalid = selectedCount === 0 || totalFinal < 0

  const formatBs = (val: number) => 
    new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(val)

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">LIQUIDACIÓN DE COMISIONES</h2>
            <p className="text-xs text-slate-500 font-medium uppercase mt-1">
              Pagos históricos realizados: <span className="text-blue-600">{props.historyCount}</span>
            </p>
          </div>
          <button onClick={props.onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* TABLA DE DETALLE */}
          <div className="border rounded-xl overflow-hidden shadow-sm mb-6">
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-center w-12">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={allSelected}
                        onChange={(e) => props.onSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="p-3 font-semibold">ID Trans.</th>
                    <th className="p-3 font-semibold text-right">Monto Venta</th>
                    <th className="p-3 font-semibold text-right">Comisión a Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {props.details.map(d => (
                    <tr key={d.id} className={`hover:bg-slate-50 transition-colors ${d.selected ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={!!d.selected}
                          onChange={() => props.onToggle(d.id)}
                        />
                      </td>
                      <td className="p-3 font-mono text-slate-500">#{d.id}</td>
                      <td className="p-3 text-right font-medium">{formatBs(Number(d.amount))}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <span className="text-xs text-slate-400">Bs.</span>
                          <input
                            type="number"
                            value={d.commission_paid_amount}
                            onChange={(e) => props.onChangeAmount(d.id, Number(e.target.value))}
                            className="border border-slate-300 px-2 py-1 w-28 rounded-md text-right font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            min="0"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AJUSTES Y DESCUENTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  Monto de Descuento (Bs.)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="border border-slate-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700">Motivo del Descuento</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="border border-slate-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none text-sm"
                  placeholder="Ej: Deducción por faltante, penalización..."
                />
              </div>
            </div>

            {/* RESUMEN FINANCIERO */}
            <div className="flex flex-col justify-end items-end space-y-2 pb-2">
              <div className="flex justify-between w-full max-w-150 text-slate-600">
                <span>Comisiones seleccionadas:</span>
                <span className="font-semibold">{selectedCount}</span>
              </div>
              <div className="flex justify-between w-full max-w-150 text-slate-600 border-b pb-2">
                <span>Total Bruto:</span>
                <span className="font-semibold">{formatBs(props.total)}</span>
              </div>
              <div className="flex justify-between w-full max-w-150 text-red-600 font-medium">
                <span>Descuento aplicado:</span>
                <span>- {formatBs(discount)}</span>
              </div>
              <div className="flex justify-between w-full max-w-150 pt-4">
                <span className="text-lg font-bold text-slate-800">TOTAL NETO:</span>
                <span className="text-2xl font-black text-emerald-600">{formatBs(totalFinal)}</span>
              </div>
              {totalFinal < 0 && (
                <p className="text-xs text-red-500 font-bold mt-2 italic flex items-center gap-1">
                  <Info size={14} /> El descuento no puede superar al total calculado.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="p-5 border-t bg-slate-50 flex justify-end gap-3">
          <button
            onClick={props.onClose}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold transition-all"
          >
            <X size={20} /> Cancelar
          </button>

          <button
            disabled={isInvalid}
            onClick={() => props.onPay(discount, note)}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-white shadow-lg transition-all ${
              isInvalid
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
            }`}
          >
            <Save size={20} /> PROCESAR PAGO
          </button>
        </div>
      </div>
    </div>
  )
}
