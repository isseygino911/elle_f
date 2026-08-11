import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHealth } from '../api/client.js'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Deliberately NOT on the shared AuthLayout the auth forms use. This is a
// diagnostic page — no form, and its heading is the product name rather than
// anything the reader came here to do. Dressing a server health check in a
// decorative animated panel and a headline about teaching lessons is the wrong
// tone for a page you open when something is broken. The plain centred shell
// below is the whole of what it needs, kept local because one consumer is not
// an abstraction.
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
    <main className="mx-auto flex min-h-screen max-w-(--narrow-max-width) flex-col justify-center gap-6 px-5 py-6 [--narrow-max-width:26rem]">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-6">
        <h1 className="text-2xl leading-tight">Student CRM</h1>
        {status === 'loading' && (
          <p className="animate-pulse text-sm text-muted-foreground">Checking connection...</p>
        )}
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
      </div>
    </main>
  )
}
