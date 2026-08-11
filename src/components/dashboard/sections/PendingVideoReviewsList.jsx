import { Link } from 'react-router-dom'
import { Video } from 'lucide-react'
import DashboardRowIcon from '../DashboardRowIcon.jsx'
import { EmptyState } from '@/components/Page'
import { useLanguage } from '@/lib/LanguageContext'
import { formatSlotDate } from '@/utils/formatSlotTime'

export default function PendingVideoReviewsList({ reviews, showStudent }) {
  const { t } = useLanguage()

  if (reviews.videos.length === 0) return <EmptyState>{t('dashboard.noVideosToReview')}</EmptyState>

  return (
    <ul className="flex flex-col">
      {reviews.videos.map((video) => (
        <li key={video.id} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
          <DashboardRowIcon icon={Video} />
          <span className="flex min-w-0 flex-col gap-0.5">
            <Link to={`/videos/${video.id}`} className="font-medium text-primary hover:underline">
              {video.title}
            </Link>
            {/* formatSlotDate, not the raw column: created_at arrives as a
                full ISO string, so interpolating it directly renders
                "2026-08-11T15:31:50.000Z" in the middle of the row. Same
                helper NotificationsList uses, so the two adjacent columns
                state dates the same way. */}
            <span className="text-sm text-muted-foreground">
              {showStudent ? `${video.student_name} · ` : ''}
              {formatSlotDate(video.created_at)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
