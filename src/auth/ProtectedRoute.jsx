import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import AppShell from '../components/AppShell.jsx'

// Route guard.
//
// `roles` accepts an array of role names, or a predicate taking the user.
// It used to be a single string compared with strict equality, which could
// not express "owner OR admin" -- and with four roles in play, most guarded
// routes need exactly that. Prefer passing a helper from lib/roles.js
// (e.g. roles={canReadStudentDetail}) over hand-listing role strings, so the
// rule stays in one place and mirrors the server's.
//
// This is a rendering decision, never a security boundary: the role comes
// from an unverified client-side JWT decode. The server re-checks every
// request, so the worst case here is showing a page whose API calls then 403.
export default function ProtectedRoute({ children, roles }) {
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

  const allowed =
    !roles ||
    (typeof roles === 'function' ? roles(user) : user && roles.includes(user.role))

  if (!allowed) {
    return (
      <AppShell>
        <div className="route-loading">
          <p role="alert">You don&apos;t have access to this page.</p>
        </div>
      </AppShell>
    )
  }

  return <AppShell>{children}</AppShell>
}
