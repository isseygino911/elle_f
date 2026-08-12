import { useState } from 'react'
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { canBroadcast, canChooseBroadcastAudience } from '../../lib/roles.js'
import { createBroadcast } from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const AUDIENCES = ['students', 'teachers', 'both']

// Compose, rendered into the detail pane at `/broadcasts/new` -- the
// InvitationCreatePage shape. A route rather than a dialog because the form is
// a page's worth of controls, and because a successful send has somewhere to
// land: the announcement's own detail page, with its reach in the insight
// rail.
export default function BroadcastComposePage() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { reload } = useOutletContext() ?? {}

  const canPickAudience = canChooseBroadcastAudience(user)

  // A teacher has no audience choice: their announcement always goes to their
  // own roster. Held in state anyway so the submit path is identical for both
  // roles, matching InvitationCreatePage's handling of the same situation.
  const [audience, setAudience] = useState('students')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // canReadBroadcasts admits a manager to this layout, and a manager can never
  // compose -- the server refuses their POST. Guarding here rather than with a
  // nested ProtectedRoute: that component renders its own <AppShell>, so
  // wrapping a child of an already-protected layout route would draw the shell
  // twice.
  if (!canBroadcast(user)) {
    return <Navigate to="/broadcasts" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const payload = await createBroadcast(accessToken, {
        // A teacher's audience is fixed server-side too -- sending anything
        // else earns a 403. This mirrors that rather than trusting the state.
        audience: canPickAudience ? audience : 'students',
        title: title.trim(),
        body: body.trim(),
      })

      // Awaited, unlike InvitationCreatePage's deliberately fire-and-forget
      // reload: we are about to navigate to a detail page that is served out
      // of this list, so navigating before the row is in it lands on the
      // not-found branch.
      //
      // Swallowed on failure rather than blocking the navigation -- the
      // announcement did send, and the detail page's own error branch is a
      // better place to say the list could not be refreshed than trapping the
      // user in a form whose work already succeeded.
      if (reload) await reload().catch(() => {})

      navigate(`/broadcasts/${payload.broadcast.id}`)
    } catch (err) {
      // The one predictable, translatable failure of this form: a teacher
      // whose roster is still empty. Everything else is unexpected, so it
      // surfaces the server's own message.
      setError(err.status === 400 ? t('broadcasts.reachesNobody') : (err.body && err.body.message) || err.message)
      setSubmitting(false)
    }
  }

  const audienceHints = {
    students: t('broadcasts.audienceHintStudents'),
    teachers: t('broadcasts.audienceHintTeachers'),
    both: t('broadcasts.audienceHintBoth'),
  }

  const audienceLabels = {
    students: t('broadcasts.audienceStudents'),
    teachers: t('broadcasts.audienceTeachers'),
    both: t('broadcasts.audienceBoth'),
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="m-0">{t('broadcasts.composeTitle')}</h2>
            <p className="m-0 text-sm text-muted-foreground">{t('broadcasts.composeMeta')}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {canPickAudience ? (
                <Field>
                  <FieldLabel htmlFor="broadcast-audience">{t('broadcasts.audience')}</FieldLabel>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger id="broadcast-audience">
                      {/* Base UI renders the raw value unless SelectValue is
                          given this render-prop, so map the enum back to its
                          label -- otherwise the trigger reads "both" while
                          the open list says "Everyone". Same treatment as
                          LibraryUploadPage and InvitationCreatePage. */}
                      <SelectValue>{(current) => audienceLabels[current] || current}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIENCES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {audienceLabels[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>{audienceHints[audience]}</FieldDescription>
                </Field>
              ) : (
                // A one-option dropdown would be noise. The teacher is told
                // where this goes instead of being asked.
                <FieldDescription>{t('broadcasts.audienceRosterHint')}</FieldDescription>
              )}

              <Field>
                <FieldLabel htmlFor="broadcast-title">{t('broadcasts.subject')}</FieldLabel>
                <Input
                  id="broadcast-title"
                  value={title}
                  maxLength={255}
                  placeholder={t('broadcasts.subjectPlaceholder')}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="broadcast-body">{t('broadcasts.message')}</FieldLabel>
                <Textarea
                  id="broadcast-body"
                  value={body}
                  rows={4}
                  maxLength={5000}
                  placeholder={t('broadcasts.messagePlaceholder')}
                  onChange={(event) => setBody(event.target.value)}
                  required
                />
              </Field>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Button type="submit" disabled={submitting || !title.trim() || !body.trim()}>
                  {submitting ? t('broadcasts.sending') : t('broadcasts.send')}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </section>
      </div>
    </div>
  )
}
