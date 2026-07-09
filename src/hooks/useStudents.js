import { useEffect, useState } from 'react'
import { listStudents } from '../api/client.js'

export function useStudents(accessToken, { enabled = true } = {}) {
  const [status, setStatus] = useState(enabled ? 'loading' : 'idle')
  const [students, setStudents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    setStatus('loading')

    listStudents(accessToken)
      .then((body) => {
        if (!cancelled) {
          setStudents(body.students)
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

  return { students, status, error }
}
