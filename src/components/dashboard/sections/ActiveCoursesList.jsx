import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/lib/LanguageContext'
import { EmptyState } from '@/components/Page'

// The active-courses grid: one card per course, 2-up, each carrying the
// enrolled count as a badge and a progress bar underneath.
//
// The bar reports PUBLISHED ASSIGNMENTS, not a syllabus percentage. This app
// stores no syllabus and no completion target, so there is no honest
// denominator for "65% complete" -- the reference's number comes from a field
// that does not exist here. What does exist is how many assignments a course
// has published relative to the busiest course on the dashboard, which is a
// real comparison between real rows. It is labelled as what it is.
export default function ActiveCoursesList({ courses }) {
  const { t } = useLanguage()

  if (!courses || courses.length === 0) {
    return <EmptyState>{t('dashboard.noActiveCourses')}</EmptyState>
  }

  // The busiest course sets the scale. Without a stored target this is the
  // only denominator available that is not invented; at minimum 1 so a
  // single-assignment course does not divide by zero.
  const busiest = Math.max(1, ...courses.map((course) => course.published_assignment_count ?? 0))

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {courses.map((course) => {
        const published = course.published_assignment_count ?? 0
        const percent = Math.round((published / busiest) * 100)

        return (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            className="border-border bg-background hover:bg-muted focus-visible:ring-ring/50 flex flex-col gap-3 rounded-lg border p-4 transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">{course.title}</span>
                {course.teacher_name && (
                  <span className="text-muted-foreground truncate text-xs">
                    {course.teacher_name}
                  </span>
                )}
              </div>
              <span className="bg-muted text-muted-foreground flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium tabular-nums">
                <Users className="size-3.5" aria-hidden="true" />
                {course.student_count ?? 0}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{t('dashboard.publishedHomework')}</span>
                <span className="tabular-nums font-medium">{published}</span>
              </div>
              <Progress
                value={percent}
                className="[&_[data-slot=progress-track]]:h-1.5"
                aria-label={`${published} ${t('dashboard.publishedHomework')}`}
              />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
