import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { getOrganization } from '../api/client.js'

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

  // Lets the settings page push a rename straight into the shared value, so
  // the sidebar updates without a refetch or a page reload.
  const applyOrganization = useCallback((next) => {
    setOrganization(next)
    setStatus('success')
  }, [])

  return (
    <OrganizationContext.Provider value={{ organization, status, applyOrganization }}>
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
