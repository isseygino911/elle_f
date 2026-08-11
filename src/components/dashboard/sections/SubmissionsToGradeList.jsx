import { Link } from 'react-router-dom'
import { FileCheck } from 'lucide-react'
import DashboardRowIcon from '../DashboardRowIcon.jsx'
import { EmptyState } from '@/components/Page'
import { useLanguage } from '@/lib/LanguageContext'
import { formatSlotDate } from '@/utils/formatSlotTime'

// Homework handed in and waiting on a teacher's review.
//
// The counterpart to PendingVideoReviewsList: practice videos had a queue on
// the dashboard and written/recorded homework did not, even though a
// submission's status distinguishes 'submitted' from 'reviewed' precisely so
// this can be asked. Oldest first, matching the server's ORDER BY -- a review
// queue is worked front to back.
//
// Teacher-only by construction: the server puts submissions_to_grade on the
// teacher payload alone, so neither the manager nor the student dashboard can
// render this even by mistake.
export default function SubmissionsToGradeList({ submissions }) {
  const { t } = useLanguage()

  if (!submissions || submissions.submissions.length === 0) {
    return <EmptyState>{t('dashboard.noSubmissionsToGrade')}</EmptyState>
  }

  return (
    <ul className="flex flex-col">
      {submissions.submissions.map((submission) => (
        <li
          key={submission.id}
          className="flex items-center gap-3 border-b border-border py-3 last:border-b-0 last:pb-0"
        >
          <DashboardRowIcon icon={FileCheck} />
          <span className="flex min-w-0 flex-col gap-0.5">
            <Link
              to={`/courses/${submission.course_id}/assignments/${submission.assignment_id}`}
              className="truncate font-medium text-primary hover:underline"
            >
              {submission.assignment_title}
            </Link>
            {/* formatSlotDate, not the raw column: created_at is a full ISO
                timestamp, and interpolating it directly renders
                "2026-08-12T15:31:50.000Z" mid-row -- the bug already fixed in
                PendingVideoReviewsList. The same helper keeps the two review
                queues stating dates identically. */}
            <span className="truncate text-sm text-muted-foreground">
              {submission.student_name} · {formatSlotDate(submission.created_at)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
