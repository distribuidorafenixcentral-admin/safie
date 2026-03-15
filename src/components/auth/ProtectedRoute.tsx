import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

interface Props {
  session: any
  children: ReactNode
}

export default function ProtectedRoute({ session, children }: Props) {

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}