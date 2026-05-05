import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"

import type { RestitutionWithRelations } from "@/types/restitution"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    parent_id: number
    amount: number
    discount: number
    note: string
  }) => void

  selected: (RestitutionWithRelations & { max_available: number }) | null
}

export default function RestitutionModal(props: Props) {

  const [amount, setAmount] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [note, setNote] = useState("")

  useEffect(() => {
    if (props.open) {
      setAmount(0)
      setDiscount(0)
      setNote("")
    }
  }, [props.open])

  if (!props.open || !props.selected) return null

  const available = props.selected.max_available
  const finalAmount = amount - discount

  // 🔥 VALIDACIONES
  const isInvalid =
    amount <= 0 ||
    finalAmount <= 0 ||
    amount > available

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-10">

      <div className="bg-white w-300 rounded-xl border shadow-lg p-6">

        {/* HEADER */}
        <div className="mb-4 border-b-2">
          <h2 className="text-lg font-bold italic text-blue-900">
            RESTITUCIÓN DE DEPÓSITO
          </h2>
        </div>

        {/* INFO */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">

          <div>
            <strong>Sucursal:</strong><br />
            {props.selected.branches?.name_branch || "-"}
          </div>

          <div>
            <strong>Empleado:</strong><br />
            {props.selected.employees?.name || "-"}
          </div>

          <div>
            <strong>Monto original:</strong><br />
            {props.selected.amount.toLocaleString()}
          </div>

          <div>
            <strong>Disponible:</strong><br />
            <span className="text-green-700 font-semibold">
              {available.toLocaleString()}
            </span>
          </div>

        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-4">

          {/* MONTO */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold italic">
              Monto a devolver
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="border p-1 rounded"
              min="0"
            />
          </div>

          {/* DESCUENTO */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold italic">
              Descuento
            </label>

            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="border p-1 rounded"
              min="0"
            />
          </div>

          {/* NOTA */}
          <div className="col-span-2 flex flex-col">
            <label className="text-sm font-semibold italic">
              Motivo / Observación
            </label>

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border p-1 rounded"
            />
          </div>

        </div>

        {/* RESUMEN */}
        <div className="mt-4 text-right">

          <p>Monto: {amount.toLocaleString()}</p>
          <p>Descuento: {discount.toLocaleString()}</p>

          <p className="text-lg font-bold text-green-700">
            Total a devolver: {finalAmount.toLocaleString()}
          </p>

        </div>

        {/* ERROR */}
        {amount > available && (
          <p className="text-red-600 text-sm mt-2">
            El monto excede el disponible
          </p>
        )}

        {/* BOTONES */}
        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={props.onClose}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded"
          >
            <X size={18} /> Cancelar
          </button>

          <button
            disabled={isInvalid}
            onClick={() =>
              props.onSubmit({
                parent_id: props.selected!.id,
                amount,
                discount,
                note
              })
            }
            className={`flex items-center gap-2 px-3 py-2 rounded text-white ${
              isInvalid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-800"
            }`}
          >
            <Save size={18} /> Confirmar
          </button>

        </div>

      </div>
    </div>
  )
}