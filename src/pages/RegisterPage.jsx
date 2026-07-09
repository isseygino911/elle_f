import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { checkInvitation, register } from '../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import AuthCard from '@/components/AuthCard'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

function validateFields({ name, email, password }) {
  if (!name.trim()) return 'Name is required.'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return null
}

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [invitationStatus, setInvitationStatus] = useState('loading') // loading | valid | invalid
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldError, setFieldError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setInvitationStatus('invalid')
      return
    }

    let cancelled = false
    checkInvitation(token)
      .then((body) => {
        if (!cancelled) setInvitationStatus(body.valid ? 'valid' : 'invalid')
      })
      .catch(() => {
        if (!cancelled) setInvitationStatus('invalid')
      })

    return () => {
      cancelled = true
    }
  }, [token])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError(null)

    const validationMessage = validateFields({ name, email, password })
    if (validationMessage) {
      setFieldError(validationMessage)
      return
    }
    setFieldError(null)
    setSubmitting(true)

    try {
      await register({ token, name, email, password })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setSubmitError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (invitationStatus === 'loading') {
    return (
      <AuthCard>
        <h1>Create your account</h1>
        <p className="animate-pulse text-sm text-muted-foreground">Checking invitation...</p>
      </AuthCard>
    )
  }

  if (invitationStatus === 'invalid') {
    return (
      <AuthCard>
        <h1>Create your account</h1>
        <Alert variant="destructive">
          <AlertDescription>This invitation link is invalid or has expired.</AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-muted-foreground hover:text-primary">
            Back to login
          </Link>
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <h1>Create your account</h1>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              type="text"
              value={name}
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
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
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {fieldError && (
            <Alert variant="destructive">
              <AlertDescription>{fieldError}</AlertDescription>
            </Alert>
          )}
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </Button>
        </FieldGroup>
      </form>
      <p className="text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-muted-foreground hover:text-primary">
          Already have an account? Log in
        </Link>
      </p>
    </AuthCard>
  )
}
