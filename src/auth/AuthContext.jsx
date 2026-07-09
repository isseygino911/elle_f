import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, logout as apiLogout, refresh as apiRefresh } from '../api/client.js'

// Decodes the payload of a JWT for display purposes only (e.g. showing the
// user's name). This does NOT verify the token's signature — that requires
// the server's private key and happens server-side on every request.
function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Access token lives only in memory (React state) — never localStorage or
  // sessionStorage — to limit exposure if the app is ever compromised by XSS.
  const [accessToken, setAccessToken] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false

    apiRefresh()
      .then((body) => {
        if (!cancelled) setAccessToken(body.accessToken)
      })
      .catch(() => {
        if (!cancelled) setAccessToken(null)
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const body = await apiLogin(credentials)
    setAccessToken(body.accessToken)
    return body
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      setAccessToken(null)
    }
  }, [])

  // The JWT's own subject claim is `sub` (JWT spec), not `id` — every call
  // site in this app reads `user.id`, so that mapping happens once, here,
  // rather than requiring every consumer to know about `sub`.
  const user = useMemo(() => {
    if (!accessToken) return null
    const payload = decodeJwtPayload(accessToken)
    return payload ? { ...payload, id: payload.sub } : null
  }, [accessToken])

  const value = useMemo(
    () => ({ accessToken, user, initializing, login, logout }),
    [accessToken, user, initializing, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
