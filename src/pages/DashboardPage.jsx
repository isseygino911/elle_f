import { useEffect, useState } from 'react'
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
        students={students}
        studentsStatus={studentsStatus}
        studentsError={studentsError}
        user={user}
      />
    </PageContainer>
  )
}
