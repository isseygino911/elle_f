import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import DashboardRowIcon from '../DashboardRowIcon.jsx'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/Page'
import { useLanguage } from '@/lib/LanguageContext'

// Shortlist of the least-progressed students (dashboard.student_progress,
// already sorted/capped server-side — see computeAllStudentsProgress in
// server/src/routes/students.helpers.js) so a teacher can spot who's falling
// behind without opening the full Students section.
//
// Never rendered for a manager: this names individual students, which is
// exactly what that role must not receive. The manager dashboard is a
// separate component that does not import this one.
export default function StudentProgressList({ progress }) {
  const { t } = useLanguage()

  if (!progress || progress.students.length === 0) return <EmptyState>{t('dashboard.noStudents')}</EmptyState>

  // An org that has uploaded no survey has no curriculum to be measured
  // against, so every row would read 0% -- which looks like a roster that has
  // done nothing rather than one that has not been set any work yet. Say so
  // instead of drawing a wall of zeroes.
  if (progress.surveys && progress.surveys.length === 0) {
    return <EmptyState>{t('dashboard.noSurveysUploaded')}</EmptyState>
  }

  return (
    <>
      <ul className="flex flex-col">
        {progress.students.map((student) => {
          // completion_ratio, not a re-derivation from the raw counts: the
          // server already computed exactly this, and the duplicate formula
          // that used to live here (and in ProgressDistribution) meant the
          // survey-scoping fix had to be made correctly in three places
          // instead of one.
          const percent = Math.round((student.completion_ratio ?? 0) * 100)
          return (
            <li
              key={student.student_id}
              className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0"
            >
              <span className="flex min-w-0 items-center gap-3">
                <DashboardRowIcon icon={GraduationCap} />
                <Link to={`/students/${student.student_id}`} className="font-medium text-primary hover:underline">
                  {student.student_name}
                </Link>
              </span>
              <Badge variant={percent >= 50 ? 'success' : 'warning'}>
                {percent}% {t('dashboard.percentComplete')}
              </Badge>
            </li>
          )
        })}
      </ul>
      <Link to="/students" className="text-sm font-medium text-primary hover:underline">
        {t('dashboard.viewAllStudents')}
      </Link>
    </>
  )
}
