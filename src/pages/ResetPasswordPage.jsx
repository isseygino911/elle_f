import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { checkResetToken, resetPassword } from '../api/client.js'
import { ROLES } from '../lib/roles.js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FieldGroup } from '@/components/ui/field'
import AuthLayout from '@/components/auth/AuthLayout'
import PasswordFields, { validateNewPassword } from '@/components/auth/PasswordFields'

// How each role is described back to the person resetting. The reset itself is
// identical for all four — this only changes the sentence they read, so they
// can tell at a glance that the link belongs to the account they expected
// (and spot it immediately if it doesn't).
const ROLE_DESCRIPTIONS = {
  [ROLES.OWNER]: 'organization owner',
  [ROLES.MANAGER]: 'manager',
  [ROLES.ADMIN]: 'teacher',
  [ROLES.STUDENT]: 'student',
}

const RESET_ASIDE = {
  headline: 'New password.',
  emphasis: 'Same studio.',
  sub: 'Choose something you have not used here before.',
}

// Step two of password reset: the link's destination.
//
// The role shown here is NOT asked for and not inferred from anything the
// visitor typed — it comes back from the server, which resolved it from the
// token's user row. That is the whole reason this flow needs no role picker:
// one token maps to one account, and the account carries its own role.
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState('checking') // checking | valid | invalid | done
  const [account, setAccount] = useState(null) // { name, role }

  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [fieldError, setFieldError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Validate the link before showing the form. Landing on a dead link and
  // only being told after typing a new password twice is a needless dead end.
  useEffect(() => {
    let cancelled = false

    if (!token) {
      setStatus('invalid')
      return undefined
    }

    checkResetToken(token)
      .then((body) => {
        if (cancelled) return
        if (body.valid) {
          setAccount({ name: body.name, role: body.role })
          setStatus('valid')
        } else {
          setStatus('invalid')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('invalid')
      })

    return () => {
      cancelled = true
    }
  }, [token])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError(null)

    const validationError = validateNewPassword(password, confirmation)
    if (validationError) {
      setFieldError(validationError)
      return
    }
    setFieldError(null)
    setSubmitting(true)

    try {
      await resetPassword({ token, password })
      setStatus('done')
    } catch (err) {
      // A token can expire between page load and submit, so this covers the
      // dead-link case a second time rather than assuming the earlier check
      // still holds.
      setSubmitError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'checking') {
    return (
      <AuthLayout title="Reset your password" aside={RESET_ASIDE}>
        <p className="animate-pulse text-sm text-muted-foreground">Checking your link...</p>
      </AuthLayout>
    )
  }

  if (status === 'invalid') {
    return (
      <AuthLayout
        title="Reset your password"
        aside={RESET_ASIDE}
        footer={
          // `text-primary` resolves to near-black on this light surface, which
          // made the only way out of a dead link look like plain body text.
          // Uses the same secondary-link treatment as the other auth pages.
          <p className="text-sm text-muted-foreground">
            <Link
              to="/forgot-password"
              className="font-medium text-muted-foreground hover:text-primary"
            >
              Request a new link
            </Link>
          </p>
        }
      >
        <Alert variant="destructive">
          <AlertDescription>
            This reset link is invalid or has expired. Reset links are valid for one hour and can
            only be used once.
          </AlertDescription>
        </Alert>
      </AuthLayout>
    )
  }

  // Terminal state: no form left to balance, so the panel is dropped and the
  // confirmation gets the full width to itself.
  if (status === 'done') {
    return (
      <AuthLayout
        title="Password updated"
        description="You can now log in with your new password. Any other reset links for this account have been cancelled."
      >
        {/*
          Reset does not sign anyone in — the server issues no tokens here, so
          a leaked link never becomes a live session on its own. The user logs
          in normally, exactly as after registration.
        */}
        <div>
          <Button onClick={() => navigate('/login', { replace: true })}>Go to log in</Button>
        </div>
      </AuthLayout>
    )
  }

  const roleDescription = account && ROLE_DESCRIPTIONS[account.role]

  return (
    <AuthLayout
      title="Choose a new password"
      aside={RESET_ASIDE}
      footer={
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-muted-foreground hover:text-primary">
            Back to log in
          </Link>
        </p>
      }
    >
      {account && (
        <p className="text-sm text-muted-foreground">
          Resetting the password for{' '}
          <span className="font-medium text-foreground">{account.name}</span>
          {roleDescription && <> — {roleDescription} account</>}.
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <PasswordFields
            password={password}
            confirmation={confirmation}
            onPasswordChange={setPassword}
            onConfirmationChange={setConfirmation}
            disabled={submitting}
            idPrefix="reset"
          />

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
            {submitting ? 'Updating...' : 'Update password'}
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
