import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import AppShell from '../components/AppShell.jsx'

export default function ProtectedRoute({ children, role }) {
  const { accessToken, user, initializing } = useAuth()

  if (initializing) {
    return (
      <div className="route-loading">
        <p className="loading-text">Loading...</p>
      </div>
    )
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (role && (!user || user.role !== role)) {
    return (
      <div className="route-loading">
        <p role="alert">You don&apos;t have access to this page.</p>
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}
