import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Archive, Plus } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { canManageCourses } from '../../lib/roles.js'
import { listCourses } from '../../api/client.js'
import { withCount } from '@/utils/withCount'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageContainer, PageHeader, LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import { cn } from '@/lib/utils'

// 'all' is a client-side filter, not a server one: GET /courses takes exactly
// one status (courses.route.js:134-135) and its schema admits only these two,
// so All fetches both and merges rather than growing a backend parameter for
// a presentation choice.
const FILTERS = [
  { value: 'all', labelKey: 'courses.filterAll' },
  { value: 'active', labelKey: 'courses.statusActive' },
  { value: 'archived', labelKey: 'courses.statusArchived' },
]

// The course catalog for /courses -- an event-feed composition adapted from a
// reference list pattern: a titled panel, a chip filter row, rows grouped
// under headers, and a count footer.
//
// The reference groups by day and anchors each row with a timestamp. A course
// has neither, so status carries the grouping instead and the right edge holds
// the status pill. The counts that were their own columns move into the
// '·'-joined meta line under the title, which is what lets a row stay one
// scannable unit rather than five aligned cells.
//
// Grouping and the filter would otherwise say the same thing twice, so 'All'
// is the default: it is the only view where the group headers do real work.
//
// Unlike the videos list, there is no filter at all for a STUDENT: a student
// sees the courses they are enrolled in, and the server already returns active
// ones by default. Offering them an "archived" filter would surface finished
// courses they have no action to take on.
export default function CoursesLayout() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const isTeaching = canManageCourses(user)

  const [status, setStatus] = useState('loading') // loading | success | error
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)
  // A student never sees the chips, and their payload is active-only anyway.
  const [filter, setFilter] = useState(isTeaching ? 'all' : 'active')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    const request =
      filter === 'all'
        ? // Concurrent, not sequential: they are independent requests and the
          // list cannot render until both land either way.
          Promise.all([
            listCourses(accessToken, { status: 'active' }),
            listCourses(accessToken, { status: 'archived' }),
          ]).then(([active, archived]) => ({
            courses: [...active.courses, ...archived.courses],
          }))
        : listCourses(accessToken, { status: filter })

    request
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
  }, [accessToken, filter])

  const studentTotal = useMemo(
    () => courses.reduce((total, course) => total + (course.student_count ?? 0), 0),
    [courses],
  )

  // Active before archived, alphabetical within each: a course list has no
  // "needs attention first" ordering the way an inbox does, so the useful
  // order is the one that lets you find a course whose name you know.
  // localeCompare so zh titles sort by their own rules, not by code point.
  const groups = useMemo(() => {
    const buckets = { active: [], archived: [] }
    for (const course of courses) {
      buckets[course.status === 'archived' ? 'archived' : 'active'].push(course)
    }
    for (const list of Object.values(buckets)) {
      list.sort((a, b) => a.title.localeCompare(b.title))
    }
    return [
      { key: 'active', labelKey: 'courses.groupActive', rows: buckets.active },
      { key: 'archived', labelKey: 'courses.groupArchived', rows: buckets.archived },
    ].filter((group) => group.rows.length > 0)
  }, [courses])

  // Headers and the per-row status pill are alternatives, not companions:
  // exactly one of them should carry the status at any time.
  const grouped = groups.length > 1

  const meta =
    status === 'success' && courses.length > 0
      ? [
          courses.length === 1
            ? t('courses.metaSummaryOne')
            : withCount(t('courses.metaSummary'), courses.length),
          ...(isTeaching
            ? [
                studentTotal === 1
                  ? t('courses.metaEnrolledOne')
                  : withCount(t('courses.metaEnrolled'), studentTotal),
              ]
            : []),
        ].join(' · ')
      : undefined

  return (
    <PageContainer>
      <PageHeader
        title={t('courses.title')}
        meta={meta}
        actions={
          isTeaching ? (
            // Base UI's Button composes via `render`, not asChild — asChild
            // is not a prop it knows, so React forwards it to the <button>
            // and warns about an unrecognized DOM attribute. Same pattern as
            // LibraryPage and the Sheet/Tooltip triggers.
            <Button
              render={
                <Link to="/courses/new">
                  <Plus /> {t('courses.new')}
                </Link>
              }
            />
          ) : null
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground m-0 text-sm">
            {isTeaching ? t('courses.panelSubtitle') : t('courses.panelSubtitleStudent')}
          </p>

          {isTeaching && (
            // Segmented, not three loose pills: the three are one choice, and
            // a shared track says so where separated chips would read as three
            // independent toggles.
            <div
              className="bg-muted inline-flex w-fit flex-wrap gap-1 rounded-full p-1"
              role="group"
              aria-label={t('courses.filterLabel')}
            >
              {FILTERS.map((option) => {
                const active = filter === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                      'focus-visible:ring-[3px] focus-visible:ring-lime/50 focus-visible:outline-none',
                      active
                        ? 'bg-lime text-on-lime'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t(option.labelKey)}
                  </button>
                )
              })}
            </div>
          )}

          {status === 'loading' && <LoadingText>{t('courses.loading')}</LoadingText>}
          {status === 'error' && <ErrorAlert>{error || t('courses.loadError')}</ErrorAlert>}
          {status === 'success' && courses.length === 0 && (
            <EmptyState>{t('courses.empty')}</EmptyState>
          )}

          {status === 'success' &&
            groups.map((group) => (
              <div key={group.key} className="flex flex-col gap-2">
                {/* A header over the only group on screen states what the
                    active filter chip already says. It appears when there are
                    two runs to tell apart, which is the All view. */}
                {grouped && (
                  <h2 className="text-muted-foreground m-0 px-1 text-xs font-medium tracking-wide uppercase">
                    {t(group.labelKey)}
                  </h2>
                )}
                <ul className="flex flex-col gap-2">
                  {group.rows.map((course) => {
                    const archived = course.status === 'archived'
                    const Icon = archived ? Archive : BookOpen
                    const rowMeta = [
                      course.teacher_name,
                      ...(isTeaching
                        ? [
                            course.student_count === 1
                              ? t('courses.rowStudentsOne')
                              : withCount(t('courses.rowStudents'), course.student_count ?? 0),
                          ]
                        : []),
                    ]
                      .filter(Boolean)
                      .join(' · ')

                    return (
                      <li key={course.id}>
                        <Link
                          to={`/courses/${course.id}`}
                          className={cn(
                            'border-border bg-card flex items-center gap-3 rounded-sm border p-3',
                            'hover:bg-muted/50 transition-colors',
                            'focus-visible:ring-[3px] focus-visible:ring-lime/50 focus-visible:outline-none'
                          )}
                        >
                          <CourseThumbnail url={course.thumbnail_url} icon={Icon} />
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-sm font-semibold">{course.title}</span>
                            {/* One '·'-joined line rather than aligned columns:
                                at a row's scale these are attributes of the
                                course, not a series you compare down the page. */}
                            <span className="text-muted-foreground truncate text-xs">
                              {rowMeta}
                            </span>
                          </span>
                          {/* The reference anchors each row with a value that
                              differs row to row. Under a group header that
                              already names the status, a status pill here
                              would only repeat it -- so the right edge carries
                              the homework count instead, which is the number a
                              teacher actually acts on. The pill returns when a
                              filter removes the headers. */}
                          {isTeaching && (
                            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                              {course.published_assignment_count === 1
                                ? t('courses.rowHomeworkOne')
                                : withCount(
                                    t('courses.rowHomework'),
                                    course.published_assignment_count ?? 0,
                                  )}
                            </span>
                          )}
                          {!grouped && (
                            <Badge
                              variant={archived ? 'outline' : 'priorityLow'}
                              className="shrink-0"
                            >
                              {archived ? t('courses.statusArchived') : t('courses.statusActive')}
                            </Badge>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}

          {status === 'success' && courses.length > 0 && (
            <p className="text-muted-foreground m-0 px-1 text-xs">
              {courses.length === 1
                ? t('courses.countFooterOne')
                : withCount(t('courses.countFooter'), courses.length)}
            </p>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

// The row's leading mark. Same degrade-to-icon behaviour as RecordCard's own
// thumbnail -- these are presigned URLs and one left open long enough expires.
function CourseThumbnail({ url, icon: Icon }) {
  const [failed, setFailed] = useState(false)

  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        onError={() => setFailed(true)}
        className="size-10 shrink-0 rounded-md object-cover"
      />
    )
  }

  // A tile, not a circle: the reference frames its icons in the same rounded
  // square the cover occupies, so a course with no cover keeps the row's shape.
  return (
    <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md">
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}
