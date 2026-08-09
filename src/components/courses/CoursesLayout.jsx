import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookOpen, Users, Archive, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { canManageCourses } from '../../lib/roles.js'
import { listCourses } from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MasterDetailLayout from '@/components/records/MasterDetailLayout'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
]

// Dark-themed override for the (light-by-default) shadcn Select, matching the
// filter in VideosLayout -- these sit inside the dark list panel.
const DARK_TRIGGER_CLASS =
  'h-7 w-full border-dark-border bg-dark-card-hover text-xs text-white data-placeholder:text-dark-muted focus-visible:border-lime focus-visible:ring-lime/50 [&_svg]:text-dark-muted'

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
          { label: 'Courses', value: courses.length, icon: BookOpen },
          ...(isTeaching ? [{ label: 'Enrolled', value: studentTotal, icon: Users }] : []),
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
              title={course.title}
              meta={
                isTeaching
                  ? `${course.student_count ?? 0} enrolled · ${course.teacher_name}`
                  : course.teacher_name
              }
              pillLabel={course.status === 'archived' ? 'Archived' : 'Active'}
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
      actions={
        isTeaching ? (
          <div className="flex w-32 flex-col gap-1.5">
            {/* Base UI's Button composes via `render`, not asChild — asChild
                is not a prop it knows, so React forwards it to the <button>
                and warns about an unrecognized DOM attribute. Same pattern as
                LibraryPage and the Sheet/Tooltip triggers. */}
            <Button
              size="sm"
              className="h-7 text-xs"
              render={
                <Link to="/courses/new">
                  <Plus /> {t('courses.new')}
                </Link>
              }
            />
            <Select value={statusFilter} onValueChange={setStatusFilter} items={STATUS_OPTIONS}>
              <SelectTrigger className={DARK_TRIGGER_CLASS}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null
      }
    />
  )
}
