import { createContext, useContext, useState } from "react"
import Toast from "@/components/ui/Toast"

type ToastType = "success" | "error"

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState("")
  const [type, setType] = useState<ToastType>("success")
  const [visible, setVisible] = useState(false)

  const showToast = (msg: string, t: ToastType = "success") => {
    setMessage(msg)
    setType(t)
    setVisible(true)

    setTimeout(() => {
      setVisible(false)
    }, 3000) // ⏱ 3 segundos
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <Toast message={message} type={type} visible={visible} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast debe usarse dentro de ToastProvider")
  return context.showToast
}