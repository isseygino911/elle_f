import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { canBroadcast, canChooseBroadcastAudience, isManager } from '../lib/roles.js'
import { createBroadcast, listBroadcasts } from '../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageContainer, PageHeader } from '@/components/Page'

const AUDIENCES = ['students', 'teachers', 'both']

// t() resolves keys only -- it takes no interpolation arguments (see
// LanguageContext). Substituting here keeps that shared signature unchanged
// for one screen's sake, and the singular/plural split stays in the dictionary
// where a translator can see both forms.
function withCount(template, count) {
  return template.replace('{count}', String(count))
}

export default function BroadcastsPage() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()

  const canSend = canBroadcast(user)
  const canPickAudience = canChooseBroadcastAudience(user)
  // A manager reads the oversight feed and cannot compose. Derived from the
  // role helpers rather than from `!canSend`, which would also be true for a
  // student -- and a student never reaches this page at all.
  const oversightOnly = isManager(user)

  // A teacher has no audience choice: their announcement always goes to their
  // own roster. Held in state anyway so the submit path is identical for both
  // roles, matching InvitationCreatePage's handling of the same situation.
  const [audience, setAudience] = useState('students')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(null)

  const [broadcasts, setBroadcasts] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)

  const reload = useCallback(() => {
    let cancelled = false

    listBroadcasts(accessToken)
      .then((payload) => {
        if (cancelled) return
        setBroadcasts(payload.broadcasts)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError((err.body && err.body.message) || err.message)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [accessToken])

  useEffect(() => reload(), [reload])

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSent(null)
    setSubmitting(true)

    try {
      const payload = await createBroadcast(accessToken, {
        // A teacher's audience is fixed server-side too -- sending anything
        // else earns a 403. This mirrors that rather than trusting the state.
        audience: canPickAudience ? audience : 'students',
        title: title.trim(),
        body: body.trim(),
      })

      setSent(payload.broadcast)
      setTitle('')
      setBody('')
      reload()
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
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
    <PageContainer>
      <PageHeader title={t('broadcasts.title')} meta={t('broadcasts.meta')} />

      {canSend && (
        <Card>
          <CardHeader>
            <h2 className="m-0 text-base leading-snug font-medium">{t('broadcasts.composeTitle')}</h2>
          </CardHeader>
          <CardContent>
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

                {sent && (
                  <Alert>
                    <AlertDescription>
                      {t('broadcasts.sent')} —{' '}
                      {sent.recipient_count === 1
                        ? t('broadcasts.sentToOne')
                        : withCount(t('broadcasts.sentTo'), sent.recipient_count)}
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Button type="submit" disabled={submitting || !title.trim() || !body.trim()}>
                    {submitting ? t('broadcasts.sending') : t('broadcasts.send')}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      )}

      {oversightOnly && (
        <Alert>
          <AlertDescription>{t('broadcasts.oversightNote')}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <h2 className="m-0 text-base leading-snug font-medium">{t('broadcasts.historyTitle')}</h2>
        </CardHeader>
        <CardContent>
          {status === 'loading' && <p className="m-0 text-sm text-muted-foreground">…</p>}
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}
          {status === 'ready' && broadcasts.length === 0 && (
            <p className="m-0 text-sm text-muted-foreground">{t('broadcasts.empty')}</p>
          )}
          {status === 'ready' && broadcasts.length > 0 && (
            <ul className="flex flex-col">
              {broadcasts.map((broadcast) => (
                <li
                  key={broadcast.id}
                  className="flex flex-col gap-1.5 border-b border-border py-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{broadcast.title}</span>
                    <Badge variant="secondary">
                      {broadcast.recipient_count === 1
                        ? t('broadcasts.recipientCountOne')
                        : withCount(t('broadcasts.recipientCount'), broadcast.recipient_count)}
                    </Badge>
                  </div>

                  {/*
                    Absent for a manager: the server omits the key entirely
                    rather than blanking it, so this renders nothing at all
                    rather than an empty paragraph. Optional-chained because
                    "no body" is a legitimate shape here, not a missing value.
                  */}
                  {broadcast.body && (
                    <p className="m-0 text-sm whitespace-pre-wrap text-muted-foreground">{broadcast.body}</p>
                  )}

                  <span className="text-sm text-muted-foreground">
                    {broadcast.sender_name} · {audienceLabels[broadcast.audience] || broadcast.audience} ·{' '}
                    {new Date(broadcast.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
