import { useEffect, useState } from 'react'
import { canManageStudents, isStudent } from '../../lib/roles.js'
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { useStudents } from '../../hooks/useStudents.js'
import { getUnreadMessageCount } from '../../api/client.js'
import { withCount } from '@/utils/withCount'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { PageContainer, PageHeader, LoadingText, EmptyState, ErrorAlert } from '@/components/Page'

// The inbox for `/messages` and `/messages/:studentId`.
//
// This used to be a dark master-detail rail: a persistent list panel of
// RecordCards on the left with the thread beside it. It read as a second
// navigation next to the app's real sidebar -- two stacked columns of links
// before any content -- and each student cost a two-line card to say a name,
// an email and a number. A table says the same thing in one row, sorts the
// unread ones to the top, and gives the thread the whole width when it opens.
//
// Unread counts come from GET /messages/unread-count, which returns the same
// by_student breakdown the dashboard payload carries. This used to fetch the
// ENTIRE dashboard -- every video, task, booking and progress row -- to read
// one map out of it, which is a lot of query for a set of badges.
//
// A student only ever has one correspondent (Elle), so there's nothing to
// list — the layout renders the thread directly, full-width.
export default function MessagesLayout() {
  const { user, accessToken } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
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

  // A student gets the bare thread with no student table. Anyone else who
  // cannot manage students (a manager) also has no list to show -- but must
  // not be handed the student experience either, so they see the same bare
  // outlet, and the thread route itself will refuse them.
  if (!isElle) {
    return <Outlet />
  }

  // With a thread open the table steps aside entirely rather than shrinking
  // into a rail beside it. The URL stays the single source of truth for what
  // is shown, as it was under the master-detail layout.
  if (activeId) {
    return <Outlet context={{ students, status, unreadByStudent }} />
  }

  // Anyone waiting on a reply comes first -- the point of the screen is to
  // drive that number down, and it should not need a scan to find them.
  // Stable within each group: the roster order the server already sorted.
  const rows = [...students].sort(
    (a, b) => (unreadByStudent[b.id] || 0) - (unreadByStudent[a.id] || 0)
  )

  const withUnreadCount = students.filter((student) => unreadByStudent[student.id] > 0).length

  return (
    <PageContainer>
      <PageHeader
        title={t('messages.title')}
        meta={
          status === 'success' && students.length > 0
            ? withUnreadCount === 0
              ? t('messages.insightUnreadNone')
              : withUnreadCount === 1
                ? t('messages.metaWithUnreadOne')
                : withCount(t('messages.metaWithUnread'), withUnreadCount)
            : undefined
        }
      />

      {status === 'loading' && <LoadingText>{t('messages.loading')}</LoadingText>}
      {status === 'error' && <ErrorAlert>{t('messages.loadError')}</ErrorAlert>}
      {status === 'success' && students.length === 0 && <EmptyState>{t('messages.empty')}</EmptyState>}

      {status === 'success' && students.length > 0 && (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('messages.columnStudent')}</TableHead>
                  <TableHead>{t('messages.columnEmail')}</TableHead>
                  <TableHead className="text-right">{t('messages.columnStatus')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((student) => {
                  const unread = unreadByStudent[student.id] || 0
                  return (
                    // The whole row opens the thread, so the row -- not just
                    // the name -- is the target. It carries the link's own
                    // semantics (role, tabIndex, Enter) rather than nesting an
                    // anchor that would only cover one cell's worth of text.
                    <TableRow
                      key={student.id}
                      role="link"
                      tabIndex={0}
                      aria-label={student.name}
                      onClick={() => navigate(`/messages/${student.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/messages/${student.id}`)
                        }
                      }}
                      className="cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-none"
                    >
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      <TableCell className="text-right">
                        {unread > 0 ? (
                          <Badge variant="accent">
                            {unread === 1
                              ? t('messages.unreadPillOne')
                              : withCount(t('messages.unreadPill'), unread)}
                          </Badge>
                        ) : (
                          // Not an empty cell: the column reads as a status,
                          // and a blank one is ambiguous between "read" and
                          // "not loaded yet".
                          <span className="text-sm text-muted-foreground">{t('messages.noUnread')}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}

// Rendered at `/messages` with no `:studentId` selected yet. Elle sees the
// student table above; a student has no table to select from, so they're sent
// straight into their one thread instead of a dead end.
export function MessagesIndex() {
  const { user } = useAuth()

  // Only a STUDENT is redirected to their own thread. This deliberately does
  // not test "can manage students": a manager satisfies neither branch, and redirecting
  // them to /messages/<their own id> would send them to a student thread that
  // does not exist for them (and that they are forbidden from reading anyway).
  if (isStudent(user) && user) {
    return <Navigate to={`/messages/${encodeURIComponent(user.id)}`} replace />
  }

  return null
}
