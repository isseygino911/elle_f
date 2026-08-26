import {
  Video,
  MessageSquare,
  CalendarDays,
  CheckSquare,
  CalendarClock,
  GraduationCap,
} from 'lucide-react'
import KpiStrip from './KpiStrip.jsx'
import SectionCard, { SectionCardSkeleton } from './SectionCard.jsx'
import NextSessionSpotlight from './sections/NextSessionSpotlight.jsx'
import TasksList from './sections/TasksList.jsx'
import ActiveCoursesList from './sections/ActiveCoursesList.jsx'
import CreateTaskDialog from './sections/CreateTaskDialog.jsx'
import BookingList from '@/components/BookingList'
import { useLanguage } from '@/lib/LanguageContext'

// The teaching dashboard: owner and admin (teacher) both land here.
//
// LAYOUT REASONING
//
// The old page split its cards into a hardcoded left/right pair, which left a
// teacher with two cards on one side and five on the other -- columns of
// wildly different height that had to be read as one long ragged block.
//
// The queue sections were once four peers in an even 2x2. They are now split
// by KIND rather than by rank: tasks, video reviews and homework due are debts
// you work down, so they stay 2-up in the main column; upcoming bookings is
// time-ordered, so it joins the next-session spotlight in a right-hand rail.
// The old arrangement gave the page no reading order -- every section was a
// full-width peer and the eye had nowhere to start.
//
// Notifications no longer appear here at all: they live in the app shell's
// bell and drawer, where the count stays live on every page rather than only
// while a dashboard happens to be mounted. Unread messages likewise -- the
// list duplicated the Messages page, and its count is now a live badge on the
// nav row. The KPI cell for messages stays, because a number you can glance at
// is not the same thing as a list you have to read.
export default function TeacherDashboard({
  dashboard,
  status,
  onMarkTaskDone,
  onCreateTask,
  onCancelBooking,
  students,
  studentsStatus,
  studentsError,
  courses = [],
}) {
  const { t } = useLanguage()
  const upcomingBookings = dashboard?.upcoming_bookings?.bookings ?? []
  const nextBooking = upcomingBookings[0] ?? null
  const laterBookings = upcomingBookings.slice(1)

  // Built here rather than inside KpiStrip: each role decides its own
  // numbers, which is what keeps KpiStrip presentational and keeps a
  // student-bearing field from ever reaching the manager's strip.
  //
  // `attention` marks the counts that mean "you owe someone something". A
  // roster size is a fact, not a debt, so Students never takes the dot.
  const cells = dashboard
    ? [
        {
          key: 'reviews',
          icon: Video,
          label: t('dashboard.videosToReview'),
          value: dashboard.pending_video_reviews.count,
          to: '/videos',
          attention: true,
        },
        {
          key: 'messages',
          icon: MessageSquare,
          label: t('dashboard.unreadMessagesFull'),
          value: dashboard.unread_messages.total_count,
          to: '/messages',
          attention: true,
        },
        {
          key: 'homework',
          icon: CalendarClock,
          label: t('dashboard.homeworkDue'),
          value: dashboard.assignments_due?.count ?? 0,
          to: '/courses',
          attention: true,
        },
        {
          key: 'sessions',
          icon: CalendarDays,
          // The payload's window is the next 24 hours, not "everything
          // ahead". Labelling it plain "Upcoming" would misstate it.
          label: t('dashboard.sessionsNext24h'),
          value: dashboard.upcoming_bookings.count,
          to: '/bookings',
        },
      ]
    : []

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-[6.5rem] animate-pulse rounded-md border border-border bg-card" />
        {/* Mirrors the loaded layout: the insight panel, then a 2x2 of queues. */}
        <SectionCardSkeleton />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCardSkeleton />
          <SectionCardSkeleton />
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

      {/* Two-column body: the queues you work through on the left, the
          time-ordered rail on the right. Previously every section was a
          full-width row in one column, so the page read as a single long
          scroll with no sense of what to look at first. The rail is fixed at
          20rem and the main column takes the rest, so neither collapses into
          the other on a wide screen. */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* The queue sections stack full-width in the main column, matching
              the reference's "Needs Attention" / "Active Courses" rhythm: one
              section per row, each as wide as the column. A 2-up grid halved
              every row and left each list fighting for width. */}
          <div className="flex flex-col gap-6">
            <SectionCard
              title={t('dashboard.tasks')}
              count={dashboard.tasks.count}
              icon={CheckSquare}
              actions={
                onCreateTask && (
                  <CreateTaskDialog
                    onCreateTask={onCreateTask}
                    students={students}
                    studentsStatus={studentsStatus}
                    studentsError={studentsError}
                  />
                )
              }
            >
              <TasksList tasks={dashboard.tasks} onMarkTaskDone={onMarkTaskDone} students={students} />
            </SectionCard>

            <SectionCard
              title={t('dashboard.activeCourses')}
              count={courses.length}
              icon={GraduationCap}
            >
              <ActiveCoursesList courses={courses} />
            </SectionCard>
          </div>
        </div>

        {/* The rail: what happens next, in time order. */}
        <div className="flex min-w-0 flex-col gap-6">
          {nextBooking && (
            <NextSessionSpotlight
              booking={nextBooking}
              showStudent
              onCancelBooking={onCancelBooking}
            />
          )}

          <SectionCard title={t('dashboard.upcomingBookings')} icon={CalendarDays}>
            {/* emptyMessage is passed rather than relying on BookingList's
                default, which is hardcoded English. The component is shared
                with the Bookings page, so translating it here keeps the
                dashboard fully localised without changing that page. */}
            <BookingList
              bookings={laterBookings}
              showStudent
              onCancel={onCancelBooking}
              emptyMessage={t('dashboard.noUpcomingBookings')}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
