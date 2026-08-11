import { GraduationCap, CalendarDays, MessageSquare, Video, CheckSquare } from 'lucide-react'
import KpiStrip from './KpiStrip.jsx'
import SectionCard, { SectionCardSkeleton } from './SectionCard.jsx'
import NextSessionSpotlight from './sections/NextSessionSpotlight.jsx'
import PendingVideoReviewsList from './sections/PendingVideoReviewsList.jsx'
import AssignmentsDueList from './sections/AssignmentsDueList.jsx'
import TasksList from './sections/TasksList.jsx'
import BookingList from '@/components/BookingList'
import { useLanguage } from '@/lib/LanguageContext'

// A student's dashboard.
//
// Three KPI cells rather than the teacher's four, and an equal two-column
// body rather than a wide/narrow split: a student has fewer sections, so a
// narrow rail would sit half empty. The strip's column count follows its cell
// count for the same reason -- padding it out to four would leave a gap where
// a number should be.
// Notifications moved to the app shell's bell and drawer, so they stay live
// away from this page; the section that used to sit in the right column is
// gone rather than duplicated.
export default function StudentDashboard({
  dashboard,
  status,
  onMarkTaskDone,
  onCancelBooking,
  user,
}) {
  const { t } = useLanguage()
  const upcomingBookings = dashboard?.upcoming_bookings?.bookings ?? []
  const nextBooking = upcomingBookings[0] ?? null
  const laterBookings = upcomingBookings.slice(1)

  // Note `unread_messages.count`, not `total_count` -- the student payload
  // uses a different field name from the teacher's.
  //
  // Deliberately no "videos awaiting review" cell: for a student that count
  // means "videos my teacher hasn't got to yet", which is the teacher's
  // queue, not something the student can act on. It stays a list below.
  const cells = dashboard
    ? [
        {
          key: 'homework',
          icon: GraduationCap,
          // The server's window is 14 days; saying so stops "3" from reading
          // as "3 ever".
          label: t('dashboard.homeworkDue14d'),
          value: dashboard.assignments_due?.count ?? 0,
          to: '/courses',
          attention: true,
        },
        {
          key: 'sessions',
          icon: CalendarDays,
          label: t('dashboard.sessionsNext24h'),
          value: dashboard.upcoming_bookings.count,
          to: '/bookings',
        },
        {
          key: 'messages',
          icon: MessageSquare,
          label: t('dashboard.unreadMessagesFull'),
          value: dashboard.unread_messages.count,
          // Absorbs what used to be a whole card containing a single link.
          to: user ? `/messages/${encodeURIComponent(user.id)}` : '/messages',
          attention: true,
        },
      ]
    : []

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-[6.5rem] animate-pulse rounded-md border border-border bg-card" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCardSkeleton />
          <SectionCardSkeleton />
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <div className="flex flex-col gap-6">
      <KpiStrip cells={cells} label={t('dashboard.keyMetrics')} />

      {nextBooking && <NextSessionSpotlight booking={nextBooking} onCancelBooking={onCancelBooking} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          {dashboard.assignments_due && (
            <SectionCard
              title={`${t('dashboard.homeworkDue')} (${dashboard.assignments_due.count})`}
              icon={GraduationCap}
            >
              <AssignmentsDueList assignments={dashboard.assignments_due} showCourse={false} />
            </SectionCard>
          )}

          <SectionCard title={`${t('dashboard.tasks')} (${dashboard.tasks.count})`} icon={CheckSquare}>
            <TasksList tasks={dashboard.tasks} onMarkTaskDone={onMarkTaskDone} />
          </SectionCard>
        </div>

        <div className="flex flex-col gap-5">
          <SectionCard title={t('dashboard.upcomingBookings')} icon={CalendarDays}>
            <BookingList
              bookings={laterBookings}
              showStudent={false}
              onCancel={onCancelBooking}
              emptyMessage={t('dashboard.noUpcomingBookings')}
            />
          </SectionCard>

          <SectionCard
            title={`${t('dashboard.awaitingReview')} (${dashboard.pending_video_reviews.count})`}
            icon={Video}
          >
            <PendingVideoReviewsList reviews={dashboard.pending_video_reviews} showStudent={false} />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
