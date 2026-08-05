import { useEffect, useMemo, useState } from 'react'
import { canManageStudents } from '../../lib/roles.js'
import { useParams } from 'react-router-dom'
import { Video as VideoIcon, Clock3, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { listVideos } from '../../api/client.js'
import { formatDuration } from '../../utils/formatDuration.js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MasterDetailLayout from '@/components/records/MasterDetailLayout'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'class', label: 'Class' },
  { value: 'practice', label: 'Practice' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending_review', label: 'Pending review' },
  { value: 'reviewed', label: 'Reviewed' },
]

// Dark-themed override for the (light-by-default) shadcn Select, used only
// for these two compact filters sitting inside the dark list panel.
const DARK_TRIGGER_CLASS =
  'h-7 w-full border-dark-border bg-dark-card-hover text-xs text-white data-placeholder:text-dark-muted focus-visible:border-lime focus-visible:ring-lime/50 [&_svg]:text-dark-muted'

// The persistent master list panel + stat-tile row for `/videos` and
// `/videos/:id` (MASTER.md Layout Pattern section). Replaces the standalone
// VideoListPage — VideoDetailPage.jsx (unchanged data-fetching/handlers)
// now renders inside this layout's <Outlet/> via nested routing, so both
// URLs keep resolving exactly as before.
export default function VideosLayout() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const { id: activeId } = useParams()
  const isElle = canManageStudents(user)

  const [status, setStatus] = useState('loading') // loading | success | error
  const [videos, setVideos] = useState([])
  const [error, setError] = useState(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    listVideos(accessToken, isElle ? { type: typeFilter, status: statusFilter } : undefined)
      .then((body) => {
        if (!cancelled) {
          setVideos(body.videos)
          setStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err.body && err.body.message) || err.message)
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, isElle, typeFilter, statusFilter])

  // Stat-tile counts computed from this same already-fetched video list —
  // no new queries, per MASTER.md's Layout Pattern section.
  const pendingCount = useMemo(() => videos.filter((video) => video.status === 'pending_review').length, [videos])
  const reviewedCount = useMemo(() => videos.filter((video) => video.status === 'reviewed').length, [videos])

  const statTiles =
    status === 'success' && videos.length > 0 ? (
      <StatTiles
        tiles={[
          { label: 'Pending review', value: pendingCount, icon: Clock3 },
          { label: 'Reviewed', value: reviewedCount, icon: CheckCircle2 },
        ]}
      />
    ) : null

  const list =
    status === 'success'
      ? videos.map((video) => (
          <li key={video.id}>
            <RecordCard
              to={`/videos/${video.id}`}
              icon={VideoIcon}
              title={video.title}
              meta={`${video.type} · ${formatDuration(video.duration_sec)} · ${video.created_at}`}
              pillLabel={video.status === 'reviewed' ? 'Reviewed' : 'Pending review'}
              pillVariant={video.status === 'reviewed' ? 'priorityLow' : 'priorityHigh'}
              selected={String(activeId) === String(video.id)}
            />
          </li>
        ))
      : []

  return (
    <MasterDetailLayout
      basePath="/videos"
      title={t('videos.title')}
      statTiles={statTiles}
      list={list}
      listEmpty={status === 'loading' ? t('videos.loading') : status === 'error' ? error : t('videos.empty')}
      actions={
        isElle ? (
          <div className="flex w-32 flex-col gap-1.5">
            <Select value={typeFilter || 'all'} onValueChange={(next) => setTypeFilter(next === 'all' ? '' : next)} items={TYPE_OPTIONS}>
              <SelectTrigger className={DARK_TRIGGER_CLASS}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter || 'all'}
              onValueChange={(next) => setStatusFilter(next === 'all' ? '' : next)}
              items={STATUS_OPTIONS}
            >
              <SelectTrigger className={DARK_TRIGGER_CLASS}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null
      }
    />
  )
}
