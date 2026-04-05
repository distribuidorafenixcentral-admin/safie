import { useState } from "react"

// Hook reutilizable para manejar formularios
export function useForm<T>({ initialValues }: { initialValues: T }) {

  // Estado del formulario
  const [form, setForm] = useState<T>(initialValues)

  // 🔹 Maneja cambios en inputs automáticamente
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 🔹 Permite setear valores manualmente (ej: editar)
  const setValues = (values: Partial<T>) => {
    setForm(prev => ({
      ...prev,
      ...values
    }))
  }

  // 🔹 Resetear formulario
  const resetForm = () => {
    setForm(initialValues)
  }

  return {
    form,
    setForm,
    handleChange,
    setValues,
    resetForm
  }
}