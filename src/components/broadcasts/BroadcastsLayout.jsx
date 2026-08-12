import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Megaphone, Plus, Users } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { canBroadcast, isManager } from '../../lib/roles.js'
import { listBroadcasts } from '../../api/client.js'
import { withCount } from '@/utils/withCount'
import { Button } from '@/components/ui/button'
import MasterDetailLayout from '@/components/records/MasterDetailLayout'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'

// The persistent master list panel for `/broadcasts`, `/broadcasts/new` and
// `/broadcasts/:id`. Replaces the standalone BroadcastsPage, which was the
// last list screen in the app with the create form sitting permanently above
// the list -- the same drift /invitations already had corrected, for the same
// reason: the thing you come back for was pushed below a form you use once.
//
// The fetch lives here rather than in a child because both the list and the
// detail pane read the same rows -- the API has no get-one endpoint, so the
// detail is served out of this array via outletContext (the InvitationsLayout
// precedent) instead of a per-broadcast request.
export default function BroadcastsLayout() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const { id: activeId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [broadcasts, setBroadcasts] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | error
  const [error, setError] = useState(null)

  // Also called by the compose page after a successful send, so a newly sent
  // announcement is present in this list before it navigates to that row's
  // detail -- which is served from this array.
  const reload = useCallback(async () => {
    setStatus('loading')
    try {
      const body = await listBroadcasts(accessToken)
      setBroadcasts(body.broadcasts)
      setStatus('success')
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
      setStatus('error')
    }
  }, [accessToken])

  useEffect(() => {
    reload()
  }, [reload])

  // Landing on the bare list URL selects the newest announcement, so the detail
  // pane opens with content instead of the "nothing selected" placeholder --
  // there is always something worth reading there, and the placeholder was only
  // ever a dead first impression.
  //
  // Only from the index route: /new and /:id are deliberate destinations, and
  // redirecting off either would fight the user. `replace` so Back leaves the
  // section rather than returning to a URL that immediately redirects again.
  //
  // Skipped below lg, where MasterDetailLayout treats the list as the primary
  // view and a detail route hides it -- auto-selecting there would open every
  // visit on a record the user never picked, with the list a tap away behind it.
  const isIndexRoute = location.pathname.replace(/\/+$/, '') === '/broadcasts'
  const firstId = broadcasts.length > 0 ? broadcasts[0].id : null

  useEffect(() => {
    if (!isIndexRoute || status !== 'success' || firstId == null) return
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    navigate(`/broadcasts/${firstId}`, { replace: true })
  }, [isIndexRoute, status, firstId, navigate])

  const canSend = canBroadcast(user)
  const oversightOnly = isManager(user)

  // The server already scopes this list by role: a teacher's GET returns only
  // their own sends, an owner's and a manager's the whole organization. So the
  // same two computed counts mean the right thing for each role without a
  // client-side branch -- only the label changes, because one is an outbox and
  // the other is a feed.
  const totalReach = broadcasts.reduce((sum, broadcast) => sum + broadcast.recipient_count, 0)

  // Gated on a non-empty list, matching Videos: a brand-new
  // organization should get no tile row at all rather than two zeroes.
  const statTiles =
    status === 'success' && broadcasts.length > 0 ? (
      <StatTiles
        tiles={[
          {
            label: oversightOnly ? t('broadcasts.statAnnouncements') : t('broadcasts.statSent'),
            value: broadcasts.length,
            icon: Megaphone,
          },
          { label: t('broadcasts.statReach'), value: totalReach, icon: Users },
        ]}
      />
    ) : null

  const list =
    status === 'success'
      ? broadcasts.map((broadcast) => (
          <li key={broadcast.id}>
            <RecordCard
              to={`/broadcasts/${broadcast.id}`}
              icon={Megaphone}
              title={broadcast.title}
              meta={`${broadcast.sender_name} · ${new Date(broadcast.created_at).toLocaleDateString()}`}
              // A recipient count is information, not a status -- lime or a
              // priority tone here would assign urgency to a neutral number.
              pillLabel={
                broadcast.recipient_count === 1
                  ? t('broadcasts.recipientCountOne')
                  : withCount(t('broadcasts.recipientCount'), broadcast.recipient_count)
              }
              pillVariant="secondary"
              selected={String(activeId) === String(broadcast.id)}
            />
          </li>
        ))
      : []

  return (
    <MasterDetailLayout
      basePath="/broadcasts"
      title={t('broadcasts.title')}
      // A manager reads the oversight feed and cannot compose, so they get no
      // action column at all. Derived from canBroadcast rather than from the
      // manager check, so the button's presence and the compose route's own
      // guard are answering the same question.
      actions={
        canSend ? (
          <div className="flex w-32 flex-col gap-1.5">
            {/* Base UI composes through `render`, not asChild. */}
            <Button size="sm" className="h-7 w-full text-xs" render={<Link to="/broadcasts/new" />}>
              <Plus className="size-3.5" aria-hidden="true" />
              {t('broadcasts.newAction')}
            </Button>
          </div>
        ) : null
      }
      statTiles={statTiles}
      list={list}
      listEmpty={
        status === 'loading'
          ? t('broadcasts.loading')
          : status === 'error'
            ? error || t('broadcasts.loadError')
            : t('broadcasts.empty')
      }
      // status and error travel with the rows so the detail pane can tell
      // "still loading" apart from "no such announcement" -- InvitationsLayout
      // passes only the array, which is why its detail page flashes a
      // not-found on every hard refresh.
      outletContext={{ broadcasts, status, error, reload }}
    />
  )
}
