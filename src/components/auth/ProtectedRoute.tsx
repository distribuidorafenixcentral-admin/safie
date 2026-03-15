import type { ReactNode } from "react"
import Login from "@/pages/auth/Login"

interface Props {
  session: any
  children: ReactNode
}

export default function ProtectedRoute({ session, children }: Props) {

  if (!session) {
    return <Login />
  }

  return <>{children}</>
}