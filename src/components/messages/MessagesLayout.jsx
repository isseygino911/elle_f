import { useEffect, useState } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
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
  const isElle = Boolean(user && user.role === 'elle')
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
      title="Messages"
      list={list}
      listEmpty={status === 'loading' ? 'Loading students…' : status === 'error' ? 'Could not load students.' : 'No students yet.'}
      outletContext={{ students }}
    />
  )
}

// Rendered at `/messages` with no `:studentId` selected yet. Elle sees the
// list panel's own empty state; a student has no list to select from, so
// they're sent straight into their one thread instead of a dead end.
export function MessagesIndex() {
  const { user } = useAuth()
  const isElle = Boolean(user && user.role === 'elle')

  if (!isElle && user) {
    return <Navigate to={`/messages/${encodeURIComponent(user.id)}`} replace />
  }

  return <EmptyDetailState>Select a student from the list to see their conversation.</EmptyDetailState>
}
