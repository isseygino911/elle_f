import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

// Feature 4 (login page only — Register/Status keep using the shared
// AuthCard shell untouched): a bespoke abstract illustration built from this
// app's own lime/violet/dark tokens via Tailwind's fill-*/stroke-* color
// utilities (never raw hex), not a stock photo or external image. A few soft
// overlapping circles plus a single connecting line and node dots — read as
// "connection / coaching / progress" per the task's design direction —
// deliberately sparse (generous negative space) to match PRODUCT.md's
// "considered, unhurried, precise" brand voice, not a busy decorative scene.
function BrandIllustration() {
  return (
    <svg viewBox="0 0 480 600" aria-hidden="true" className="h-auto w-full max-w-sm">
      <circle cx="120" cy="160" r="150" className="fill-violet" opacity="0.16" />
      <circle cx="340" cy="440" r="190" className="fill-lime" opacity="0.14" />
      <circle cx="270" cy="230" r="70" className="fill-violet" opacity="0.35" />
      <path
        d="M120 460 C 200 380, 220 260, 320 190"
        fill="none"
        className="stroke-lime"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="120" cy="460" r="9" className="fill-lime" />
      <circle cx="220" cy="330" r="6" className="fill-violet" />
      <circle cx="320" cy="190" r="9" className="fill-lime" />
      <circle cx="380" cy="120" r="5" className="fill-violet" opacity="0.8" />
    </svg>
  )
}

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
    // 50/50 split on md+ (Feature 4): left half is the plain centered-card
    // form shell AuthCard also uses (kept identical here rather than via the
    // shared component, since AuthCard itself must stay untouched for
    // Register/Status) with every field/handler/state below unchanged; right
    // half is a decorative dark illustration panel, hidden below md so the
    // form stays content-first on mobile instead of pushed below the fold.
    <div className="grid min-h-screen md:grid-cols-2">
      <main className="flex flex-col justify-center gap-6 px-5 py-6">
        <div className="mx-auto flex w-full max-w-(--narrow-max-width) flex-col gap-4 rounded-lg border border-border bg-background p-6 [--narrow-max-width:26rem]">
          <h1>Log in</h1>
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
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
          <p className="text-sm text-muted-foreground">
            <Link to="/status" className="font-medium text-muted-foreground hover:text-primary">
              Server status
            </Link>
          </p>
        </div>
      </main>
      <aside aria-hidden="true" className="hidden items-center justify-center bg-dark p-10 md:flex">
        <BrandIllustration />
      </aside>
    </div>
  )
}
