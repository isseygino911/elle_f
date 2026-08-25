import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/LanguageContext'
import { compareToEasternToday, formatSlotDate } from '@/utils/formatSlotTime'

// The course's homework, as one flat curriculum list.
//
// WHY THIS IS NOT RecordEntry. RecordTimeline draws a connecting rail with a
// dot node down the left edge, which is right for a booking history -- the
// rail says "these happen in sequence, in time". Homework in a course is a
// numbered contents list, not a timeline: the reference numbers each item and
// leads it with a typed tile. Reusing RecordEntry here would mean either
// carrying a rail that means nothing or gutting a component four other pages
// depend on, so this row is its own thing and RecordTimeline is left alone.
//
// WHY THERE IS NO GROUPING. This list was banded by urgency (Overdue /
// Upcoming / No due date / Drafts) until the user removed it: a course's
// contents read as one ordered body of work, and four headers over what is
// usually three or four rows spent more height on labels than on content.
// Urgency did not disappear with the bands -- it moved to the badge on each
// row, which is where the reference carries it too.
//
// The leading number is derived from array POSITION, not stored. Nothing in
// the schema orders assignments (there is no position column anywhere in this
// app), so the number is a reading aid for the order the server already
// returns -- due date first, then id -- and not a promise that it can be
// changed.
export default function CurriculumList({ assignments, courseId }) {
  const { t } = useLanguage()

  return (
    <ol className="flex flex-col gap-2">
      {assignments.map((assignment, index) => {
        const overdue =
          assignment.status === 'published' &&
          assignment.due_date &&
          compareToEasternToday(assignment.due_date) < 0

        return (
          <li key={assignment.id}>
            <Link
              to={`/courses/${courseId}/assignments/${assignment.id}`}
              className="border-border bg-card hover:bg-muted focus-visible:ring-ring/50 flex items-center gap-3 rounded-lg border p-3 transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
            >
              {/* The index and the tile are one unit: the number alone reads as
                  a bullet, the tile alone loses the ordering. */}
              <span className="text-muted-foreground w-6 shrink-0 text-right text-xs tabular-nums">
                {index + 1}
              </span>
              <span
                aria-hidden="true"
                className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
              >
                <ClipboardList className="size-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{assignment.title}</span>
                {/* One meta line, two facts, in the reference's "type · detail"
                    shape. The type is spelled out because a course will later
                    hold more than homework, and a row that says only a date
                    would not say what kind of thing it is. */}
                <span className="text-muted-foreground block truncate text-xs">
                  {t('assignments.itemType')}
                  {' · '}
                  {assignment.due_date
                    ? `${t('assignments.due')} ${formatSlotDate(assignment.due_date)}`
                    : t('assignments.noDueDate')}
                </span>
              </span>

              {/* Overdue outranks published: a row that is both should say the
                  one the teacher has to act on. Draft is only ever visible to
                  the teaching side -- the server filters it for a student. */}
              <Badge
                variant={
                  overdue ? 'priorityHigh' : assignment.status === 'published' ? 'priorityLow' : 'outline'
                }
                className="shrink-0"
              >
                {overdue
                  ? t('assignments.overdue')
                  : assignment.status === 'published'
                    ? t('assignments.published')
                    : t('assignments.draft')}
              </Badge>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
