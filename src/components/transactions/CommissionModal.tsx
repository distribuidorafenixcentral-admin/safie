import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import type { CommissionDetail } from "@/types/commission"

type Props = {
  open: boolean
  onClose: () => void

  details: CommissionDetail[]
  historyCount: number

  onToggle: (id: number) => void
  onSelectAll: (value: boolean) => void
  onChangeAmount: (id: number, value: number) => void

  total: number

  onPay: (discount: number, detail: string) => void
}

export default function CommissionModal(props: Props) {
  const [discount, setDiscount] = useState(0)
  const [note, setNote] = useState("")

  // 🔥 reset al abrir/cerrar
  useEffect(() => {
    if (props.open) {
      setDiscount(0)
      setNote("")
    }
  }, [props.open])

  if (!props.open) return null

  const allSelected =
    props.details.length > 0 &&
    props.details.every(d => d.selected)

  const totalFinal = props.total - discount

  // 🔥 validaciones básicas
  const isInvalid =
    props.details.filter(d => d.selected).length === 0 ||
    totalFinal < 0

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-10">

      <div className="bg-white w-300 rounded-xl border shadow-lg p-6">

        {/* HEADER */}
        <div className="mb-4 border-b-2">
          <h2 className="text-lg font-bold italic text-blue-900">
            PAGO DE COMISIONES
          </h2>
        </div>

        {/* INFO */}
        <div className="mb-4 text-sm">
          <p>Depósitos históricos pagados: {props.historyCount}</p>
        </div>

        {/* TABLA */}
        <div className="max-h-150 overflow-auto border rounded">

          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => props.onSelectAll(e.target.checked)}
                  />
                </th>
                <th className="p-2">ID</th>
                <th className="p-2">Monto</th>
                <th className="p-2">Comisión</th>
              </tr>
            </thead>

            <tbody>
              {props.details.map(d => (
                <tr key={d.id} className="border-t">

                  <td className="text-center p-2">
                    <input
                      type="checkbox"
                      checked={!!d.selected}
                      onChange={() => props.onToggle(d.id)}
                    />
                  </td>

                  <td className="p-2">{d.id}</td>

                  <td className="p-2">
                    {Number(d.amount).toLocaleString()}
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      value={d.commission_paid_amount}
                      onChange={(e) =>
                        props.onChangeAmount(
                          d.id,
                          Number(e.target.value)
                        )
                      }
                      className="border px-2 py-1 w-24 rounded"
                      min="0"
                    />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

        </div>

        {/* DESCUENTO */}
        <div className="mt-4 grid grid-cols-2 gap-4">

          <div className="flex flex-col">
            <label className="text-sm font-semibold italic">
              Descuento
            </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="border p-1 rounded"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold italic">
              Motivo del descuento
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border p-1 rounded"
              placeholder="Ej: retraso, penalización..."
            />
          </div>

        </div>

        {/* RESUMEN */}
        <div className="mt-4 text-right">

          <p>Total calculado: {props.total.toLocaleString()}</p>
          <p>Descuento: {discount.toLocaleString()}</p>

          <p className="font-bold text-lg text-green-700">
            Total a pagar: {totalFinal.toLocaleString()}
          </p>

        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={props.onClose}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-800"
          >
            <X size={18} /> Cancelar
          </button>

          <button
            disabled={isInvalid}
            onClick={() => props.onPay(discount, note)}
            className={`flex items-center gap-2 px-3 py-2 rounded text-white ${
              isInvalid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-800"
            }`}
          >
            <Save size={18} /> Pagar
          </button>

        </div>

      </div>
    </div>
  )
}