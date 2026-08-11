import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import AuroraPanel from '../components/auth/AuroraPanel.jsx'

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
    // 50/50 split on md+ (Feature 4): left half is the form column (every
    // field/handler/state below unchanged, and kept inline rather than via the
    // shared component since AuthCard itself must stay untouched for
    // Register/Status); right half is the decorative animated panel, hidden
    // below md so the form stays content-first on mobile instead of pushed
    // below the fold.
    //
    // The grid sits inside an inset rounded frame rather than running
    // full-bleed, so the auth surface reads as one floating card against the
    // darker page ground. `overflow-hidden` on the frame is load-bearing: the
    // aurora blobs are wider than their panel and would otherwise paint
    // straight over the rounded corners.
    <div className="min-h-screen bg-dark p-3 sm:p-4">
      <div className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-dark-border bg-background sm:min-h-[calc(100vh-2rem)] md:grid-cols-2">
        <main className="flex flex-col justify-center gap-6 px-5 py-10 sm:px-8">
          <div className="mx-auto flex w-full max-w-(--narrow-max-width) flex-col gap-5 [--narrow-max-width:26rem]">
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
                  {/*
                    Reset sits beside the password label, where someone who has
                    just failed to log in is already looking — not buried under
                    the form with the secondary links.
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
            {/*
              The way into organization signup from the auth screens. Students
              and teachers arrive here by invitation and never need it, so it
              sits below the form as a quiet secondary action rather than
              beside the primary button.
            */}
            <p className="text-sm text-muted-foreground">
              Setting up a new studio?{' '}
              <Link to="/register-organization" className="font-medium text-primary hover:underline">
                Create an organization
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              <Link to="/status" className="font-medium text-muted-foreground hover:text-primary">
                Server status
              </Link>
            </p>
          </div>
        </main>
        {/*
          Decorative only, so it stays aria-hidden and carries no heading that
          would compete with the form's own <h1>. Content is pinned to the
          bottom with justify-end: the headline sitting low, against open space
          above it, is what keeps the panel feeling unhurried rather than
          filled. The mixed-weight headline — most of the line muted, the clause
          that matters at full strength — lets one sentence carry emphasis
          without a second type size.
        */}
        <aside
          aria-hidden="true"
          className="relative hidden flex-col justify-end overflow-hidden bg-dark p-10 lg:p-12 md:flex"
        >
          <AuroraPanel />
          {/*
            The aurora has to stay bright enough to read as color, but the
            headline sits on top of it and orgThemes ships accents as light as
            amber and lime. A bottom-weighted scrim darkens only the band the
            text occupies, so the copy keeps its contrast on every palette
            without dimming the whole panel to compensate for the worst case.
          */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-dark/80 via-dark/40 to-transparent" />
          <div className="relative z-10">
            <p className="max-w-sm text-balance font-heading text-3xl leading-snug text-dark-muted lg:text-4xl">
              Plan the week.{' '}
              <span className="text-white">Teach the lesson.</span>
            </p>
            <p className="mt-4 max-w-xs text-pretty text-sm text-dark-muted">
              Your studio&rsquo;s schedule, students, and lesson records in one place.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
