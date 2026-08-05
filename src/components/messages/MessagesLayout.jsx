import { useEffect, useState } from 'react'
import { canManageStudents, isStudent } from '../../lib/roles.js'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { useStudents } from '../../hooks/useStudents.js'
import { getDashboard } from '../../api/client.js'
import MasterDetailLayout from '@/components/records/MasterDetailLayout'
import RecordCard from '@/components/records/RecordCard'
import EmptyDetailState from '@/components/records/EmptyDetailState'

// The persistent master list panel for `/messages` and `/messages/:studentId`
// — an inbox, not a dropdown-and-navigate form. Elle sees every student on
// the left (same RecordCard/MasterDetailLayout shape as Students/Videos/
// Surveys) with the selected thread on the right, per-student unread counts
// pulled from the same dashboard.unread_messages.by_student data the
// Dashboard's own unread-messages widget already uses (no new query).
//
// A student only ever has one correspondent (Elle), so there's nothing to
// list — the layout renders the thread directly, full-width.
export default function MessagesLayout() {
  const { user, accessToken } = useAuth()
  const { t } = useLanguage()
  const isElle = canManageStudents(user)
  const { studentId: activeId } = useParams()
  const { students, status } = useStudents(accessToken, { enabled: isElle })

  const [unreadByStudent, setUnreadByStudent] = useState({})

  useEffect(() => {
    if (!isElle) return undefined
    let cancelled = false

    getDashboard(accessToken)
      .then((body) => {
        if (cancelled) return
        const map = {}
        for (const entry of body.unread_messages.by_student) {
          map[entry.student_id] = entry.unread_count
        }
        setUnreadByStudent(map)
      })
      .catch(() => {
        // Ignore errors; unread badges simply stay off until next visit.
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, isElle])

  // A student gets the bare thread with no student-list panel. Anyone else
  // who cannot manage students (a manager) also has no list to show -- but
  // must not be handed the student experience either, so they see the same
  // bare outlet, and the thread route itself will refuse them.
  if (!isElle) {
    return <Outlet />
  }

  const list =
    status === 'success'
      ? students.map((student) => (
          <li key={student.id}>
            <RecordCard
              to={`/messages/${student.id}`}
              icon={MessageSquare}
              title={student.name}
              meta={student.email}
              pillLabel={unreadByStudent[student.id] ? `${unreadByStudent[student.id]} unread` : undefined}
              pillVariant="accent"
              selected={String(activeId) === String(student.id)}
            />
          </li>
        ))
      : []

  return (
    <MasterDetailLayout
      basePath="/messages"
      title={t('messages.title')}
      list={list}
      listEmpty={status === 'loading' ? t('messages.loading') : status === 'error' ? t('messages.loadError') : t('messages.empty')}
      outletContext={{ students }}
    />
  )
}

// Rendered at `/messages` with no `:studentId` selected yet. Elle sees the
// list panel's own empty state; a student has no list to select from, so
// they're sent straight into their one thread instead of a dead end.
export function MessagesIndex() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const isElle = canManageStudents(user)

  // Only a STUDENT is redirected to their own thread. This deliberately does
  // not use `!isElle`: a manager satisfies neither branch, and redirecting
  // them to /messages/<their own id> would send them to a student thread that
  // does not exist for them (and that they are forbidden from reading anyway).
  if (isStudent(user) && user) {
    return <Navigate to={`/messages/${encodeURIComponent(user.id)}`} replace />
  }

  return <EmptyDetailState>{t('messages.emptyDetail')}</EmptyDetailState>
}
