import { Navigate } from "react-router-dom"

type Props = {
  session: any
  children: React.ReactNode
}

export default function ProtectedRoute({ session, children }: Props) {

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children

}