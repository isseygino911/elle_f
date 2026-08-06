import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { UserPlus, Clock3, CheckCircle2, Plus } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { ROLES } from '../../lib/roles.js'
import { listInvitations } from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MasterDetailLayout from '@/components/records/MasterDetailLayout'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'

// Dark-themed override for the (light-by-default) shadcn Select, matching the
// filter treatment VideosLayout uses inside the same dark list panel.
const DARK_TRIGGER_CLASS =
  'h-7 w-full border-dark-border bg-dark-card-hover text-xs text-white data-placeholder:text-dark-muted focus-visible:border-lime focus-visible:ring-lime/50 [&_svg]:text-dark-muted'

// 'pending' is the one that still needs action, so it takes the lime accent
// that means exactly that everywhere else in the app. A used invitation is
// settled (success), an expired one is spent rather than wrong — muted, not
// destructive, since letting a link lapse is normal.
const STATUS_PILL = {
  pending: 'lime',
  used: 'success',
  expired: 'secondary',
}

const STATUS_FILTERS = ['all', 'pending', 'used', 'expired']

function formatCreated(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// The persistent master list panel + stat-tile row for `/invitations` and its
// children (MASTER.md Layout Pattern section). Replaces the single stacked
// InvitationsPage, which was the only list screen in the app not using this
// composition: the create form sat permanently above the list, so the thing
// you come back for was pushed below a form you use once.
//
// The fetch lives here rather than in a child because both the list and the
// detail pane read the same rows — the API has no get-one endpoint, so the
// detail is served out of this array via outletContext (the MessagesLayout
// precedent) instead of a per-invitation request.
export default function InvitationsLayout() {
  const { accessToken } = useAuth()
  const { t } = useLanguage()
  const { id: activeId } = useParams()

  const [invitations, setInvitations] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | error
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  // Also called by the create page after a successful create, so a newly
  // issued invitation appears in this list without a reload.
  const reload = useCallback(async () => {
    setStatus('loading')
    try {
      const body = await listInvitations(accessToken)
      setInvitations(body.invitations)
      setStatus('success')
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
      setStatus('error')
    }
  }, [accessToken])

  useEffect(() => {
    reload()
  }, [reload])

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

  const FILTER_LABELS = {
    all: t('invitations.filterAll'),
    pending: t('invitations.statusPending'),
    used: t('invitations.statusUsed'),
    expired: t('invitations.statusExpired'),
  }

  // Client-side: the whole list is already in memory and the server exposes no
  // status query parameter, so filtering here costs nothing and avoids a
  // refetch on every dropdown change.
  const visible = useMemo(
    () => (statusFilter === 'all' ? invitations : invitations.filter((row) => row.status === statusFilter)),
    [invitations, statusFilter]
  )

  // Counts come from the full list, not the filtered view — a tile that
  // changed when you filtered would be reporting the filter back at you.
  const pendingCount = invitations.filter((row) => row.status === 'pending').length
  const acceptedCount = invitations.filter((row) => row.status === 'used').length

  return (
    <MasterDetailLayout
      basePath="/invitations"
      title={t('invitations.title')}
      actions={
        <div className="flex w-32 flex-col gap-1.5">
          {/* Base UI composes through `render`, not asChild. */}
          <Button size="sm" className="h-7 w-full text-xs" render={<Link to="/invitations/new" />}>
            <Plus className="size-3.5" aria-hidden="true" />
            {t('invitations.newAction')}
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={DARK_TRIGGER_CLASS} aria-label={t('invitations.filterLabel')}>
              {/* Base UI renders the raw value unless given this render-prop. */}
              <SelectValue>{(current) => FILTER_LABELS[current] || FILTER_LABELS.all}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((value) => (
                <SelectItem key={value} value={value}>
                  {FILTER_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      statTiles={
        <StatTiles
          tiles={[
            { label: t('invitations.statusPending'), value: pendingCount, icon: Clock3 },
            { label: t('invitations.statusUsed'), value: acceptedCount, icon: CheckCircle2 },
          ]}
        />
      }
      list={visible.map((invitation) => (
        <li key={invitation.id}>
          <RecordCard
            to={`/invitations/${invitation.id}`}
            icon={UserPlus}
            // An invitation issued without a name hint has nothing to identify
            // it but the role it grants, so fall back to the role label rather
            // than leaving the card's title empty.
            title={invitation.student_name_hint || ROLE_LABELS[invitation.role] || t('invitations.untitled')}
            // When the title already fell back to the role label, repeating it
            // here would print the same word twice; show when it was sent
            // instead, which is the useful thing to scan an unnamed invite by.
            meta={
              invitation.student_name_hint
                ? ROLE_LABELS[invitation.role] || invitation.role
                : formatCreated(invitation.created_at)
            }
            pillLabel={STATUS_LABELS[invitation.status] || invitation.status}
            pillVariant={STATUS_PILL[invitation.status] || 'outline'}
            selected={String(activeId) === String(invitation.id)}
          />
        </li>
      ))}
      listEmpty={
        status === 'loading'
          ? t('invitations.sentLoading')
          : status === 'error'
            ? error
            : statusFilter === 'all'
              ? t('invitations.sentEmpty')
              : t('invitations.filterEmpty')
      }
      outletContext={{ invitations, reload }}
    />
  )
}
