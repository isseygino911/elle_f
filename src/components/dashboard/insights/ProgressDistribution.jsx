import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/LanguageContext'
import ChartFrame from '../ChartFrame.jsx'

// How a teacher's roster is spread across survey completion, in four bands.
//
// WHY THIS AND NOT A TREND LINE
//
// The dashboard's "overview" goal wants a chart at the top of the page, but
// no time-series data exists yet -- every figure the API returns is a
// point-in-time count. A distribution needs none: it is computed from the
// completion ratios the payload already carries. It also stays readable for a
// studio with four students, where a weekly trend would be four noisy points.
//
// The section is NOT a placeholder. When phase 2's trend charts arrive they
// join this row; they do not replace this.
//
// LIMITATION worth stating: student_progress.students is capped server-side
// (STUDENT_PROGRESS_WIDGET_LIMIT, currently 6) and sorted least-progressed
// first, so this shows the distribution of the students shown, not of the
// whole roster. The caption says so rather than implying full coverage.
const BANDS = [
  { key: '0-25', label: '0–25%', min: 0, max: 25 },
  { key: '25-50', label: '25–50%', min: 25, max: 50 },
  { key: '50-75', label: '50–75%', min: 50, max: 75 },
  { key: '75-100', label: '75–100%', min: 75, max: 101 },
]

// The server's own ratio, not a re-derivation from the raw counts. The
// duplicate formula this replaces also lived in StudentProgressList, so the
// same arithmetic was maintained in two components and the server -- and once
// progress became scoped to a single survey, a stale copy here would have
// silently banded students against a denominator the card no longer used.
function percentFor(student) {
  return Math.round((student.completion_ratio ?? 0) * 100)
}

export default function ProgressDistribution({ progress }) {
  const { t } = useLanguage()
  const students = progress?.students ?? []

  if (students.length === 0) {
    return <ChartFrame title={t('dashboard.rosterProgress')} message={t('dashboard.noProgressYet')} />
  }

  const counts = BANDS.map((band) => ({
    ...band,
    count: students.filter((student) => {
      const percent = percentFor(student)
      return percent >= band.min && percent < band.max
    }).length,
  }))

  const max = Math.max(...counts.map((band) => band.count), 1)
  const total = progress?.total_count ?? students.length
  const partial = students.length < total

  return (
    <ChartFrame title={t('dashboard.rosterProgress')}>
      <div className="flex flex-col gap-3">
        <div className="flex h-32 items-end gap-2" role="img" aria-label={countsLabel(counts)}>
          {counts.map((band) => (
            <div key={band.key} className="flex flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-xs font-medium tabular-nums text-muted-foreground">{band.count}</span>
              <div
                className={cn(
                  'w-full rounded-sm transition-all',
                  band.count > 0 ? 'bg-chart-1' : 'bg-muted'
                )}
                // Bars are sized against the busiest band so the shape reads
                // even when every band is small. A zero band keeps a hairline
                // so the axis stays legible.
                style={{ height: band.count > 0 ? `${Math.max((band.count / max) * 100, 8)}%` : '2px' }}
              />
              <span className="text-[0.65rem] text-muted-foreground">{band.label}</span>
            </div>
          ))}
        </div>
        <p className="m-0 text-xs text-muted-foreground">
          {partial
            ? t('dashboard.showingLeastProgressed')
                .replace('{shown}', students.length)
                .replace('{total}', total)
            : t('dashboard.allStudents').replace('{total}', total)}
        </p>
      </div>
    </ChartFrame>
  )
}

// Charts must not rely on shape alone -- a screen reader gets the same facts
// as the bars.
function countsLabel(counts) {
  return `Survey completion: ${counts.map((band) => `${band.label}, ${band.count} students`).join('; ')}`
}
