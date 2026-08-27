import { useEffect, useState } from 'react'
import { listAdmins } from '../api/client.js'

// The teachers in the caller's organization, for the owner-only pickers that
// have to name one. Mirrors useStudents, including the `enabled` flag: the
// endpoint is owner-only, so a teacher must never issue the request — it would
// 403 and paint an error banner on a page that is otherwise working for them.
export function useAdmins(accessToken, { enabled = true } = {}) {
  const [status, setStatus] = useState(enabled ? 'loading' : 'idle')
  const [admins, setAdmins] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    setStatus('loading')

    listAdmins(accessToken)
      .then((body) => {
        if (!cancelled) {
          setAdmins(body.admins || [])
          setStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err.body && err.body.message) || err.message)
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, enabled])

  return { admins, status, error }
}
