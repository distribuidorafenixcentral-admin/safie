import { Loader2 } from "lucide-react"

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white gap-8">

      <Loader2 className="animate-spin text-purple-700" size={36} />

      <p className="text-sm text-gray-500">
        Verificando sesión...
      </p>

    </div>
  )
}