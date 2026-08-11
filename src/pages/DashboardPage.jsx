import { useEffect, useRef, useState } from 'react'
import { canManageStudents, isManager } from '../lib/roles.js'
import ManagerDashboard from '../components/dashboard/ManagerDashboard.jsx'
import TeacherDashboard from '../components/dashboard/TeacherDashboard.jsx'
import StudentDashboard from '../components/dashboard/StudentDashboard.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import {
  getDashboard,
  createTask,
  updateTaskStatus,
  cancelBooking,
} from '../api/client.js'
import { useStudents } from '../hooks/useStudents.js'
import { PageContainer, PageHeader, ErrorAlert, LoadingText } from '@/components/Page'

// The dashboard's data layer and role router. Everything visual lives in the
// three role components under components/dashboard/.
//
// State stays here rather than moving into those components because all four
// mutation handlers update optimistically against the same two pieces of
// state; pushing them down would mean three copies of each.
//
// Notifications are NOT fetched here any more. That poll moved to
// NotificationContext, mounted in App above the router, so the bell's count
// stays live on every page instead of dying on navigation away from this one.
export default function DashboardPage() {
  const { user, accessToken } = useAuth()
  const { t } = useLanguage()
  const isElle = canManageStudents(user)
  const { students, status: studentsStatus, error: studentsError } = useStudents(accessToken, { enabled: isElle })

  const [dashboardStatus, setDashboardStatus] = useState('loading') // loading | success | error
  const [dashboard, setDashboard] = useState(null)
  const [dashboardError, setDashboardError] = useState(null)

  // Which survey the roster's progress is measured against. Null means "let
  // the server pick", which it answers with the most recent upload; once the
  // teacher chooses, this drives the refetch.
  const [surveyId, setSurveyId] = useState(null)
  // Distinguishes a survey switch from the initial load: the first shows the
  // skeleton, this one dims the picker and leaves the existing numbers in
  // place, because replacing a populated card with a skeleton on every change
  // makes the control feel like it reloaded the page.
  const [surveyPending, setSurveyPending] = useState(false)
  // Whether a payload has ever landed. See its use below for why this is a ref
  // rather than a read of `dashboard`.
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    // Only the very first fetch shows the loading state. A survey change
    // refetches the same payload, and dropping to the skeleton there would
    // throw away a rendered dashboard to redraw an identical one.
    //
    // Keyed on "have we rendered a dashboard yet", not on whether a survey id
    // is set: every refetch that replaces visible numbers dims the picker,
    // including the one that returns to the server-chosen default. Gating on
    // `surveyId != null` left that single transition silently un-dimmed.
    //
    // Read through a ref, not the state value: this effect must re-run on a
    // survey change, never on the payload it sets itself, and depending on
    // `dashboard` directly would refetch on every response forever.
    setDashboardStatus((prev) => (prev === 'success' ? prev : 'loading'))
    setSurveyPending(hasLoadedRef.current)

    getDashboard(accessToken, { surveyId })
      .then((body) => {
        if (!cancelled) {
          setDashboard(body)
          hasLoadedRef.current = true
          setDashboardStatus('success')
          setSurveyPending(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDashboardError((err.body && err.body.message) || err.message)
          setDashboardStatus('error')
          setSurveyPending(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, surveyId])

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

  const header = (
    <PageHeader
      title={t('dashboard.title')}
      meta={`${t('dashboard.loggedInAs')} ${(user && (user.name || user.email)) || 'user'}`}
    />
  )

  // A genuine three-way branch. Note this is NOT isElle / !isElle: a manager
  // is neither a teacher nor a student, and roles.js warns that
  // `!canManageStudents(user)` does not mean "is a student". Each role gets
  // its own component rather than one layout with conditionals -- that is
  // what keeps the manager's aggregate-only boundary structural.
  if (isManager(user)) {
    return (
      <PageContainer className="[--content-max-width:82rem]">
        {header}
        {dashboardStatus === 'loading' && <LoadingText>{t('dashboard.loading')}</LoadingText>}
        {dashboardStatus === 'error' && <ErrorAlert>{dashboardError}</ErrorAlert>}
        {dashboardStatus === 'success' && dashboard && <ManagerDashboard dashboard={dashboard} />}
      </PageContainer>
    )
  }

  const RoleDashboard = isElle ? TeacherDashboard : StudentDashboard

  return (
    <PageContainer className="[--content-max-width:82rem]">
      {header}
      {dashboardStatus === 'error' && <ErrorAlert>{dashboardError}</ErrorAlert>}
      <RoleDashboard
        dashboard={dashboard}
        status={dashboardStatus}
        onMarkTaskDone={handleMarkTaskDone}
        onCreateTask={isElle ? handleCreateTask : undefined}
        onCancelBooking={handleCancelBooking}
        onSelectSurvey={setSurveyId}
        surveyPending={surveyPending}
        students={students}
        studentsStatus={studentsStatus}
        studentsError={studentsError}
        user={user}
      />
    </PageContainer>
  )
}
