import { GraduationCap, Users, CalendarDays, Video, CheckSquare, CircleCheck } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { EmptyState } from '@/components/Page'

// The manager's entire view of the application: per-teacher aggregates.
//
// A manager oversees performance without seeing who the students are. The
// server enforces that — /dashboard returns only counts grouped by teacher for
// this role, and every per-student endpoint returns 403 — so this component
// renders what arrives and never asks for student detail.
//
// If you extend this, do not add a link into a student's records. There isn't
// one to follow: the API would refuse it.

// A single aggregate count. Mirrors the tile treatment used by StatTiles on
// the list panels, but on the light page ground the dashboard uses rather than
// the dark rail, so it sits correctly next to the teacher dashboard's cards.
function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border bg-card p-3 shadow-sm">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </span>
      <span className="font-heading text-xl font-extrabold">{value}</span>
    </div>
  )
}

export default function ManagerDashboard({ dashboard }) {
  const { t } = useLanguage()

  const admins = dashboard.admins || []
  const totals = dashboard.totals || {}
  const tasks = totals.tasks || {}

  const tiles = [
    { icon: GraduationCap, label: t('dashboard.teachers'), value: totals.admin_count ?? 0 },
    { icon: Users, label: t('dashboard.students'), value: totals.student_count ?? 0 },
    { icon: CalendarDays, label: t('dashboard.upcomingSessions'), value: totals.upcoming_bookings ?? 0 },
    { icon: Video, label: t('dashboard.videosAwaitingReview'), value: totals.pending_video_reviews ?? 0 },
    { icon: CheckSquare, label: t('dashboard.openTasks'), value: tasks.pending ?? 0 },
    { icon: CircleCheck, label: t('dashboard.completedTasks'), value: tasks.done ?? 0 },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-base leading-snug font-medium">{t('dashboard.orgOverview')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <StatTile key={tile.label} icon={tile.icon} label={tile.label} value={tile.value} />
          ))}
        </div>
      </section>

      <Card>
        <CardHeader className="py-3">
          <h2 className="m-0 text-base leading-snug font-medium">{t('dashboard.byTeacher')}</h2>
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
