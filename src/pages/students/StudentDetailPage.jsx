import { useCallback, useEffect, useId, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { cn } from '@/lib/utils'
import { getStudentDetail } from '../../api/client.js'
import {
  formatBookingDayParts,
  formatBookingMonthKey,
  formatBookingMonthLabel,
  formatSlotDate,
  formatSlotTime,
  formatVideoDuration,
} from '../../utils/formatSlotTime.js'
import { Badge } from '@/components/ui/badge'
import { PageContainer, PageHeader, LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import AssignTeacherCard from '@/components/students/AssignTeacherCard'
import { StudentTabs, StudentTabPanel } from '@/components/students/StudentTabs'

// One student: their bookings, courses, homework and videos.
//
// All of it arrives from a single GET /students/:id/detail. This page used to
// fetch the WHOLE roster and .find() the row out of it, because no per-student
// read existed -- that endpoint now exists, and it returns the related
// collections too, so the roster fetch is gone entirely.
//
// The four collections are TABBED rather than stacked. Stacked, this page runs
// several screens long and the sections below the fold are invisible until you
// scroll; tabbed, the counts are all readable at once and each collection gets
// the full pane. The tab strip carries the counts, so it doubles as the
// overview row -- no separate band of stat tiles competing with it.
//
// The glass treatment is frosted LIGHT, not the dark glass of the reference
// shot: this pane sits beside a dark list panel but is itself a light surface,
// as CourseDetailPage and VideoDetailPage are. Translucency here means the
// tinted canvas (--color-surface) showing through a near-white card, which is
// what gives the depth without turning this into the only dark detail page.

// EVERY colour below is an opacity fraction of an EXISTING token, never a
// literal white or rgba. Tokens are re-derived per organization from the accent
// hue (see tokens.css), so a hardcoded `border-white/50` would survive the
// theme switch while everything around it changed -- the glass has to be
// themed glass, not white glass. The accent specifically is `lime`, which is
// the tenant accent variable rather than a literal lime (orgThemes.js rewrites
// it per org), so the rail nodes follow whatever palette the org is on.
//
// The translucency is real rather than simulated: AppShell paints
// .panel-gradient on the content column one ancestor above this page, so a
// half-opaque card genuinely shows the tenant-tinted wash through it.
//
// The entries no longer carry a card of their own. Eight bordered cards
// stacked vertically read as a table wearing card costumes -- every row the
// same weight, nothing to scan by. They now sit directly on the panel and earn
// their separation from the rail, the grouping and the status tone instead,
// which is also why the opacity ladder that mattered for nested cards no
// longer applies: there is only one translucent surface here, the panel.

// The frosted panel behind whichever tab is active -- the body of the folder
// whose tabs sit on its top edge.
//
// Square top corners, rounded bottom: the tab strip overlaps this edge and
// supplies the rounding on its own top corners, so rounding here too would
// bite a visible notch out of the join. shadow-md against the rows' shadow-sm
// keeps the nesting reading as container-then-cards. ring-foreground/5 is the
// soft inner glow -- dialog.jsx uses /10 for the same trick, halved here
// because this ring sits on an already-translucent surface where /10 reads as
// a second border.
//
// The ring is dropped from the top edge (ring-inset would trace the seam the
// active tab just erased); the border does the same job on the three sides
// that still need an outline.
function GlassPanel({ children }) {
  return (
    <div className="rounded-b-lg border border-border/60 bg-card/70 p-3 shadow-md ring-1 ring-foreground/5 supports-backdrop-filter:bg-card/50 supports-backdrop-filter:backdrop-blur-xs sm:p-4">
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bookings timeline
// ---------------------------------------------------------------------------
//
// Bookings get a timeline instead of the shared Row list the other three tabs
// use. Eight rows carrying the same icon, the same "30 min" subtitle and a
// status pill are a table wearing card costumes: every row has identical
// visual weight, so the schedule's actual shape -- which months are busy,
// what is still coming, what fell through -- is invisible.
//
// Grouping by month restores that shape, and de-emphasising cancelled entries
// lets the sessions that actually happened carry the page.

// A group of records under one header -- a month for bookings, a status band
// for the other three.
//
// The meta count rides in the header rather than in a separate stat band, for
// the same reason the tab strip carries the collection counts: same
// information, no extra vertical furniture competing with the content.
function RecordGroup({ label, meta, children }) {
  return (
    <section className="flex flex-col gap-1">
      <header className="flex items-baseline justify-between gap-3 border-b border-border/40 px-1 pb-1.5">
        <h3 className="text-sm font-semibold">{label}</h3>
        {meta && <span className="text-muted-foreground text-xs tabular-nums">{meta}</span>}
      </header>
      <ul className="flex flex-col">{children}</ul>
    </section>
  )
}

// One record on the rail -- shared by all four tabs.
//
// TONE IS THE HIERARCHY. Three tones, three weights:
//   'accent'  -- solid accent node, full opacity. The records that still want
//                something: an upcoming session, an unsubmitted assignment.
//   'muted'   -- filled grey node, full opacity. Real, but settled. Bookings'
//                `completed` state was previously indistinguishable from
//                `cancelled` despite being its own enum value.
//   'dimmed'  -- recessive (opacity-60), hollow node, title struck through.
//                Cancelled sessions and archived courses: auditable, no
//                longer competing for attention.
//
// `lead` is the fixed-width left column: a weekday/day stack for dated
// records, and nothing at all for records whose date is not the point.
// Keeping it fixed-width is what holds the titles aligned down a group.
function RecordEntry({ tone = 'muted', lead, title, meta, badge, to }) {
  const dimmed = tone === 'dimmed'

  const inner = (
    <>
      {/* The rail: a node plus the connecting line running down to the next
          entry's node.

          The line is anchored to the NODE (top-3.5, just under the node's own
          centre) rather than to the row's midpoint, and -bottom-6 carries it
          through the gap py-2 opens between rows. Anchoring it to the row
          instead leaves a stub floating between two nodes it never touches --
          the node is top-aligned via mt-1.5, so the row's centre sits well
          below it. group-last/entry:hidden drops the trailing line so the rail
          ends ON the final node instead of dangling past it. */}
      <span className="relative flex w-3 shrink-0 justify-center self-stretch">
        <span
          aria-hidden="true"
          className="absolute top-3.5 -bottom-6 left-1/2 w-px -translate-x-1/2 bg-border/60 group-last/entry:hidden"
        />
        <span
          aria-hidden="true"
          className={cn(
            'relative z-10 mt-1.5 size-2 shrink-0 rounded-full',
            tone === 'accent' && 'bg-lime',
            tone === 'muted' && 'bg-muted-foreground/50',
            dimmed && 'border border-border bg-card'
          )}
        />
      </span>

      {lead}

      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-sm font-medium', dimmed && 'line-through')}>
          {title}
        </span>
        {meta && <span className="text-muted-foreground block truncate text-xs">{meta}</span>}
      </span>

      {badge}
    </>
  )

  // A row links out only when there is somewhere to go. A booking has no
  // detail page of its own, so it stays inert rather than pointing at a route
  // that would 404 -- and only the linked ones take the stronger hover.
  const className = cn(
    'group/entry flex items-center gap-3 rounded-md px-1 py-2 transition-colors',
    dimmed && 'opacity-60'
  )

  return to ? (
    <li>
      <Link to={to} className={cn(className, 'hover:bg-card')}>
        {inner}
      </Link>
    </li>
  ) : (
    // Hover on an inert row is a readability aid, not an affordance, so the
    // fill stays subtle rather than implying somewhere to click.
    <li className={cn(className, 'hover:bg-card/60')}>{inner}</li>
  )
}

// The weekday/day stack used as `lead` by every dated record. Fixed width so
// single- and double-digit days stay aligned down a group.
function DateLead({ iso }) {
  const { weekday, day } = formatBookingDayParts(iso)
  return (
    <span className="w-9 shrink-0 text-center">
      <span className="text-muted-foreground block text-[0.6875rem] leading-tight uppercase">
        {weekday}
      </span>
      <span className="block text-base leading-tight font-semibold tabular-nums">{day}</span>
    </span>
  )
}

// Buckets dated records into consecutive months.
//
// The backend already returns bookings ORDER BY scheduled_at ASC, so entries
// arrive chronological and only the group keys need sorting -- which a Map
// preserves by insertion for free. Keyed on the EASTERN month
// (formatBookingMonthKey), never on sliced UTC digits: a session at 02:00Z on
// the 1st is still the previous month in Eastern time and belongs under the
// previous header.
function groupByMonth(records, getDate) {
  const groups = new Map()
  for (const record of records) {
    const iso = getDate(record)
    const key = formatBookingMonthKey(iso)
    if (!groups.has(key)) {
      groups.set(key, { key, label: formatBookingMonthLabel(iso), records: [] })
    }
    groups.get(key).records.push(record)
  }
  return [...groups.values()]
}

// Buckets records into named bands (active/archived, submitted/not started).
// `bands` is an ordered [{ key, label, match }] list; empty bands are dropped
// so a panel never shows a header with nothing under it.
function groupByBand(records, bands) {
  return bands
    .map((band) => ({ ...band, records: records.filter(band.match) }))
    .filter((band) => band.records.length > 0)
}

export default function StudentDetailPage() {
  const { id } = useParams()
  const { accessToken } = useAuth()
  const { t } = useLanguage()

  const [status, setStatus] = useState('loading') // loading | success | error
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('bookings')
  const panelBaseId = useId()

  // Selecting a different student resets to the first tab. Without this,
  // opening a student while "Videos" is active lands on Videos for someone
  // whose videos you have not asked about -- the tab is a view of the previous
  // student's page, not a preference to carry over.
  useEffect(() => {
    setTab('bookings')
  }, [id])

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const body = await getStudentDetail(accessToken, id)
      setDetail(body)
      setStatus('success')
    } catch (err) {
      // A student outside the caller's scope is a 404, indistinguishable from
      // one that does not exist -- deliberate on the server, so both read as
      // "not found" here too.
      setError(err.status === 404 ? t('students.notFound') : (err.body && err.body.message) || err.message)
      setStatus('error')
    }
  }, [accessToken, id, t])

  useEffect(() => {
    let cancelled = false
    // The cancelled flag guards the unmount/id-change race: there is no
    // react-query in this codebase, every fetch is hand-rolled this way.
    ;(async () => {
      if (!cancelled) await load()
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  if (status === 'loading') {
    return (
      <PageContainer>
        <LoadingText>{t('students.loading')}</LoadingText>
      </PageContainer>
    )
  }

  if (status === 'error') {
    return (
      <PageContainer>
        <ErrorAlert>{error}</ErrorAlert>
      </PageContainer>
    )
  }

  const { student, bookings, courses, homework, videos } = detail

  // A submission that does not exist has no status of its own, hence the
  // separate "not started" label. The other two reuse submissions.* so this
  // page and the submissions page name the same state identically.
  function submissionBadge(submission) {
    if (!submission) return <Badge variant="outline">{t('students.notSubmitted')}</Badge>
    return submission.status === 'reviewed' ? (
      <Badge variant="priorityLow">{t('submissions.reviewed')}</Badge>
    ) : (
      <Badge variant="violet">{t('submissions.submitted')}</Badge>
    )
  }

  const tabs = [
    { id: 'bookings', label: t('students.bookings'), count: bookings.count },
    { id: 'courses', label: t('students.courses'), count: courses.count },
    { id: 'homework', label: t('students.homework'), count: homework.count },
    { id: 'videos', label: t('students.videos'), count: videos.count },
  ]

  return (
    // The records panel spans the FULL pane width rather than sharing a flex
    // row with the assign-teacher rail. The rail took 18rem off every tab's
    // content, which the bookings timeline feels most: its row is a date
    // column plus a dual-timezone time plus a status badge, and squeezing that
    // into a narrower column truncates the China half of the time. The rail is
    // one small card and reads fine above the folder, so the tabs get the
    // whole width instead.
    <div className="flex flex-col gap-6 p-6">
      <div className="min-w-0">
        <PageContainer className="p-0">
          <PageHeader title={student.name} meta={student.email} />

          {/* Owner-only; renders null for a teacher. Sits above the folder
              because it is an action, not a record -- and on its own row it
              stays narrow rather than stretching to the full pane width.
              Reloads the page data so a reassignment is reflected everywhere. */}
          <div className="mb-6 w-full lg:max-w-72">
            <AssignTeacherCard student={student} onAssigned={load} />
          </div>

          {/* No gap between strip and panel: the tabs overlap the panel's top
              edge to form the folder join, and any gap here would pull them
              back apart into two separate objects. */}
          <div className="flex flex-col">
            <StudentTabs
              tabs={tabs}
              activeId={tab}
              onChange={setTab}
              label={t('students.sections')}
              baseId={panelBaseId}
            />

            <GlassPanel>
              {/* BOOKINGS -- grouped by month, the one collection whose
                  natural axis is time. */}
              <StudentTabPanel baseId={panelBaseId} id="bookings" activeId={tab}>
                {bookings.bookings.length === 0 ? (
                  <EmptyState>{t('students.bookingsEmpty')}</EmptyState>
                ) : (
                  <div className="flex flex-col gap-4">
                    {groupByMonth(bookings.bookings, (booking) => booking.scheduled_at).map(
                      (group) => (
                        <RecordGroup
                          key={group.key}
                          label={group.label}
                          meta={`${group.records.filter((booking) => booking.status === 'booked').length} ${t('students.bookedCount')}`}
                        >
                          {group.records.map((booking) => (
                            <RecordEntry
                              key={booking.id}
                              tone={
                                booking.status === 'booked'
                                  ? 'accent'
                                  : booking.status === 'cancelled'
                                    ? 'dimmed'
                                    : 'muted'
                              }
                              lead={<DateLead iso={booking.scheduled_at} />}
                              title={formatSlotTime(booking.scheduled_at)}
                              meta={`${booking.duration_min} ${t('students.minutes')}`}
                              badge={
                                <Badge
                                  variant={booking.status === 'booked' ? 'priorityLow' : 'outline'}
                                >
                                  {t(`students.${booking.status}`)}
                                </Badge>
                              }
                            />
                          ))}
                        </RecordGroup>
                      )
                    )}
                  </div>
                )}
              </StudentTabPanel>

              {/* COURSES -- banded active/archived rather than by month: a
                  course's enrolment date is not what you scan for, its
                  standing is. Archived courses dim to the back. */}
              <StudentTabPanel baseId={panelBaseId} id="courses" activeId={tab}>
                {courses.courses.length === 0 ? (
                  <EmptyState>{t('students.coursesEmpty')}</EmptyState>
                ) : (
                  <div className="flex flex-col gap-4">
                    {groupByBand(courses.courses, [
                      {
                        key: 'active',
                        label: t('students.activeCourses'),
                        match: (course) => course.status !== 'archived',
                      },
                      {
                        key: 'archived',
                        label: t('students.archived'),
                        match: (course) => course.status === 'archived',
                      },
                    ]).map((band) => (
                      <RecordGroup key={band.key} label={band.label} meta={band.records.length}>
                        {band.records.map((course) => (
                          <RecordEntry
                            key={course.id}
                            tone={course.status === 'archived' ? 'dimmed' : 'accent'}
                            title={course.title}
                            meta={course.teacher_name}
                            to={`/courses/${course.id}`}
                            badge={
                              course.status === 'archived' ? (
                                <Badge variant="outline">{t('students.archived')}</Badge>
                              ) : null
                            }
                          />
                        ))}
                      </RecordGroup>
                    ))}
                  </div>
                )}
              </StudentTabPanel>

              {/* HOMEWORK -- banded by what still needs doing. "Not started"
                  leads because it is the only band that is actionable. */}
              <StudentTabPanel baseId={panelBaseId} id="homework" activeId={tab}>
                {homework.assignments.length === 0 ? (
                  <EmptyState>{t('students.homeworkEmpty')}</EmptyState>
                ) : (
                  <div className="flex flex-col gap-4">
                    {groupByBand(homework.assignments, [
                      {
                        key: 'outstanding',
                        label: t('students.notSubmitted'),
                        match: (assignment) => !assignment.submission,
                      },
                      {
                        // `submission && status !== reviewed`, not just the
                        // status check: a null submission's `?.status` is
                        // undefined, which is also !== 'reviewed', so the
                        // looser form files every unsubmitted assignment in
                        // this band too and double-counts it.
                        key: 'submitted',
                        label: t('submissions.submitted'),
                        match: (assignment) =>
                          assignment.submission && assignment.submission.status !== 'reviewed',
                      },
                      {
                        key: 'reviewed',
                        label: t('submissions.reviewed'),
                        match: (assignment) => assignment.submission?.status === 'reviewed',
                      },
                    ]).map((band) => (
                      <RecordGroup key={band.key} label={band.label} meta={band.records.length}>
                        {band.records.map((assignment) => (
                          <RecordEntry
                            key={assignment.id}
                            tone={
                              !assignment.submission
                                ? 'accent'
                                : assignment.submission.status === 'reviewed'
                                  ? 'dimmed'
                                  : 'muted'
                            }
                            lead={assignment.due_date ? <DateLead iso={assignment.due_date} /> : null}
                            title={assignment.title}
                            meta={`${assignment.course_title} · ${
                              assignment.due_date
                                ? `${t('students.due')} ${formatSlotDate(assignment.due_date)}`
                                : t('students.noDueDate')
                            }`}
                            to={`/courses/${assignment.course_id}/assignments/${assignment.id}`}
                            badge={submissionBadge(assignment.submission)}
                          />
                        ))}
                      </RecordGroup>
                    ))}
                  </div>
                )}
              </StudentTabPanel>

              {/* VIDEOS -- grouped by month like bookings: a video library is
                  read chronologically, newest work in context of when it was
                  submitted. Pending review takes the accent. */}
              <StudentTabPanel baseId={panelBaseId} id="videos" activeId={tab}>
                {videos.videos.length === 0 ? (
                  <EmptyState>{t('students.videosEmpty')}</EmptyState>
                ) : (
                  <div className="flex flex-col gap-4">
                    {groupByMonth(videos.videos, (video) => video.created_at).map((group) => (
                      <RecordGroup key={group.key} label={group.label} meta={group.records.length}>
                        {group.records.map((video) => (
                          <RecordEntry
                            key={video.id}
                            tone={video.status === 'reviewed' ? 'muted' : 'accent'}
                            lead={<DateLead iso={video.created_at} />}
                            title={video.title}
                            meta={formatVideoDuration(video.duration_sec)}
                            to={`/videos/${video.id}`}
                            badge={
                              <Badge variant={video.status === 'reviewed' ? 'priorityLow' : 'violet'}>
                                {video.status === 'reviewed'
                                  ? t('students.videoReviewed')
                                  : t('students.videoPending')}
                              </Badge>
                            }
                          />
                        ))}
                      </RecordGroup>
                    ))}
                  </div>
                )}
              </StudentTabPanel>
            </GlassPanel>
          </div>
        </PageContainer>
      </div>
    </div>
  )
}
