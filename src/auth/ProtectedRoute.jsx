import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { useOrganization } from '../lib/OrganizationContext.jsx'
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
  const { themeReady } = useOrganization()

  // Two waits, one screen. Auth bootstrap resolves the session; the
  // organization fetch that follows resolves the accent palette. Rendering
  // AppShell between them would paint the sidebar in the default color and
  // then visibly correct it once the real theme arrived, so the same
  // "Loading..." screen -- which carries no themed UI -- covers both.
  //
  // Redirect precedence matters: a signed-out visitor must go to /login
  // without waiting on anything, so the token check runs against
  // `initializing` alone and themeReady only ever delays an authenticated
  // render. themeReady is already true when there is no token, but ordering
  // the checks this way makes that independent of the flag's definition.
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

  if (!themeReady) {
    return (
      <div className="route-loading">
        <p className="loading-text">Loading...</p>
      </div>
    )
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
