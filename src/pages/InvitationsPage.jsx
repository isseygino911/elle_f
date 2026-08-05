import { useState, useEffect, useCallback } from 'react'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { isOwner, ROLES } from '../lib/roles.js'
import { createInvitation, listInvitations } from '../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageContainer, PageHeader, BackLink, LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import RecordCard from '@/components/records/RecordCard'

// Mirrors INVITABLE_ROLES in the server's invitations.route.js:
//   owner -> manager, admin, student
//   admin -> student only
// An admin must never be offered "invite an admin/manager" -- that would be a
// privilege-escalation path, and the server rejects it with 403 regardless.
// This list only decides what to DRAW; the server decides what to ALLOW.
const OWNER_INVITABLE_ROLES = [ROLES.STUDENT, ROLES.ADMIN, ROLES.MANAGER]

// 'pending' is the one that still needs action, so it takes the lime accent
// that means exactly that everywhere else in the app. A used invitation is
// settled (success), an expired one is spent rather than wrong — muted, not
// destructive, since letting a link lapse is normal.
const STATUS_PILL = {
  pending: 'lime',
  used: 'success',
  expired: 'secondary',
}

export default function InvitationsPage() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()

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

  const [sent, setSent] = useState([])
  const [sentStatus, setSentStatus] = useState('loading') // loading | success | error
  const [sentError, setSentError] = useState(null)

  // Also called after a successful create so a newly issued invitation shows
  // up in the list below without a reload.
  const loadSent = useCallback(async () => {
    setSentStatus('loading')
    try {
      const body = await listInvitations(accessToken)
      setSent(body.invitations)
      setSentStatus('success')
    } catch (err) {
      setSentError((err.body && err.body.message) || err.message)
      setSentStatus('error')
    }
  }, [accessToken])

  useEffect(() => {
    loadSent()
  }, [loadSent])

  const ROLE_LABELS = {
    [ROLES.STUDENT]: t('invitations.roleStudent'),
    [ROLES.ADMIN]: t('invitations.roleAdmin'),
    [ROLES.MANAGER]: t('invitations.roleManager'),
  }

  const STATUS_LABELS = {
    pending: t('invitations.statusPending'),
    used: t('invitations.statusUsed'),
    expired: t('invitations.statusExpired'),
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
      // Fire-and-forget: the link above is already on screen, so a failed
      // refresh must not turn a successful create into an error state.
      loadSent()
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title={t('invitations.title')} />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/*
                Only an owner is offered a choice. An admin may invite students
                and nothing else, so showing them a one-option dropdown would be
                noise -- they keep the plain name field and the implicit
                'student' role, exactly as before this control existed.
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
              <Button type="submit" disabled={submitting}>
                {submitting ? t('invitations.generating') : t('invitations.generate')}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {link && (
        <ul className="flex flex-col gap-2">
          {/*
            The just-created invitation, kept separate from the list below
            because only this one can still show its link — the listing
            endpoint never returns tokens.
          */}
          <li>
            <RecordCard
              variant="light"
              icon={UserPlus}
              title={(issued && issued.name) || 'New invitation'}
              meta={link}
              // The pill names the role this link grants on redemption, which
              // is the one thing about a generated link that isn't recoverable
              // by looking at it.
              pillLabel={ROLE_LABELS[issued && issued.role] || ROLE_LABELS[ROLES.STUDENT]}
              pillVariant="lime"
            />
          </li>
        </ul>
      )}
      {link && (
        <Field>
          <FieldLabel htmlFor="invitation-link">{t('invitations.linkLabel')}</FieldLabel>
          <Input id="invitation-link" type="text" readOnly value={link} onFocus={(event) => event.target.select()} />
        </Field>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-base leading-snug font-medium">{t('invitations.sentTitle')}</h2>
        {sentStatus === 'loading' && <LoadingText>{t('invitations.sentLoading')}</LoadingText>}
        {sentStatus === 'error' && <ErrorAlert>{sentError}</ErrorAlert>}
        {sentStatus === 'success' &&
          (sent.length === 0 ? (
            <EmptyState>{t('invitations.sentEmpty')}</EmptyState>
          ) : (
            <ul className="flex flex-col gap-2">
              {sent.map((invitation) => (
                <li key={invitation.id}>
                  <RecordCard
                    variant="light"
                    icon={UserPlus}
                    // An invitation issued without a name hint has nothing to
                    // identify it but the role it grants, which the pill
                    // already says — so fall back to the role label rather
                    // than leaving the card's title empty.
                    title={invitation.student_name_hint || ROLE_LABELS[invitation.role] || t('invitations.untitled')}
                    // Role on the meta line, status in the pill: scanning this
                    // list is almost always "which invites are still
                    // outstanding", so status earns the more prominent slot.
                    meta={
                      invitation.status === 'used'
                        ? `${ROLE_LABELS[invitation.role] || invitation.role} · ${t('invitations.acceptedBy')} ${invitation.accepted_by_name || '—'}`
                        : ROLE_LABELS[invitation.role] || invitation.role
                    }
                    pillLabel={STATUS_LABELS[invitation.status] || invitation.status}
                    pillVariant={STATUS_PILL[invitation.status] || 'outline'}
                  />
                </li>
              ))}
            </ul>
          ))}
      </section>

      <BackLink to="/dashboard">{t('invitations.backToDashboard')}</BackLink>
    </PageContainer>
  )
}
