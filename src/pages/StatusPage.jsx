import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHealth } from '../api/client.js'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AuthCard from '@/components/AuthCard'

export default function StatusPage() {
  const [status, setStatus] = useState('loading')
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getHealth()
      .then((body) => {
        setHealth(body)
        setStatus('success')
      })
      .catch((err) => {
        setError(err.body || { message: err.message })
        setStatus('error')
      })
  }, [])

  return (
    <AuthCard>
      <h1>Student CRM</h1>
      {status === 'loading' && <p className="animate-pulse text-sm text-muted-foreground">Checking connection...</p>}
      {status === 'success' && (
        <Alert variant="success" role="status">
          <AlertDescription>
            Server: {health.status} | Database: {health.db} | {health.timestamp}
          </AlertDescription>
        </Alert>
      )}
      {status === 'error' && (
        <Alert variant="destructive">
          <AlertDescription>
            Connection failed
            {error.status ? ` — status: ${error.status}` : ''}
            {error.db ? `, db: ${error.db}` : ''}
            {error.message ? ` — ${error.message}` : ''}
          </AlertDescription>
        </Alert>
      )}
      <p className="text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-muted-foreground hover:text-primary">
          Back to login
        </Link>
      </p>
    </AuthCard>
  )
}
