import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { token, user } = useAuth()
  const location = useLocation()
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}


