import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, UserPlus, FileText, CalendarClock } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { canManageCourses } from '../../lib/roles.js'
import { useStudents } from '../../hooks/useStudents.js'
import {
  getCourse,
  listAssignments,
  enrollStudent,
  unenrollStudent,
  updateCourse,
  deleteCourse,
} from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { PageContainer, PageHeader, ErrorAlert, LoadingText, EmptyState } from '@/components/Page'
import StudentSelect from '@/components/StudentSelect'
import ConfirmDialog from '@/components/ConfirmDialog'

// A course: its assignments, and (for the teaching side) its roster.
//
// A STUDENT sees the assignment list and nothing else. The server withholds the
// roster from them entirely -- getCourse returns an empty `students` array --
// so there is no enrollment section to hide here; it simply has no data.
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
    setActionError(null)
    setBusy(true)
    try {
      await enrollStudent(accessToken, id, enrollId)
      setEnrollId('')
      await load()
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
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

  return (
    <PageContainer>
      <PageHeader
        title={course.title}
        meta={`${course.teacher_name}${course.status === 'archived' ? ' · Archived' : ''}`}
      />

      {course.description && <p className="text-muted-foreground text-sm">{course.description}</p>}

      {actionError && <ErrorAlert>{actionError}</ErrorAlert>}

      {isTeaching && (
        <div className="flex flex-wrap gap-2">
          {/* `render`, not asChild — see the note in CoursesLayout. */}
          <Button
            size="sm"
            render={
              <Link to={`/courses/${course.id}/assignments/new`}>
                <Plus /> {t('assignments.new')}
              </Link>
            }
          />
          <Button size="sm" variant="outline" onClick={handleArchiveToggle} disabled={busy}>
            {course.status === 'archived' ? t('courses.unarchive') : t('courses.archive')}
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete({})} disabled={busy}>
            <Trash2 /> {t('courses.delete')}
          </Button>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold">{t('assignments.title')}</h2>
        {assignments.length === 0 ? (
          <EmptyState>{t('assignments.empty')}</EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {assignments.map((assignment) => (
              <li key={assignment.id}>
                <Link
                  to={`/courses/${course.id}/assignments/${assignment.id}`}
                  className="flex items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FileText className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{assignment.title}</span>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      {assignment.due_date ? (
                        <>
                          <CalendarClock className="size-3" aria-hidden="true" />
                          {t('assignments.due')} {assignment.due_date}
                        </>
                      ) : (
                        t('assignments.noDueDate')
                      )}
                    </span>
                  </span>
                  {/* Draft is only ever visible to the teaching side -- the
                      server filters the list for a student. */}
                  <Badge variant={assignment.status === 'published' ? 'priorityLow' : 'outline'}>
                    {assignment.status === 'published' ? t('assignments.published') : t('assignments.draft')}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isTeaching && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-bold">
            {t('courses.enrolled')} ({students.length})
          </h2>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-4">
              <form className="flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={handleEnroll}>
                <Field className="flex-1">
                  <FieldLabel htmlFor="enroll-student">{t('courses.enrollStudent')}</FieldLabel>
                  <StudentSelect
                    id="enroll-student"
                    value={enrollId}
                    onChange={setEnrollId}
                    students={roster}
                    status={rosterStatus}
                  />
                </Field>
                <Button type="submit" disabled={!enrollId || busy}>
                  <UserPlus /> {t('courses.enroll')}
                </Button>
              </form>

              {students.length === 0 ? (
                <EmptyState>{t('courses.noStudents')}</EmptyState>
              ) : (
                <ul className="divide-border divide-y">
                  {students.map((student) => (
                    <li key={student.id} className="flex items-center gap-3 py-2">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{student.name}</span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {student.email}
                        </span>
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUnenroll(student.id)}
                        disabled={busy}
                      >
                        {t('courses.remove')}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Named counts, not a generic "are you sure": the whole point of the
          server's confirm gate is that the teacher sees WHAT is destroyed. */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={t('courses.deleteTitle')}
        description={
          pendingDelete
            ? `${pendingDelete.submission_count} submission(s) from ${pendingDelete.student_count} student(s) across ${pendingDelete.assignment_count} assignment(s) will be permanently deleted. All ${pendingDelete.enrolled_count} enrolled student(s) will be notified.`
            : ''
        }
        confirmLabel={t('courses.delete')}
        pending={busy}
        onConfirm={() => handleDelete({ confirm: true })}
      />
    </PageContainer>
  )
}
