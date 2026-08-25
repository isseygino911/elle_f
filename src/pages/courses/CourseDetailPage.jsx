import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ClipboardList, ImagePlus, Plus, Trash2, UserPlus, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { canManageCourses } from '../../lib/roles.js'
import { useStudents } from '../../hooks/useStudents.js'
import { initials } from '@/utils/initials'
import {
  getCourse,
  listAssignments,
  enrollStudent,
  unenrollStudent,
  updateCourse,
  deleteCourse,
  uploadCourseThumbnail,
  deleteCourseThumbnail,
} from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress, ProgressValue } from '@/components/ui/progress'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageContainer, BackLink, ErrorAlert, LoadingText, EmptyState } from '@/components/Page'
import { GlassPanel, RecordGroup, RecordEntry } from '@/components/records/RecordTimeline'
import { cn } from '@/lib/utils'
import CurriculumList from '@/components/courses/CurriculumList'
import StudentSelect from '@/components/StudentSelect'
import ConfirmDialog from '@/components/ConfirmDialog'

// Mirrors the server's cover-image limits (middleware/upload.js). The server
// stays the real boundary -- these exist only to fail a doomed upload before
// it costs the user a round-trip.
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024

// A course: its homework, and (for the teaching side) its roster.
//
// A STUDENT sees the homework list and nothing else. The server withholds the
// roster from them entirely -- getCourse returns an empty `students` array --
// so there is no enrollment section to hide here; it simply has no data.
//
// TWO COLUMNS, not one. Homework is what the page is for and takes the width;
// the roster is a reference list of a handful of people and reads fine in a
// 16rem rail beside it. StudentDetailPage pulled its own 18rem rail out for
// costing the bookings timeline too much room -- the difference is that a
// booking row carries a dual-timezone time that truncates, where a roster row
// is a name, an email and a short count. Under lg: this collapses and the
// roster stacks below, which is also where the pane itself goes full-width.
//
// Homework renders as ONE FLAT CURRICULUM LIST, not grouped. It was banded by
// urgency (Drafts / Overdue / Upcoming / No due date) until the user removed
// the bands: a course's contents read as a single ordered body of work, and
// four headers over what is typically three or four rows spent more height on
// labels than on the homework itself. Urgency survives as the badge on each
// row -- see CurriculumList, which owns that decision now.

export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const isTeaching = canManageCourses(user)

  const [status, setStatus] = useState('loading')
  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [enrollId, setEnrollId] = useState('')
  const [busy, setBusy] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(false)
  // Separate from `busy`: an upload in flight should not grey out Archive and
  // Delete, and the cover button needs its own label while it works.
  const [thumbnailBusy, setThumbnailBusy] = useState(false)
  // A presigned cover URL that 403s once it expires would otherwise leave a
  // broken-image box across the top of the page. Cleared on upload so a
  // fresh URL gets a fresh chance to load.
  const [coverFailed, setCoverFailed] = useState(false)
  const thumbnailInputRef = useRef(null)
  // Enrollment errors are held separately from actionError: the dialog is
  // modal, so an error rendered at page level while it is open is behind it
  // and effectively invisible.
  const [enrollError, setEnrollError] = useState(null)
  // The server's two-step delete: the first call comes back 409 with the counts
  // of what would be destroyed, which is what this holds.
  const [pendingDelete, setPendingDelete] = useState(null)

  const { students: roster, status: rosterStatus } = useStudents(accessToken, { enabled: isTeaching })

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const [courseBody, assignmentBody] = await Promise.all([
        getCourse(accessToken, id),
        listAssignments(accessToken, id),
      ])
      setCourse(courseBody.course)
      setStudents(courseBody.students ?? [])
      setAssignments(assignmentBody.assignments)
      setStatus('success')
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
      setStatus('error')
    }
  }, [accessToken, id])

  useEffect(() => {
    load()
  }, [load])

  async function handleEnroll(event) {
    event.preventDefault()
    if (!enrollId) return
    setEnrollError(null)
    setBusy(true)
    try {
      await enrollStudent(accessToken, id, enrollId)
      setEnrollId('')
      setEnrollOpen(false)
      await load()
    } catch (err) {
      setEnrollError((err.body && err.body.message) || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleUnenroll(studentId) {
    setActionError(null)
    setBusy(true)
    try {
      await unenrollStudent(accessToken, id, studentId)
      await load()
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleArchiveToggle() {
    setActionError(null)
    setBusy(true)
    try {
      await updateCourse(accessToken, id, {
        status: course.status === 'archived' ? 'active' : 'archived',
      })
      await load()
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    } finally {
      setBusy(false)
    }
  }

  // Validated client-side before upload as a courtesy -- the server's multer
  // filter is the real boundary and enforces the same allowlist and cap.
  // Checking here just saves a doomed 5MB round-trip.
  async function handleThumbnailChange(event) {
    const file = event.target.files?.[0]
    // Reset immediately so picking the same file twice still fires onChange.
    event.target.value = ''
    if (!file) return

    setActionError(null)

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setActionError(t('courses.coverWrongType'))
      return
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      setActionError(t('courses.coverTooLarge'))
      return
    }

    setThumbnailBusy(true)
    setCoverFailed(false)
    try {
      await uploadCourseThumbnail(accessToken, id, file)
      await load()
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    } finally {
      setThumbnailBusy(false)
    }
  }

  async function handleThumbnailRemove() {
    setActionError(null)
    setThumbnailBusy(true)
    try {
      await deleteCourseThumbnail(accessToken, id)
      await load()
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    } finally {
      setThumbnailBusy(false)
    }
  }

  // Two-step by design. The first call carries no confirm, so the server either
  // deletes an empty course outright or answers 409 with the counts -- which is
  // the only place those numbers exist, since they describe rows that are about
  // to stop existing.
  async function handleDelete({ confirm } = {}) {
    setActionError(null)
    setBusy(true)
    try {
      await deleteCourse(accessToken, id, { confirm })
      setPendingDelete(null)
      navigate('/courses')
    } catch (err) {
      if (err.body && err.body.confirmation_required) {
        setPendingDelete(err.body)
      } else {
        setActionError((err.body && err.body.message) || err.message)
        setPendingDelete(null)
      }
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') {
    return (
      <PageContainer>
        <LoadingText>{t('courses.loading')}</LoadingText>
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

  const totalHomework = course.published_assignment_count ?? 0

  return (
    // p-6 here and p-0 on the container: PageContainer carries its own px-5,
    // and keeping both stacks the two paddings, which overflows a narrow pane.
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="min-w-0">
        <PageContainer className="p-0">
          {/* gap-3 rather than the container's gap-6: the description belongs
              to the title, and at the wider gap it floats free of it. */}
          <div className="flex flex-col gap-3">
            {/* The list is a page of its own now rather than a rail still
                visible alongside, so the way back has to live here. */}
            <BackLink to="/courses">{t('courses.backToList')}</BackLink>
            {/* The cover, finally rendered. It was uploadable and removable
                from this page but only ever displayed as a 40px thumbnail in
                the list, so a teacher could set one and never see it.
                Nothing is drawn when there is no cover: a full-width empty
                placeholder is a louder absence than a missing image.
                onError degrades the same way the list thumbnail does --
                these are presigned URLs and they expire. */}
            {course.thumbnail_url && !coverFailed && (
              <img
                src={course.thumbnail_url}
                alt=""
                onError={() => setCoverFailed(true)}
                // Capped rather than a pure aspect ratio: at 21/9 across the
                // full content column the cover pushed the title and every
                // action below the fold, which inverts the page -- you come
                // here for the curriculum, not the picture.
                className="max-h-56 w-full rounded-lg object-cover"
              />
            )}
            {/* ONE header row: status, title, metadata and actions, rather
                than a title block with a separate action row under it.
                Those were structurally adjacent already, but `justify-between`
                across an empty left slot (the status badge, absent on every
                active course) left half the row doing nothing and made the
                buttons read as floating. Opposing them against the TITLE
                instead gives the row an anchor that is always there.

                text-2xl, not PageHeader's text-4xl sm:text-5xl: that size is
                calibrated for a standing page name -- "Courses", "Students" --
                a short phrase the product chose, shown once. A course title is
                arbitrary user data one level below it, under a back link that
                has already said where we are. At 5xl a two-word title spent
                ~120px saying nothing extra. PageHeader itself is untouched;
                this page just stops using it. */}
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex min-w-0 items-center gap-2">
                  {/* Status as a dot, not a permanent "Active" pill. Archived
                      is the exception that changes what the page means, so it
                      keeps the badge; active is the unremarkable default and a
                      solid pill on nearly every course is noise next to an
                      already-bold title. The dot is aria-hidden and paired
                      with sr-only text -- color alone is not a status, and
                      "Active" previously appeared NOWHERE in the DOM, so this
                      is the first time the affirmative state is announced at
                      all. Grey when archived so the dot and the badge agree
                      rather than a live green sitting beside "Archived". */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      course.status === 'archived' ? 'bg-muted-foreground' : 'bg-success'
                    )}
                  />
                  <span className="sr-only">
                    {course.status === 'archived'
                      ? t('courses.statusArchived')
                      : t('courses.statusActive')}
                  </span>
                  {/* truncate, not wrap: a wrapping title reopens the
                      unbounded-header-height problem this row exists to fix. */}
                  <h1 className="font-heading m-0 truncate text-2xl leading-tight font-bold tracking-tight">
                    {course.title}
                  </h1>
                  {course.status === 'archived' && (
                    <Badge variant="outline" className="shrink-0">
                      {t('courses.archivedBadge')}
                    </Badge>
                  )}
                </div>
                {course.teacher_name && (
                  <p className="text-muted-foreground m-0 text-sm">{course.teacher_name}</p>
                )}
                {course.description && (
                  // Inside the title block now rather than a sibling of it:
                  // title, teacher and description are one unit. max-w-prose
                  // is the fix for a description that otherwise runs the full
                  // pane as one unbroken measure.
                  <p className="text-muted-foreground mt-1 max-w-prose text-sm leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>

              {isTeaching && (
                // Wraps to its own line when the row runs out of width, which
                // at 64rem content width with four buttons is often -- that is
                // the intended behaviour, not a breakpoint to design around.
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                {/* `render`, not asChild — see the note in CoursesLayout. */}
                <Button
                  size="sm"
                  render={
                    <Link to={`/courses/${course.id}/assignments/new`}>
                      <Plus /> {t('assignments.new')}
                    </Link>
                  }
                />
                {/* The cover control. A hidden input driven by a visible
                    button, the same shape OrganizationSettingsPage uses for
                    the brand logo -- a bare file input cannot be styled to
                    match the buttons beside it. */}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={busy || thumbnailBusy}
                >
                  <ImagePlus />
                  {thumbnailBusy
                    ? t('courses.coverUploading')
                    : course.thumbnail_url
                      ? t('courses.coverReplace')
                      : t('courses.coverAdd')}
                </Button>
                {course.thumbnail_url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleThumbnailRemove}
                    disabled={busy || thumbnailBusy}
                  >
                    {t('courses.coverRemove')}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleArchiveToggle} disabled={busy}>
                  {course.status === 'archived' ? t('courses.unarchive') : t('courses.archive')}
                </Button>
                {/* Ghost, not destructive. The loudest treatment on the page
                    was going to its rarest and most dangerous action, which is
                    backwards -- and the two-step ConfirmDialog is what
                    actually carries the safety here, not the button's fill.
                    destructive/10 is an opacity fraction of an existing token,
                    so it follows the tenant palette. */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete({})}
                  disabled={busy}
                >
                  <Trash2 /> {t('courses.delete')}
                </Button>
                </div>
              )}
            </div>
          </div>

          {/* Below the header, not inside it: an action's failure belongs in
              the page's flow where it is read, not wedged into a row whose
              width is already spoken for by the buttons that caused it. */}
          {actionError && <ErrorAlert>{actionError}</ErrorAlert>}

          {/* 20rem, not narrower: at 16rem the roster's names and emails both
              truncated, which is the one thing this column exists to show, and
              at 18rem the homework column still stopped short of the canvas
              edge on a wide viewport. grid-cols-[minmax(0,1fr)] on the stacked
              case is load-bearing -- a default `auto` track takes its width
              from the widest row's intrinsic content and refuses to shrink
              under it, which pushes the whole page into horizontal scroll on a
              narrow pane. items-start keeps the roster from stretching to the
              homework column's height. */}
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <GlassPanel className="rounded-lg">
              <div className="flex flex-col gap-4">
                {/* The panel names what it holds, as the reference's
                    "Curriculum: <course>" heading does. Without it the list
                    sits under the page header with nothing saying what the
                    rows are. */}
                <h2 className="text-base font-semibold">
                  {t('courses.curriculum')}
                  <span className="text-muted-foreground ml-2 text-sm font-normal tabular-nums">
                    {assignments.length}
                  </span>
                </h2>

                {assignments.length === 0 ? (
                  // A framed empty state, echoing the reference's panel -- but
                  // NOT a drop target. There is no create-by-drop flow here, and
                  // an area that looks droppable but is not is a dead
                  // affordance. The action inside it is the same route the
                  // header button uses.
                  <div className="border-border flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-10 text-center">
                    <ClipboardList className="text-muted-foreground size-6" aria-hidden="true" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{t('assignments.emptyTitle')}</p>
                      <p className="text-muted-foreground text-sm">{t('assignments.emptyHint')}</p>
                    </div>
                    {isTeaching && (
                      <Button
                        size="sm"
                        variant="outline"
                        render={
                          <Link to={`/courses/${course.id}/assignments/new`}>
                            <Plus /> {t('assignments.new')}
                          </Link>
                        }
                      />
                    )}
                  </div>
                ) : (
                  <CurriculumList assignments={assignments} courseId={course.id} />
                )}
              </div>
            </GlassPanel>

            {isTeaching && (
              <GlassPanel className="h-fit rounded-lg">
                <RecordGroup
                  label={t('courses.enrolled')}
                  meta={
                    // The enroll control rides in the group header rather than
                    // sitting in the content as a form. It is a rare admin
                    // action, and as a permanently-open card it was the
                    // heaviest object on the page -- above the roster it
                    // appends to.
                    <span className="flex items-center gap-1.5">
                      <span className="tabular-nums">{students.length}</span>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => {
                          setEnrollError(null)
                          setEnrollOpen(true)
                        }}
                        disabled={busy}
                        aria-label={t('courses.enrollStudent')}
                      >
                        <UserPlus />
                      </Button>
                    </span>
                  }
                >
                  {students.length === 0 ? (
                    <EmptyState>{t('courses.noStudents')}</EmptyState>
                  ) : (
                    students.map((student) => (
                      // No `to`: a roster row carries a Remove button, and a
                      // <button> nested inside RecordEntry's <Link> branch
                      // would be invalid HTML.
                      <RecordEntry
                        key={student.id}
                        tone="muted"
                        lead={
                          <Avatar size="sm" className="mt-0.5 shrink-0">
                            <AvatarFallback className="text-[0.625rem] font-semibold">
                              {initials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                        }
                        title={student.name}
                        meta={student.email}
                        // The bar goes UNDER the name rather than in its own
                        // column: in a 16rem rail a third column costs the name
                        // more width than the progress needs. Only rendered
                        // when there is published homework to be measured
                        // against -- n/0 is not a ratio.
                        below={
                          totalHomework > 0 ? (
                            <Progress
                              value={((student.submitted_count ?? 0) / totalHomework) * 100}
                              className="w-full gap-1"
                              aria-label={`${student.name}: ${student.submitted_count ?? 0} ${t('courses.progress')} ${totalHomework}`}
                            >
                              <ProgressValue className="ml-0 text-[0.625rem]">
                                {student.submitted_count ?? 0}/{totalHomework}
                              </ProgressValue>
                            </Progress>
                          ) : null
                        }
                        trailing={
                          // Icon-only: spelled out, "Remove" was as wide as
                          // the name it sat beside. aria-label keeps it named
                          // for a screen reader, and the student's name is in
                          // it so the control is unambiguous out of context.
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => handleUnenroll(student.id)}
                            disabled={busy}
                            aria-label={`${t('courses.remove')} — ${student.name}`}
                            title={t('courses.remove')}
                          >
                            <X />
                          </Button>
                        }
                      />
                    ))
                  )}
                </RecordGroup>
              </GlassPanel>
            )}
          </div>
        </PageContainer>
      </div>

      {/* Dialog, not AlertDialog: enrolling is a constructive one-decision
          form, where AlertDialog (what ConfirmDialog wraps) is for destructive
          confirmation. Open is driven from state with a plain Button rather
          than DialogTrigger asChild, which sidesteps the render-vs-asChild
          trap entirely. */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent>
          <form onSubmit={handleEnroll}>
            <DialogHeader>
              <DialogTitle>{t('courses.enrollTitle')}</DialogTitle>
              <DialogDescription>{t('courses.enrollDescription')}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-4">
              {enrollError && <ErrorAlert>{enrollError}</ErrorAlert>}
              <Field>
                <FieldLabel htmlFor="enroll-student">{t('courses.enrollStudent')}</FieldLabel>
                <StudentSelect
                  id="enroll-student"
                  value={enrollId}
                  onChange={setEnrollId}
                  students={roster}
                  status={rosterStatus}
                />
              </Field>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEnrollOpen(false)} disabled={busy}>
                {t('courses.cancel')}
              </Button>
              <Button type="submit" disabled={!enrollId || busy}>
                <UserPlus /> {busy ? t('courses.enrolling') : t('courses.enroll')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Named counts, not a generic "are you sure": the whole point of the
          server's confirm gate is that the teacher sees WHAT is destroyed. */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={t('courses.deleteTitle')}
        description={
          pendingDelete
            ? t('courses.deleteDescription')
                .replace('{submissions}', pendingDelete.submission_count)
                .replace('{students}', pendingDelete.student_count)
                .replace('{assignments}', pendingDelete.assignment_count)
                .replace('{enrolled}', pendingDelete.enrolled_count)
            : ''
        }
        confirmLabel={t('courses.delete')}
        pending={busy}
        onConfirm={() => handleDelete({ confirm: true })}
      />
    </div>
  )
}
