import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/Page'
import { useLanguage } from '@/lib/LanguageContext'

// Homework falling due inside the dashboard's window.
//
// Deliberately NOT DashboardRowIcon, for the same reason UnreadDot is not:
// this card sits beside Tasks, and both are lists of dated things needing
// action. Tasks rows carry a circular muted icon; a due date is about WHEN, so
// this leads with the date itself, set in tabular numerals so the column of
// dates lines up and can be scanned rather than read.
//
// The server sends the same section to a student and to a teacher, but they
// mean different things -- a student's own homework versus every assignment
// across their courses -- so the course name is shown only to the teacher, for
// whom "which course" is the disambiguating fact.

// The server filters to `due_date >= CURDATE()`, so nothing overdue ever
// reaches this list. "Due today" is therefore the strongest urgency signal
// that honestly exists here, and it is the only thing that earns coral. An
// "Overdue" badge would be fiction.
function isDueToday(dueDate) {
  if (!dueDate) return false
  const today = new Date()
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`
  return dueDate.slice(0, 10) === localToday
}

export default function AssignmentsDueList({ assignments, showCourse }) {
  const { t } = useLanguage()

  if (assignments.count === 0) return <EmptyState>{t('dashboard.noHomeworkDue')}</EmptyState>

  return (
    <ul className="flex flex-col">
      {assignments.assignments.map((assignment) => {
        const dueToday = isDueToday(assignment.due_date)
        return (
          <li
            key={assignment.id}
            className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span
                className="flex size-8 shrink-0 flex-col items-center justify-center rounded-md bg-muted text-[0.65rem] font-semibold tabular-nums text-muted-foreground"
                aria-hidden="true"
              >
                {assignment.due_date ? assignment.due_date.slice(5).replace('-', '/') : '—'}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <Link
                  to={`/courses/${assignment.course_id}/assignments/${assignment.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {assignment.title}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {showCourse && assignment.course_title
                    ? `${assignment.course_title} · ${t('dashboard.due')} ${assignment.due_date}`
                    : `${t('dashboard.due')} ${assignment.due_date}`}
                </span>
              </span>
            </span>
            {dueToday && (
              <Badge variant="priorityHigh" className="shrink-0">
                {t('dashboard.dueToday')}
              </Badge>
            )}
          </li>
        )
      })}
    </ul>
  )
}
