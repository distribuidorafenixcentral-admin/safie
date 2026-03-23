type Props = {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmModal({
  open,
  title = "Confirmar",
  message = "¿Estás seguro?",
  confirmText = "Confirmar",
  onConfirm,
  onCancel,
  loading
}: Props) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50
      transition-opacity duration-200
      ${open ? "opacity-100 bg-black/40" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className={`bg-white p-6 rounded-lg w-80 shadow-lg
        transform transition-all duration-200
        ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <h2 className="font-semibold text-lg mb-4">
          {title}
        </h2>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}