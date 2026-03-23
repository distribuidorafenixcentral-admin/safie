import { createContext, useContext, useState } from "react"
import ConfirmModal from "@/components/modals/ConfirmModal"

type ConfirmOptions = {
  title?: string
  message?: string
  confirmText?: string
  onConfirm: () => Promise<void> | void
}

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => void
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [loading, setLoading] = useState(false)

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts)
    setOpen(true)
  }

  const handleConfirm = async () => {
    if (!options?.onConfirm) return

    setLoading(true)
    await options.onConfirm()
    setLoading(false)
    setOpen(false)
  }

  const handleCancel = () => {
    if (loading) return
    setOpen(false)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* 🔥 SOLO UNA VEZ */}
      <ConfirmModal
        open={open}
        title={options?.title}
        message={options?.message}
        confirmText={options?.confirmText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={loading}
      />
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error("useConfirm debe usarse dentro de ConfirmProvider")
  return context.confirm
}