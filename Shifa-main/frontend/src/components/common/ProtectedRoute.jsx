import { Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn, getCachedUser } from '@/api'

export function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation()
  const loggedIn = isLoggedIn()
  const user = getCachedUser()
  if (!loggedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'DOCTOR' ? '/doctor/dashboard' : '/portal/welcome'} replace />
  }
  return children
}
