import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Loader from "@/components/ui/Loader"

export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    const start = Date.now()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    const elapsed = Date.now() - start
    const minTime = 2500

    if (elapsed < minTime) {
      await new Promise(res => setTimeout(res, minTime - elapsed))
    }

    setLoading(false)

    if (error) {
      alert(error.message)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Iniciar sesión
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Entrar
        </button>

      </form>

    </div>
  )
}