import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/LanguageContext'
import ChartFrame from '../ChartFrame.jsx'

// How long the videos waiting for review have been waiting.
//
// A flat count ("3 pending") says nothing about whether that is fine. Three
// uploaded this morning is a normal day; one sitting for nine days is a
// student who has been waiting a week and a half for feedback. Same number,
// different situation -- so the dashboard shows the spread, not just the
// total.
//
// Computed entirely client-side from the created_at already on each pending
// video. No new query, and it stays meaningful at any studio size.
const BUCKETS = [
  { key: 'today', labelKey: 'dashboard.bandToday', maxDays: 1 },
  { key: '2-3', labelKey: 'dashboard.band23Days', maxDays: 4 },
  { key: '4-7', labelKey: 'dashboard.band47Days', maxDays: 8 },
  { key: 'week', labelKey: 'dashboard.bandWeekPlus', maxDays: Infinity },
]

function daysWaiting(createdAt) {
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000))
}

export default function ReviewBacklogAge({ reviews }) {
  const { t } = useLanguage()
  const videos = reviews?.videos ?? []

  if (videos.length === 0) {
    return <ChartFrame title={t('dashboard.waitingForReview')} message={t('dashboard.noBacklog')} />
  }

  const ages = videos.map((video) => daysWaiting(video.created_at))
  const oldest = Math.max(...ages)

  const buckets = BUCKETS.map((bucket, index) => {
    const lower = index === 0 ? 0 : BUCKETS[index - 1].maxDays
    return {
      ...bucket,
      label: t(bucket.labelKey),
      count: ages.filter((age) => age >= lower && age < bucket.maxDays).length,
    }
  })

  const max = Math.max(...buckets.map((bucket) => bucket.count), 1)

  return (
    <ChartFrame title={t('dashboard.waitingForReview')}>
      <div className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2" aria-label={bucketsLabel(buckets)}>
          {buckets.map((bucket) => (
            <li key={bucket.key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">{bucket.label}</span>
              <span className="flex h-4 min-w-0 flex-1 items-center">
                <span
                  className={cn(
                    'h-full rounded-sm',
                    // The oldest bucket is the one that means someone has
                    // been left waiting, so it is the only one that earns
                    // the urgent tone.
                    bucket.key === 'week' && bucket.count > 0 ? 'bg-priority-high' : 'bg-chart-1',
                    bucket.count === 0 && 'bg-muted'
                  )}
                  style={{ width: bucket.count > 0 ? `${Math.max((bucket.count / max) * 100, 4)}%` : '2px' }}
                />
              </span>
              <span className="w-6 shrink-0 text-right text-xs font-medium tabular-nums">{bucket.count}</span>
            </li>
          ))}
        </ul>
        {oldest >= 7 && (
          <p className="m-0 text-xs font-medium text-priority-high">
            {t('dashboard.oldestWaiting').replace('{days}', oldest)}
          </p>
        )}
      </div>
    </ChartFrame>
  )
}

function bucketsLabel(buckets) {
  return `Videos waiting for review: ${buckets.map((b) => `${b.label}, ${b.count}`).join('; ')}`
}
