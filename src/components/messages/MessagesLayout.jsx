import { useEffect, useState } from 'react'
import { canManageStudents, isStudent } from '../../lib/roles.js'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { MessageSquare, Users } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { useStudents } from '../../hooks/useStudents.js'
import { getUnreadMessageCount } from '../../api/client.js'
import { withCount } from '@/utils/withCount'
import MasterDetailLayout from '@/components/records/MasterDetailLayout'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'
import EmptyDetailState from '@/components/records/EmptyDetailState'

// The persistent master list panel for `/messages` and `/messages/:studentId`
// — an inbox, not a dropdown-and-navigate form. Elle sees every student on
// the left (same RecordCard/MasterDetailLayout shape as Students/Videos/
// Surveys) with the selected thread on the right, with per-student unread
// counts beside each name.
//
// Those counts come from GET /messages/unread-count, which returns the same
// by_student breakdown the dashboard payload carries. This used to fetch the
// ENTIRE dashboard -- every video, task, booking and progress row -- to read
// one map out of it, which is a lot of query for a set of badges.
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

    getUnreadMessageCount(accessToken)
      .then((body) => {
        if (cancelled) return
        const map = {}
        for (const entry of body.by_student) {
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
              pillLabel={
                unreadByStudent[student.id]
                  ? unreadByStudent[student.id] === 1
                    ? t('messages.unreadPillOne')
                    : withCount(t('messages.unreadPill'), unreadByStudent[student.id])
                  : undefined
              }
              pillVariant="accent"
              selected={String(activeId) === String(student.id)}
            />
          </li>
        ))
      : []

  // How many correspondents are actually waiting on a reply -- the number this
  // screen exists to drive down. Counted from the unread map already fetched
  // for the pills, so the tiles cost no extra request.
  const withUnreadCount = students.filter((student) => unreadByStudent[student.id] > 0).length

  const statTiles =
    status === 'success' && students.length > 0 ? (
      <StatTiles
        tiles={[
          { label: t('messages.statStudents'), value: students.length, icon: Users },
          { label: t('messages.statUnread'), value: withUnreadCount, icon: MessageSquare },
        ]}
      />
    ) : null

  return (
    <MasterDetailLayout
      basePath="/messages"
      title={t('messages.title')}
      statTiles={statTiles}
      list={list}
      listEmpty={status === 'loading' ? t('messages.loading') : status === 'error' ? t('messages.loadError') : t('messages.empty')}
      // status travels with the students so the thread pane can tell "still
      // loading" apart from "no such student", and unreadByStudent so the
      // insight rail can report the same count the pill shows.
      outletContext={{ students, status, unreadByStudent }}
    />
  )
}

// Rendered at `/messages` with no `:studentId` selected yet. Elle sees the
// list panel's own empty state; a student has no list to select from, so
// they're sent straight into their one thread instead of a dead end.
export function MessagesIndex() {
  const { user } = useAuth()
  const { t } = useLanguage()

  // Only a STUDENT is redirected to their own thread. This deliberately does
  // not test "can manage students": a manager satisfies neither branch, and redirecting
  // them to /messages/<their own id> would send them to a student thread that
  // does not exist for them (and that they are forbidden from reading anyway).
  if (isStudent(user) && user) {
    return <Navigate to={`/messages/${encodeURIComponent(user.id)}`} replace />
  }

  return <EmptyDetailState>{t('messages.emptyDetail')}</EmptyDetailState>
}
