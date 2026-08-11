import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import AuthLayout from '@/components/auth/AuthLayout'
import { EMAIL_PATTERN } from '@/components/auth/validation'

// Step one of password reset: ask for the link.
//
// No role selection, and none is possible: users.email is globally unique, so
// the address alone identifies exactly one account across every organization.
// Asking "are you a student or a teacher?" here would be a question the system
// can already answer, and a wrong answer would only be a way to fail.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError(null)

    if (!EMAIL_PATTERN.test(email)) {
      setFieldError('Enter a valid email address.')
      return
    }
    setFieldError(null)
    setSubmitting(true)

    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setSubmitError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // The confirmation deliberately does NOT say "we sent you an email" as a
  // statement of fact, because the server will not reveal whether the address
  // matched an account — it responds identically either way. Wording it
  // conditionally keeps the page honest and keeps the non-disclosure intact:
  // a phrase like "check your inbox" would imply an account exists. The panel
  // copy on this state is bound by the same rule, not just the body text.
  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        aside={{
          headline: 'Sent, if we found it.',
          emphasis: 'Links last one hour.',
          sub: 'Nothing arrives if the address has no account.',
        }}
        footer={
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-muted-foreground hover:text-primary">
              Back to log in
            </Link>
          </p>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            If <span className="font-medium text-foreground">{email.trim()}</span> is registered, a
            password reset link is on its way. The link expires in one hour.
          </p>
          <p className="text-sm text-muted-foreground">
            Didn’t get it? Check your spam folder, or{' '}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="font-medium text-primary hover:underline"
            >
              try a different address
            </button>
            .
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter the email address you use to sign in and we’ll send you a link to choose a new password."
      aside={{
        headline: 'Locked out?',
        emphasis: 'Back in a minute.',
        sub: 'We’ll email you a link to choose a new password.',
      }}
      footer={
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-muted-foreground hover:text-primary">
            Back to log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={submitting}
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
            {submitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
