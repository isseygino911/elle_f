import { GraduationCap, Users, CalendarDays, Video, CheckSquare } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/Page'
import KpiStrip from './KpiStrip.jsx'

// The manager's entire view of the application: per-teacher aggregates.
//
// A manager oversees performance without seeing who the students are. The
// server enforces that — /dashboard returns only counts grouped by teacher for
// this role, and every per-student endpoint returns 403 — so this component
// renders what arrives and never asks for student detail.
//
// If you extend this, do not add a link into a student's records. There isn't
// one to follow: the API would refuse it.
//
// The privacy boundary is structural, not conditional: this component
// receives only `admins` and `totals`, and imports none of the sections that
// render a student's name. KpiStrip is presentational and takes the cells
// built below, so nothing student-bearing can reach it through this path.

// A manager has no chart worth reserving space for.
//
// Three of the four planned charts (activity trend, roster progress, review
// backlog age) are computed from per-student or per-video rows this role must
// never receive. Only booking outcomes could ever be shown, so the second
// slot holds something real and permanent instead of a "coming soon" frame
// promising a chart the data model cannot deliver.
function TaskSplit({ pending, done, labels }) {
  const total = pending + done
  const donePercent = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Card>
      <CardHeader className="border-b border-border pb-3">
        <h2 className="m-0 text-base leading-snug font-medium">{labels.taskProgress}</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {total === 0 ? (
          <EmptyState>{labels.noTasks}</EmptyState>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-heading text-2xl leading-tight font-extrabold tabular-nums">
                {donePercent}%
              </span>
              <span className="text-sm text-muted-foreground">
                {done} / {total} {labels.completed.toLowerCase()}
              </span>
            </div>
            {/* The shared Progress primitive rather than a hand-rolled pair of
                divs: it carries the ARIA progressbar semantics for free, where
                the previous markup had to fake them with role="img" and a
                hand-written label.
                Note Progress renders its own track after `children` -- passing
                a ProgressTrack in here would draw a second bar. */}
            <Progress
              value={donePercent}
              // Keeps the previous bar's weight and colour: the primitive
              // defaults to an h-1 track with a bg-primary fill.
              className="w-full [&_[data-slot=progress-indicator]]:bg-chart-1 [&_[data-slot=progress-track]]:h-2"
              aria-label={labels.taskProgressLabel
                .replace('{done}', done)
                .replace('{total}', total)}
            />
            <p className="m-0 text-xs text-muted-foreground">
              {pending} {labels.openTasks.toLowerCase()}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function ManagerDashboard({ dashboard }) {
  const { t } = useLanguage()

  const admins = dashboard.admins || []
  const totals = dashboard.totals || {}
  const tasks = totals.tasks || {}

  // Four cells, not the previous six. The two task counts moved into the
  // ratio panel below, where "12 done" means something next to "3 open"
  // rather than sitting as two unrelated figures in a row.
  const cells = [
    { key: 'teachers', icon: GraduationCap, label: t('dashboard.teachers'), value: totals.admin_count ?? 0 },
    { key: 'students', icon: Users, label: t('dashboard.students'), value: totals.student_count ?? 0 },
    {
      key: 'sessions',
      icon: CalendarDays,
      label: t('dashboard.upcomingSessions'),
      value: totals.upcoming_bookings ?? 0,
    },
    {
      key: 'reviews',
      icon: Video,
      label: t('dashboard.videosAwaitingReview'),
      value: totals.pending_video_reviews ?? 0,
      attention: true,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <KpiStrip cells={cells} label={t('dashboard.orgOverview')} />

      {/* Full width, not a half of a two-column grid. It is the only panel on
          this row -- a lg:grid-cols-2 wrapper around a single child left it
          stranded at half width with permanent dead space beside it, which is
          the ragged-column problem TeacherDashboard's header comment warns
          about. Same treatment as ReviewBacklogAge on the teacher dashboard. */}
      <TaskSplit
        pending={tasks.pending ?? 0}
        done={tasks.done ?? 0}
        labels={{
          taskProgress: t('dashboard.taskProgress'),
          noTasks: t('dashboard.noTasks'),
          completed: t('dashboard.completed'),
          openTasks: t('dashboard.openTasks'),
          taskProgressLabel: t('dashboard.taskProgressLabel'),
        }}
      />

      <Card>
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <h2 className="m-0 text-base leading-snug font-medium">{t('dashboard.byTeacher')}</h2>
          </div>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            // An org with no teachers is the manager's realistic first-run
            // state — a manager can be invited before any teacher is. Naming
            // the next step keeps that from reading as a broken page.
            <EmptyState>
              {t('dashboard.noTeachers')} {t('dashboard.noTeachersHint')}
            </EmptyState>
          ) : (
            // Wide table on a narrow viewport: the horizontal scroll is owned
            // by this wrapper so the page body itself never scrolls sideways.
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dashboard.teacher')}</TableHead>
                    <TableHead className="text-right">{t('dashboard.students')}</TableHead>
                    <TableHead className="text-right">{t('dashboard.upcoming')}</TableHead>
                    <TableHead className="text-right">{t('dashboard.completed')}</TableHead>
                    <TableHead className="text-right">{t('dashboard.videosAwaitingReview')}</TableHead>
                    <TableHead className="text-right">{t('dashboard.unreadMessages')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.admin_id}>
                      <TableCell className="font-medium">{admin.admin_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{admin.student_count}</TableCell>
                      <TableCell className="text-right tabular-nums">{admin.upcoming_bookings}</TableCell>
                      <TableCell className="text-right tabular-nums">{admin.completed_sessions}</TableCell>
                      <TableCell className="text-right tabular-nums">{admin.pending_video_reviews}</TableCell>
                      <TableCell className="text-right tabular-nums">{admin.unread_messages}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
