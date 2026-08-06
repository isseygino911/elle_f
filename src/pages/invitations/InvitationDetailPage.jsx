import { useOutletContext, useParams } from 'react-router-dom'
import { useLanguage } from '@/lib/LanguageContext'
import { ROLES } from '../../lib/roles.js'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PageContainer, PageHeader, EmptyState } from '@/components/Page'

const STATUS_PILL = {
  pending: 'lime',
  used: 'success',
  expired: 'secondary',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// Whole days from now until `value`. Negative once past, which the caller
// treats as expired rather than rendering "in -3 days".
function daysUntil(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  )
}

// One invitation, read from the list the layout already fetched via
// outletContext — the API has no get-one endpoint, and adding a request for
// data sitting in memory would be a pointless round trip.
//
// created_at and expires_at have always been returned by the listing endpoint
// and were never rendered anywhere; this is where they earn their keep.
export default function InvitationDetailPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const outletContext = useOutletContext()

  const invitation = outletContext?.invitations?.find((candidate) => String(candidate.id) === String(id))

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

  // Covers both a bad id typed into the URL and the brief window after a
  // reload where the list has not arrived yet.
  if (!invitation) {
    return (
      <PageContainer>
        <PageHeader title={t('invitations.untitled')} />
        <EmptyState>{t('invitations.notFound')}</EmptyState>
      </PageContainer>
    )
  }

  const remaining = daysUntil(invitation.expires_at)

  return (
    <PageContainer>
      {/*
        An invitation with no name hint has nothing to identify it but its
        role, so the title falls back to the role label -- in which case the
        meta line must not repeat it back verbatim.
      */}
      <PageHeader
        title={invitation.student_name_hint || ROLE_LABELS[invitation.role] || t('invitations.untitled')}
        meta={invitation.student_name_hint ? ROLE_LABELS[invitation.role] || invitation.role : t('invitations.noNameHint')}
      />

      <Card>
        <CardContent>
          <DetailRow label={t('invitations.detailStatus')}>
            <Badge variant={STATUS_PILL[invitation.status] || 'outline'}>
              {STATUS_LABELS[invitation.status] || invitation.status}
            </Badge>
          </DetailRow>
          <Separator />
          <DetailRow label={t('invitations.detailRole')}>
            {ROLE_LABELS[invitation.role] || invitation.role}
          </DetailRow>
          <Separator />
          <DetailRow label={t('invitations.detailCreated')}>{formatDate(invitation.created_at)}</DetailRow>
          <Separator />
          <DetailRow label={t('invitations.detailExpires')}>
            {formatDate(invitation.expires_at)}
            {/* Only meaningful while the link still works. */}
            {invitation.status === 'pending' && remaining !== null && remaining >= 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {remaining === 0 ? t('invitations.expiresToday') : `${remaining}d`}
              </span>
            )}
          </DetailRow>
          {invitation.status === 'used' && (
            <>
              <Separator />
              <DetailRow label={t('invitations.acceptedBy')}>{invitation.accepted_by_name || '—'}</DetailRow>
            </>
          )}
        </CardContent>
      </Card>

      {/*
        The token is deliberately not in the listing response: it is the bearer
        credential, and re-displaying it would put every outstanding invitation
        in the org onto one screen. Say so plainly rather than leaving the
        reader hunting for a copy button that will never exist.
      */}
      <p className="m-0 text-sm text-muted-foreground">
        {invitation.status === 'pending' ? t('invitations.linkNotRecoverable') : t('invitations.linkSpent')}
      </p>
    </PageContainer>
  )
}
