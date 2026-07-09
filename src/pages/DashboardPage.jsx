import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Video, MessageSquare, CheckSquare, GraduationCap, CalendarDays } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import {
  getDashboard,
  listNotifications,
  markNotificationRead,
  createTask,
  updateTaskStatus,
  cancelBooking,
} from '../api/client.js'
import { formatSlotDate, formatSlotTime } from '../utils/formatSlotTime.js'
import { useStudents } from '../hooks/useStudents.js'
import { getCategoricalAccent } from '@/lib/categoricalPalette'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer, PageHeader, EmptyState, ErrorAlert } from '@/components/Page'
import StudentSelect from '@/components/StudentSelect'
import BookingList, { JoinClassLink } from '@/components/BookingList'

// Small leading icon avatar shared by every dashboard row list below — the
// "avatar/icon + label + pill" record-card language (MASTER.md Layout
// Pattern: Dashboard) applied to the existing divided-row lists rather than
// rebuilding them as standalone cards.
function RowIcon({ icon: Icon }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}

const POLL_INTERVAL_MS = 15000

export default function DashboardPage() {
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const isElle = Boolean(user && user.role === 'elle')
  const { students, status: studentsStatus, error: studentsError } = useStudents(accessToken, { enabled: isElle })

  const [messageStudentId, setMessageStudentId] = useState('')

  const [dashboardStatus, setDashboardStatus] = useState('loading') // loading | success | error
  const [dashboard, setDashboard] = useState(null)
  const [dashboardError, setDashboardError] = useState(null)

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setDashboardStatus('loading')

    getDashboard(accessToken)
      .then((body) => {
        if (!cancelled) {
          setDashboard(body)
          setDashboardStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDashboardError((err.body && err.body.message) || err.message)
          setDashboardStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [accessToken])

  // Same polling shape as MessageThreadPage.jsx: fetch on mount, then refresh
  // on an interval. Unlike the message thread, there's nothing to compare
  // against latest state here (each poll simply replaces the unread list), so
  // no ref mirror is needed.
  useEffect(() => {
    let cancelled = false

    function loadNotifications() {
      listNotifications(accessToken, { unreadOnly: true })
        .then((body) => {
          if (cancelled) return
          setNotifications(body.notifications)
          setUnreadCount(body.unread_count)
        })
        .catch(() => {
          // Ignore errors; keep showing the last known-good notifications.
        })
    }

    loadNotifications()
    const intervalId = setInterval(loadNotifications, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [accessToken])

  async function handleMarkRead(notificationId) {
    try {
      await markNotificationRead(accessToken, notificationId)
      setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // Leave the notification in place so the user can retry.
    }
  }

  async function handleMarkTaskDone(taskId) {
    try {
      await updateTaskStatus(accessToken, taskId, 'done')
      setDashboard((prev) => ({
        ...prev,
        tasks: {
          count: prev.tasks.count - 1,
          tasks: prev.tasks.tasks.filter((task) => task.id !== taskId),
        },
      }))
    } catch {
      // Leave the task in place so the user can retry.
    }
  }

  async function handleCreateTask(taskData) {
    const { task } = await createTask(accessToken, taskData)
    setDashboard((prev) => ({
      ...prev,
      tasks: {
        count: prev.tasks.count + 1,
        tasks: [...prev.tasks.tasks, task],
      },
    }))
  }

  async function handleCancelBooking(bookingId) {
    try {
      await cancelBooking(accessToken, bookingId)
      setDashboard((prev) => ({
        ...prev,
        upcoming_bookings: {
          count: prev.upcoming_bookings.count - 1,
          bookings: prev.upcoming_bookings.bookings.filter((booking) => booking.id !== bookingId),
        },
      }))
    } catch {
      // Leave the booking in place so the user can retry.
    }
  }

  function handleGoToMessages(event) {
    event.preventDefault()
    if (!messageStudentId.trim()) return
    navigate(`/messages/${encodeURIComponent(messageStudentId.trim())}`)
  }

  // dashboard.upcoming_bookings.bookings already comes back ordered ascending
  // by scheduled_at (see server/src/routes/bookings.helpers.js's
  // `ORDER BY b.scheduled_at ASC`), so the first entry is the soonest
  // booking. Sliced defensively here rather than mutating/re-sorting.
  const upcomingBookings = dashboard?.upcoming_bookings?.bookings ?? []
  const nextBooking = upcomingBookings[0] ?? null
  const laterBookings = upcomingBookings.slice(1)

  return (
    <PageContainer>
      <PageHeader title="Dashboard" meta={`Logged in as ${(user && (user.name || user.email)) || 'user'}`} />

      {dashboardStatus === 'success' && nextBooking && (
        <NextSessionSpotlight booking={nextBooking} isElle={isElle} onCancelBooking={handleCancelBooking} />
      )}

      {dashboardStatus === 'error' && <ErrorAlert>{dashboardError}</ErrorAlert>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left column: things that need action. */}
        <div className="flex flex-col gap-6">
          {dashboardStatus === 'loading' && (
            <>
              <SectionCardSkeleton />
              <SectionCardSkeleton />
            </>
          )}
          {dashboardStatus === 'success' && dashboard && (
            <>
              <SectionCard title="Upcoming bookings" icon={CalendarDays} accent={getCategoricalAccent(0)}>
                <BookingList bookings={laterBookings} showStudent={isElle} onCancel={handleCancelBooking} />
              </SectionCard>

              <SectionCard title={`Tasks (${dashboard.tasks.count})`} icon={CheckSquare} accent={getCategoricalAccent(1)}>
                <TasksSectionContent
                  tasks={dashboard.tasks}
                  onMarkTaskDone={handleMarkTaskDone}
                  onCreateTask={isElle ? handleCreateTask : undefined}
                  students={students}
                  studentsStatus={studentsStatus}
                  studentsError={studentsError}
                />
              </SectionCard>
            </>
          )}
        </div>

        {/* Right column: things worth knowing about. */}
        <div className="flex flex-col gap-6">
          <SectionCard title={`Notifications (${unreadCount} unread)`} icon={Bell} accent={getCategoricalAccent(2)}>
            <NotificationsSectionContent notifications={notifications} onMarkRead={handleMarkRead} />
          </SectionCard>

          {dashboardStatus === 'loading' && (
            <>
              <SectionCardSkeleton />
              <SectionCardSkeleton />
            </>
          )}
          {dashboardStatus === 'success' && dashboard && (
            <>
              <SectionCard title={`Pending video reviews (${dashboard.pending_video_reviews.count})`} icon={Video} accent={getCategoricalAccent(0)}>
                <PendingVideoReviewsContent reviews={dashboard.pending_video_reviews} showStudent={isElle} />
              </SectionCard>

              {isElle && (
                <SectionCard title="Student progress" icon={GraduationCap} accent={getCategoricalAccent(1)}>
                  <StudentProgressContent progress={dashboard.student_progress} />
                </SectionCard>
              )}

              <SectionCard
                title={
                  isElle
                    ? `Unread messages (${dashboard.unread_messages.total_count})`
                    : `Unread messages (${dashboard.unread_messages.count})`
                }
                icon={MessageSquare}
                accent={getCategoricalAccent(2)}
              >
                <UnreadMessagesContent messages={dashboard.unread_messages} isElle={isElle} user={user} />
              </SectionCard>
            </>
          )}
        </div>
      </div>

      {isElle && (
        <Card>
          <CardContent>
            <form onSubmit={handleGoToMessages}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="message-student-id">Go to a student&apos;s message thread</FieldLabel>
                  <StudentSelect
                    id="message-student-id"
                    value={messageStudentId}
                    onChange={setMessageStudentId}
                    students={students}
                    status={studentsStatus}
                  />
                  <FieldDescription>
                    {studentsStatus === 'error' ? studentsError : 'Select a student to view their message thread.'}
                  </FieldDescription>
                </Field>
                <div>
                  <Button type="submit">Go</Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}

// Every dashboard section shares this shape: a Card with a real <h2> title
// (CardTitle renders a <div>, which would drop it from screen-reader heading
// navigation) styled to match CardTitle's usual treatment, plus CardContent.
// `icon`/`accent` (a categoricalPalette entry) give the header band its own
// solid fill from the shared palette -- MASTER.md's reference (solid
// lime/violet cards, dark-ink text) applied per-widget. Solid color is
// confined to the header band, not the full card: text-muted-foreground
// inside CardContent's lists fails contrast against every one of these
// fills (checked directly), so list content stays on the plain card
// surface where that pairing already works.
function SectionCard({ title, icon: Icon, accent, children }) {
  return (
    <Card className={cn(accent && 'pt-0')}>
      <CardHeader className={cn(accent && accent.solidBg, 'py-3')}>
        <div className="flex items-center gap-2.5">
          {Icon && accent && <Icon className="size-4.5 shrink-0 text-foreground" aria-hidden="true" />}
          <h2 className={cn('m-0 text-base leading-snug font-medium', accent && 'text-foreground')}>{title}</h2>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  )
}

// Loose approximation of a SectionCard's shape for the loading state — not
// pixel-perfect, just enough that the two-column grid doesn't look broken
// while the dashboard fetch is in flight.
function SectionCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-1/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </CardContent>
    </Card>
  )
}

// The reference's "Next session" spotlight becomes a lime-filled highlight
// card per MASTER.md's Layout Pattern section for Dashboard — the single
// soonest upcoming booking pulled out above everything else. Only rendered
// when a next booking exists — no empty hero tile.
function NextSessionSpotlight({ booking, isElle, onCancelBooking }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-lime p-5 text-on-lime shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="m-0 text-sm font-medium opacity-80">Next session</p>
        <p className="m-0 font-heading text-xl leading-tight font-extrabold">
          {formatSlotDate(booking.scheduled_at)} · {formatSlotTime(booking.scheduled_at)}
        </p>
        {isElle && <p className="m-0 text-sm opacity-80">{booking.student_name}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {booking.joinable && <JoinClassLink bookingId={booking.id} size="default" />}
        <Button
          size="sm"
          variant="outline"
          className="border-on-lime/30 bg-transparent text-on-lime hover:bg-on-lime/10"
          onClick={() => onCancelBooking(booking.id)}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

function NotificationsSectionContent({ notifications, onMarkRead }) {
  if (notifications.length === 0) return <EmptyState>No unread notifications.</EmptyState>

  return (
    <ul className="flex flex-col">
      {notifications.map((notification) => (
        <li key={notification.id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
          <span className="flex min-w-0 items-center gap-3">
            <RowIcon icon={Bell} />
            <span className="flex min-w-0 flex-col gap-0.5">
              {notification.type}
              <span className="text-sm text-muted-foreground">{notification.created_at}</span>
            </span>
          </span>
          <Button size="sm" variant="outline" onClick={() => onMarkRead(notification.id)}>
            Mark read
          </Button>
        </li>
      ))}
    </ul>
  )
}

function PendingVideoReviewsContent({ reviews, showStudent }) {
  if (reviews.videos.length === 0) return <EmptyState>No videos awaiting review.</EmptyState>

  return (
    <ul className="flex flex-col">
      {reviews.videos.map((video) => (
        <li key={video.id} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
          <RowIcon icon={Video} />
          <span className="flex min-w-0 flex-col gap-0.5">
            <Link to={`/videos/${video.id}`} className="font-medium text-primary hover:underline">
              {video.title}
            </Link>
            <span className="text-sm text-muted-foreground">
              {showStudent ? `${video.student_name} · ${video.created_at}` : video.created_at}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

// Shortlist of the least-progressed students (dashboard.student_progress,
// already sorted/capped server-side — see computeAllStudentsProgress in
// server/src/routes/students.helpers.js) so elle can spot who's falling
// behind without opening the full Students section.
function StudentProgressContent({ progress }) {
  if (!progress || progress.students.length === 0) return <EmptyState>No students yet.</EmptyState>

  return (
    <>
      <ul className="flex flex-col">
        {progress.students.map((student) => {
          const percent =
            student.total_questions > 0 ? Math.round((student.completed_questions / student.total_questions) * 100) : 0
          return (
            <li key={student.student_id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
              <span className="flex min-w-0 items-center gap-3">
                <RowIcon icon={GraduationCap} />
                <Link to={`/students/${student.student_id}`} className="font-medium text-primary hover:underline">
                  {student.student_name}
                </Link>
              </span>
              <Badge variant={percent >= 50 ? 'success' : 'warning'}>{percent}% complete</Badge>
            </li>
          )
        })}
      </ul>
      <Link to="/students" className="text-sm font-medium text-primary hover:underline">
        View all students
      </Link>
    </>
  )
}

function UnreadMessagesContent({ messages, isElle, user }) {
  if (isElle) {
    if (messages.by_student.length === 0) return <EmptyState>No unread messages.</EmptyState>

    return (
      <ul className="flex flex-col">
        {messages.by_student.map((entry) => (
          <li key={entry.student_id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
            <span className="flex min-w-0 items-center gap-3">
              <RowIcon icon={MessageSquare} />
              <Link to={`/messages/${entry.student_id}`} className="font-medium text-primary hover:underline">
                {entry.student_name}
              </Link>
            </span>
            <Badge variant="accent">{entry.unread_count} unread</Badge>
          </li>
        ))}
      </ul>
    )
  }

  if (messages.count === 0) return null

  return (
    <Link to={`/messages/${encodeURIComponent(user.id)}`} className="font-medium text-primary hover:underline">
      View messages
    </Link>
  )
}

function TasksSectionContent({ tasks, onMarkTaskDone, onCreateTask, students, studentsStatus, studentsError }) {
  return (
    <>
      {tasks.count === 0 && <EmptyState>No pending tasks.</EmptyState>}
      {tasks.count > 0 && (
        <ul className="flex flex-col">
          {tasks.tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
              <span className="flex min-w-0 items-center gap-3">
                <RowIcon icon={CheckSquare} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  {task.title}
                  {task.due_date && <span className="text-sm text-muted-foreground">Due {task.due_date}</span>}
                </span>
              </span>
              <Button size="sm" variant="outline" onClick={() => onMarkTaskDone(task.id)}>
                Mark done
              </Button>
            </li>
          ))}
        </ul>
      )}
      {onCreateTask && (
        <CreateTaskForm
          onCreateTask={onCreateTask}
          students={students}
          studentsStatus={studentsStatus}
          studentsError={studentsError}
        />
      )}
    </>
  )
}

function CreateTaskForm({ onCreateTask, students, studentsStatus, studentsError }) {
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim()) return

    try {
      await onCreateTask({
        title: title.trim(),
        assigned_to: assignedTo.trim() ? assignedTo.trim() : null,
        due_date: dueDate || null,
      })
      setTitle('')
      setAssignedTo('')
      setDueDate('')
      setError(null)
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border pt-4">
      <FieldGroup>
        <h3 className="m-0">Add task</h3>
        {error && <ErrorAlert>{error}</ErrorAlert>}
        <Field>
          <FieldLabel htmlFor="task-title">Title</FieldLabel>
          <Input
            id="task-title"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="task-assigned-to">Assign to (optional)</FieldLabel>
          <StudentSelect
            id="task-assigned-to"
            value={assignedTo}
            onChange={setAssignedTo}
            students={students}
            status={studentsStatus}
            emptyLabel="— No student —"
          />
          {studentsStatus === 'error' && <FieldDescription>{studentsError}</FieldDescription>}
        </Field>
        <Field>
          <FieldLabel htmlFor="task-due-date">Due date (optional)</FieldLabel>
          <Input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </Field>
        <div>
          <Button type="submit">Add task</Button>
        </div>
      </FieldGroup>
    </form>
  )
}
