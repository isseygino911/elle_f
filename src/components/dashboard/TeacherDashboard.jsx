import { Video, MessageSquare, CalendarDays, GraduationCap, CheckSquare, CalendarClock } from 'lucide-react'
import KpiStrip from './KpiStrip.jsx'
import SectionCard, { SectionCardSkeleton } from './SectionCard.jsx'
import NextSessionSpotlight from './sections/NextSessionSpotlight.jsx'
import PendingVideoReviewsList from './sections/PendingVideoReviewsList.jsx'
import AssignmentsDueList from './sections/AssignmentsDueList.jsx'
import StudentProgressList from './sections/StudentProgressList.jsx'
import SurveyPicker from './sections/SurveyPicker.jsx'
import TasksList from './sections/TasksList.jsx'
import CreateTaskDialog from './sections/CreateTaskDialog.jsx'
import ProgressDistribution from './insights/ProgressDistribution.jsx'
import ReviewBacklogAge from './insights/ReviewBacklogAge.jsx'
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
// The four queue sections -- tasks, video reviews, homework due, upcoming
// bookings -- are peers, so they sit in an even 2x2 where no card's width
// implies it matters more than its neighbour. Student progress then takes a
// full-width row underneath: its rows are one per student and grow with the
// roster, and a name against a trailing completion pill reads as a table
// only when the row is long enough to separate them.
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
  onSelectSurvey,
  surveyPending,
  students,
  studentsStatus,
  studentsError,
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
          key: 'sessions',
          icon: CalendarDays,
          // The payload's window is the next 24 hours, not "everything
          // ahead". Labelling it plain "Upcoming" would misstate it.
          label: t('dashboard.sessionsNext24h'),
          value: dashboard.upcoming_bookings.count,
          to: '/bookings',
        },
        {
          key: 'students',
          icon: GraduationCap,
          label: t('dashboard.studentsCount'),
          // Already shipped by the API and previously thrown away -- the old
          // page rendered only the six least-progressed students and never
          // showed the roster size it was given.
          value: dashboard.student_progress?.total_count ?? 0,
          to: '/students',
        },
      ]
    : []

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-[6.5rem] animate-pulse rounded-md border border-border bg-card" />
        {/* Mirrors the loaded layout: a 2x2 of queues, then the roster. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCardSkeleton />
          <SectionCardSkeleton />
          <SectionCardSkeleton />
          <SectionCardSkeleton />
        </div>
        <SectionCardSkeleton />
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <div className="flex flex-col gap-6">
      <KpiStrip cells={cells} label={t('dashboard.keyMetrics')} />

      {nextBooking && (
        <NextSessionSpotlight booking={nextBooking} showStudent onCancelBooking={onCancelBooking} />
      )}

      {/* The two insight panels. These are built entirely from data the API
          already returns -- no trend query needed -- and they stay meaningful
          for a studio with three students, which a weekly trend line would
          not. Phase 2's charts join this row rather than replacing it. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReviewBacklogAge reviews={dashboard.pending_video_reviews} />
        <ProgressDistribution progress={dashboard.student_progress} />
      </div>

      {/* Four peer sections in a 2x2. None of them outranks the others enough
          to earn a wider column, and at equal width each row keeps its own
          card's rhythm instead of one column running twice as long as the
          other. Student progress is the exception and sits below. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title={`${t('dashboard.tasks')} (${dashboard.tasks.count})`}
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
          <TasksList tasks={dashboard.tasks} onMarkTaskDone={onMarkTaskDone} />
        </SectionCard>

        <SectionCard
          title={`${t('dashboard.pendingVideoReviews')} (${dashboard.pending_video_reviews.count})`}
          icon={Video}
        >
          <PendingVideoReviewsList reviews={dashboard.pending_video_reviews} showStudent />
        </SectionCard>

        {dashboard.assignments_due && (
          <SectionCard
            title={`${t('dashboard.homeworkDue')} (${dashboard.assignments_due.count})`}
            icon={CalendarClock}
          >
            <AssignmentsDueList assignments={dashboard.assignments_due} showCourse />
          </SectionCard>
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

      {/* Full width, and last: it is the only section here whose rows are one
          per student, so it grows with the roster rather than with a queue.
          At full width the name and its completion pill sit at opposite ends
          of a long row, which reads as a table -- the shape it wanted all
          along and could not have in a rail. */}
      <SectionCard
        title={t('dashboard.studentProgress')}
        icon={GraduationCap}
        actions={
          <SurveyPicker
            surveys={dashboard.student_progress?.surveys}
            surveyId={dashboard.student_progress?.survey_id}
            onChange={onSelectSurvey}
            disabled={surveyPending}
          />
        }
      >
        <StudentProgressList progress={dashboard.student_progress} />
      </SectionCard>
    </div>
  )
}
