import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerOrganization } from '../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import AuthLayout from '@/components/auth/AuthLayout'
import PasswordInput from '@/components/auth/PasswordInput'
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from '@/components/auth/validation'

function validateFields({ organizationName, name, email, password }) {
  if (!organizationName.trim()) return 'Organization name is required.'
  if (!name.trim()) return 'Your name is required.'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return null
}

// Organization signup. Deliberately ONE form rather than "create org, then
// invite yourself": the server creates the organization and its owner in a
// single transaction, so an organization can never exist without an owner and
// there is no half-finished state for a user to get stuck in.
//
// The account created here is the OWNER — the top of the hierarchy
// (owner > manager > admin > student), with full visibility across its own
// organization. Teachers (admins) and managers are added afterwards, by
// invitation, from inside the app.
export default function RegisterOrganizationPage() {
  const navigate = useNavigate()

  const [organizationName, setOrganizationName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldError, setFieldError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError(null)

    const validationError = validateFields({ organizationName, name, email, password })
    if (validationError) {
      setFieldError(validationError)
      return
    }
    setFieldError(null)
    setSubmitting(true)

    try {
      await registerOrganization({
        organization_name: organizationName,
        name,
        email,
        password
      })
      // Signup returns no tokens (same contract as invitation signup), so the
      // owner logs in normally afterwards. `registered` is what makes the
      // login page confirm the account was created — without it the owner
      // lands on a bare login form with no sign anything happened.
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      setSubmitError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your organization"
      description="Set up your studio and its owner account in one step."
      aside={{
        headline: 'One studio.',
        emphasis: 'Every lesson accounted for.',
        sub: 'Add your teachers and students once the studio is set up.',
      }}
      footer={
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-muted-foreground hover:text-primary">
            Already have an account? Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="organizationName">Organization name</FieldLabel>
            <Input
              id="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Violin Studio"
              autoComplete="organization"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="name">Your name</FieldLabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
            {submitting ? 'Creating...' : 'Create organization'}
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
