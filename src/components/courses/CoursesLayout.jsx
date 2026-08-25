import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookOpen, Users, Archive, ClipboardList, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { canManageCourses } from '../../lib/roles.js'
import { listCourses } from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import MasterDetailLayout from '@/components/records/MasterDetailLayout'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'

const STATUS_OPTIONS = [
  { value: 'active', labelKey: 'courses.statusActive' },
  { value: 'archived', labelKey: 'courses.statusArchived' },
]

// The persistent master list panel + stat tiles for /courses and /courses/:id,
// following the VideosLayout composition exactly (MASTER.md Layout Pattern).
//
// Unlike the videos list, there is no status filter for a STUDENT: a student
// sees the courses they are enrolled in, and the server already returns active
// ones by default. Offering them an "archived" filter would surface finished
// courses they have no action to take on.
export default function CoursesLayout() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const { id: activeId } = useParams()
  const isTeaching = canManageCourses(user)

  const [status, setStatus] = useState('loading') // loading | success | error
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('active')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    listCourses(accessToken, { status: statusFilter })
      .then((body) => {
        if (!cancelled) {
          setCourses(body.courses)
          setStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err.body && err.body.message) || err.message)
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, statusFilter])

  // Counts computed from the already-fetched list -- no extra queries, per
  // MASTER.md's Layout Pattern section.
  const studentTotal = useMemo(
    () => courses.reduce((total, course) => total + (course.student_count ?? 0), 0),
    [courses],
  )

  const statTiles =
    status === 'success' && courses.length > 0 ? (
      <StatTiles
        tiles={[
          { label: t('courses.title'), value: courses.length, icon: BookOpen },
          ...(isTeaching
            ? [{ label: t('courses.enrolledCount'), value: studentTotal, icon: Users }]
            : []),
        ]}
      />
    ) : null

  const list =
    status === 'success'
      ? courses.map((course) => (
          <li key={course.id}>
            <RecordCard
              to={`/courses/${course.id}`}
              icon={course.status === 'archived' ? Archive : BookOpen}
              // Falls back to the icon above when the course has no cover.
              imageUrl={course.thumbnail_url ?? undefined}
              title={course.title}
              // The enrolled count moved out of this string and into a metric
              // chip: it is a number you scan down the column, and as the head
              // of a concatenated meta line it was the half that got truncated.
              meta={course.teacher_name}
              metrics={
                isTeaching
                  ? [
                      {
                        icon: Users,
                        value: course.student_count ?? 0,
                        label: t('courses.enrolled'),
                      },
                      // The reference shows a module count here. This app has
                      // no modules, so the chip carries what a course actually
                      // holds: its published homework. Already on the list
                      // payload -- no extra request.
                      {
                        icon: ClipboardList,
                        value: course.published_assignment_count ?? 0,
                        label: t('courses.homeworkCount'),
                      },
                    ]
                  : undefined
              }
              pillLabel={
                course.status === 'archived'
                  ? t('courses.statusArchived')
                  : t('courses.statusActive')
              }
              pillVariant={course.status === 'archived' ? 'outlineDark' : 'priorityLow'}
              selected={String(activeId) === String(course.id)}
            />
          </li>
        ))
      : []

  return (
    <MasterDetailLayout
      basePath="/courses"
      title={t('courses.title')}
      statTiles={statTiles}
      list={list}
      listEmpty={
        status === 'loading' ? t('courses.loading') : status === 'error' ? error : t('courses.empty')
      }
      filters={
        isTeaching ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('courses.filterLabel')}>
            {STATUS_OPTIONS.map((option) => {
              const active = statusFilter === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                    'focus-visible:ring-[3px] focus-visible:ring-lime/50 focus-visible:outline-none',
                    active
                      ? 'border-transparent bg-lime text-on-lime'
                      : 'border-dark-border bg-dark-card text-dark-muted hover:bg-dark-card-hover hover:text-white'
                  )}
                >
                  {t(option.labelKey)}
                  {/* Only the active filter carries a count. The list is
                      fetched already filtered, so the inactive one's total is
                      not on hand -- and a number that might be wrong is worse
                      than no number. */}
                  {active && status === 'success' && (
                    <span className="ml-1 tabular-nums opacity-70">{courses.length}</span>
                  )}
                </button>
              )
            })}
          </div>
        ) : null
      }
      actions={
        isTeaching ? (
          // Base UI's Button composes via `render`, not asChild — asChild
          // is not a prop it knows, so React forwards it to the <button>
          // and warns about an unrecognized DOM attribute. Same pattern as
          // LibraryPage and the Sheet/Tooltip triggers.
          <Button
            size="sm"
            className="h-7 text-xs"
            render={
              <Link to="/courses/new">
                <Plus /> {t('courses.new')}
              </Link>
            }
          />
        ) : null
      }
    />
  )
}
