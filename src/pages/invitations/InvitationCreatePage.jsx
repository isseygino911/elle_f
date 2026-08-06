import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { isOwner, ROLES } from '../../lib/roles.js'
import { createInvitation } from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageContainer, PageHeader } from '@/components/Page'
import InsightCard from '@/components/records/InsightCard'

// Mirrors INVITABLE_ROLES in the server's invitations.route.js:
//   owner -> manager, admin, student
//   admin -> student only
// An admin must never be offered "invite an admin/manager" -- that would be a
// privilege-escalation path, and the server rejects it with 403 regardless.
// This list only decides what to DRAW; the server decides what to ALLOW.
const OWNER_INVITABLE_ROLES = [ROLES.STUDENT, ROLES.ADMIN, ROLES.MANAGER]

// The create half of /invitations, now its own route rendering into the
// layout's detail pane rather than sitting permanently above the list.
export default function InvitationCreatePage() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const outletContext = useOutletContext()

  const ownerCanPickRole = isOwner(user)

  const [studentNameHint, setStudentNameHint] = useState('')
  // Always 'student' for an admin, who has no role choice to make. Held in
  // state regardless so the submit path is identical for both roles.
  const [role, setRole] = useState(ROLES.STUDENT)
  const [link, setLink] = useState(null)
  // Kept alongside `link` so the result card describes the invitation that was
  // actually created, even after the form's own inputs are changed afterwards.
  const [issued, setIssued] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const ROLE_LABELS = {
    [ROLES.STUDENT]: t('invitations.roleStudent'),
    [ROLES.ADMIN]: t('invitations.roleAdmin'),
    [ROLES.MANAGER]: t('invitations.roleManager'),
  }

  const ROLE_HINTS = {
    [ROLES.STUDENT]: t('invitations.roleHintStudent'),
    [ROLES.ADMIN]: t('invitations.roleHintAdmin'),
    [ROLES.MANAGER]: t('invitations.roleHintManager'),
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setLink(null)
    setSubmitting(true)

    const trimmedName = studentNameHint.trim()

    try {
      const body = await createInvitation(accessToken, { studentNameHint: trimmedName, role })
      setLink(body.link)
      setIssued({ name: trimmedName, role })
      setStudentNameHint('')
      // Fire-and-forget: the link above is already on screen, so a failed
      // refresh must not turn a successful create into an error state.
      if (outletContext && outletContext.reload) outletContext.reload()
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title={t('invitations.createTitle')} meta={t('invitations.createMeta')} />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/*
                Only an owner is offered a choice. An admin may invite students
                and nothing else, so showing them a one-option dropdown would be
                noise -- they keep the plain name field and the implicit
                'student' role.
              */}
              {ownerCanPickRole && (
                <Field>
                  <FieldLabel htmlFor="invitation-role">{t('invitations.role')}</FieldLabel>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="invitation-role" className="w-full">
                      {/* Base UI renders the raw value unless given this
                          render-prop, so each role needs an explicit label. */}
                      <SelectValue>{(current) => ROLE_LABELS[current] || ROLE_LABELS[ROLES.STUDENT]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {OWNER_INVITABLE_ROLES.map((invitable) => (
                        <SelectItem key={invitable} value={invitable}>
                          {ROLE_LABELS[invitable]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>{ROLE_HINTS[role]}</FieldDescription>
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="student_name_hint">{t('invitations.nameHint')}</FieldLabel>
                <Input
                  id="student_name_hint"
                  type="text"
                  value={studentNameHint}
                  onChange={(event) => setStudentNameHint(event.target.value)}
                />
              </Field>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t('invitations.generating') : t('invitations.generate')}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/*
        The one moment the token is ever visible. The listing endpoint never
        returns it, so this is the only chance to copy the link -- hence the
        accent panel rather than a quiet row, and the explicit warning that it
        cannot be looked up again.
      */}
      {link && (
        <InsightCard
          tone="lime"
          title={`${t('invitations.issuedTitle')} · ${ROLE_LABELS[issued && issued.role] || ROLE_LABELS[ROLES.STUDENT]}`}
        >
          {issued && issued.name && <p className="m-0 font-semibold">{issued.name}</p>}
          <Field>
            <FieldLabel htmlFor="invitation-link">{t('invitations.linkLabel')}</FieldLabel>
            <Input
              id="invitation-link"
              type="text"
              readOnly
              value={link}
              onFocus={(event) => event.target.select()}
              className="bg-white/90 text-foreground"
            />
          </Field>
          <p className="m-0 text-xs opacity-90">{t('invitations.linkOnce')}</p>
        </InsightCard>
      )}
    </PageContainer>
  )
}
