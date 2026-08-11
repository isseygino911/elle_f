import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import AuthLayout from '@/components/auth/AuthLayout'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = Boolean(location.state && location.state.registered)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch {
      // Generic message — don't reveal whether the email exists.
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Log in"
      aside={{
        headline: 'Plan the week.',
        emphasis: 'Teach the lesson.',
        sub: "Your studio's schedule, students, and lesson records in one place.",
      }}
      footer={
        <>
          {/*
            The way into organization signup from the auth screens. Students
            and teachers arrive here by invitation and never need it, so it
            sits below the form as a quiet secondary action rather than beside
            the primary button.
          */}
          <p className="text-sm text-muted-foreground">
            Setting up a new studio?{' '}
            <Link
              to="/register-organization"
              className="font-medium text-muted-foreground hover:text-primary"
            >
              Create an organization
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            <Link to="/status" className="font-medium text-muted-foreground hover:text-primary">
              Server status
            </Link>
          </p>
        </>
      }
    >
      {justRegistered && (
        <Alert variant="success" role="status">
          <AlertDescription>Account created. Please log in.</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field>
            {/*
              Reset sits beside the password label, where someone who has just
              failed to log in is already looking — not buried under the form
              with the secondary links.
            */}
            <div className="flex items-baseline justify-between gap-3">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
