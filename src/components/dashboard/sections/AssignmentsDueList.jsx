import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/Page'
import { useLanguage } from '@/lib/LanguageContext'
import { compareToEasternToday, formatBookingDayParts, formatSlotDate } from '@/utils/formatSlotTime'

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
//
// compareToEasternToday rather than a locally-built date string: "today" here
// means the EASTERN calendar day the due date was set in, not the viewer's.
// Building it from the browser's clock made the badge appear a day early or
// late for anyone outside Eastern time -- which for this app's China-side
// users is every single day.
function isDueToday(dueDate) {
  if (!dueDate) return false
  return compareToEasternToday(dueDate) === 0
}

// The leading date chip: weekday over day, in the Eastern calendar.
//
// formatBookingDayParts rather than slicing the ISO string -- a bare
// YYYY-MM-DD parses as UTC midnight, which is the previous evening in Eastern
// time, so slicing the digits printed the wrong day for anything near the
// boundary. Same helper the bookings timeline uses, so both agree on which day
// an instant belongs to.
function DueDateChip({ dueDate }) {
  const { weekday, day } = dueDate ? formatBookingDayParts(dueDate) : { weekday: '', day: '' }

  return (
    <span
      className="flex size-8 shrink-0 flex-col items-center justify-center rounded-md bg-muted text-[0.65rem] font-semibold tabular-nums text-muted-foreground"
      aria-hidden="true"
    >
      {dueDate ? (
        <>
          <span className="leading-none">{weekday}</span>
          <span className="leading-none">{day}</span>
        </>
      ) : (
        '—'
      )}
    </span>
  )
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
              <DueDateChip dueDate={assignment.due_date} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <Link
                  to={`/courses/${assignment.course_id}/assignments/${assignment.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {assignment.title}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {showCourse && assignment.course_title
                    ? `${assignment.course_title} · ${t('dashboard.due')} ${formatSlotDate(assignment.due_date)}`
                    : `${t('dashboard.due')} ${formatSlotDate(assignment.due_date)}`}
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
