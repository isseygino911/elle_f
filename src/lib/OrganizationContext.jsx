import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { getOrganization } from '../api/client.js'
import { applyThemeToDocument, DEFAULT_ORGANIZATION_THEME } from './orgThemes.js'

// The signed-in user's organization, fetched once and shared.
//
// A context rather than a hook call per consumer: the sidebar renders the name
// on every authenticated page, and the settings page needs the same value.
// Two independent fetches of an almost-never-changing row would mean two
// requests per navigation and, worse, a stale sidebar sitting next to a
// freshly renamed org.
//
// Deliberately tolerant of failure. The organization name is decoration on
// every screen except its own settings page, so a failed fetch leaves
// `organization` null and callers fall back — it must never block rendering
// the app or surface an error banner on an unrelated page.
const OrganizationContext = createContext(null)

export function OrganizationProvider({ children }) {
  const { accessToken } = useAuth()

  const [organization, setOrganization] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  useEffect(() => {
    // Logged out: drop any previous tenant's name rather than leaving it on
    // screen for the next person to sign in on this browser.
    if (!accessToken) {
      setOrganization(null)
      setStatus('idle')
      return undefined
    }

    let cancelled = false
    setStatus('loading')

    getOrganization(accessToken)
      .then((body) => {
        if (cancelled) return
        setOrganization(body.organization)
        setStatus('success')
      })
      .catch(() => {
        // Swallowed on purpose — see the note above.
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [accessToken])

  // Paint the organization's accent palette onto <html>, where the app's
  // `@theme inline` accent variables resolve from — so the sidebar, the active
  // nav pill, focus rings and every other lime-accented control take the
  // tenant's color without a single component knowing a theme exists.
  //
  // Keyed on the slug rather than the organization object: applyOrganization
  // replaces that object on every save, and a rename should not trigger a
  // repaint of the whole palette.
  //
  // Falls back to the default while logged out or mid-fetch, which also
  // cleans up after a sign-out — otherwise the next person to sign in on this
  // browser would briefly see the previous tenant's brand color.
  const theme = (organization && organization.theme) || DEFAULT_ORGANIZATION_THEME

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  // Whether the palette on screen is the tenant's real one rather than the
  // default placeholder.
  //
  // Without this, a refresh paints themed UI twice: auth bootstrap finishes,
  // AppShell mounts its sidebar while this fetch is still in flight, the
  // default lime paints, and the saved color then replaces it a round trip
  // later. Visible enough that it reads as a bug rather than as loading.
  //
  // ProtectedRoute holds its existing "Loading..." screen until this is true.
  // That screen renders no themed UI at all, so the first themed paint is
  // already the right color and there is nothing to correct.
  //
  // 'error' counts as ready on purpose: a failed fetch leaves `organization`
  // null by design (see the note at the top of this file), so the default
  // palette IS the final answer and blocking on it would hang the whole app
  // behind decoration.
  const themeReady = !accessToken || status === 'success' || status === 'error'

  // Lets the settings page push a rename or a new palette straight into the
  // shared value, so the sidebar updates without a refetch or a page reload.
  const applyOrganization = useCallback((next) => {
    setOrganization(next)
    setStatus('success')
  }, [])

  return (
    <OrganizationContext.Provider value={{ organization, status, themeReady, applyOrganization }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
