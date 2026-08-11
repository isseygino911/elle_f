import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { checkInvitation, register } from '../api/client.js'
import { useLanguage } from '@/lib/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import AuthLayout from '@/components/auth/AuthLayout'
import PasswordInput from '@/components/auth/PasswordInput'
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from '@/components/auth/validation'

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
  const { t } = useLanguage()

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

  // One AuthLayout for all three states, with only the body swapping. Returning
  // a separate layout per branch would remount it when the invitation check
  // resolves, restarting the aurora and re-firing the field entrance.
  let body
  if (invitationStatus === 'loading') {
    body = (
      <p className="animate-pulse text-sm text-muted-foreground">
        {t('register.checkingInvitation')}
      </p>
    )
  } else if (invitationStatus === 'invalid') {
    body = (
      <Alert variant="destructive">
        <AlertDescription>{t('register.invitationInvalid')}</AlertDescription>
      </Alert>
    )
  } else {
    body = (
      <form onSubmit={handleSubmit} noValidate>
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
            <PasswordInput
              id="password"
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
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      aside={{
        headline: 'You have been invited.',
        emphasis: 'Set up your account.',
        sub: 'Your lessons and schedule will be waiting once you are in.',
      }}
      footer={
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-muted-foreground hover:text-primary">
            Already have an account? Log in
          </Link>
        </p>
      }
    >
      {body}
    </AuthLayout>
  )
}
