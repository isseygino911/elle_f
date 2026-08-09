import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CalendarClock, ExternalLink, Send, Undo2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { canManageCourses, canSubmitWork } from '../../lib/roles.js'
import {
  getAssignment,
  listSubmissions,
  updateAssignment,
  updateSubmission,
  reviewSubmission,
} from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  PageContainer,
  PageHeader,
  BackLink,
  ErrorAlert,
  LoadingText,
  EmptyState,
} from '@/components/Page'
import SubmissionForm from '@/components/courses/SubmissionForm'
import SubmissionCard from '@/components/courses/SubmissionCard'

// The teacher's feedback box for one submission.
function ReviewBox({ submission, onReviewed }) {
  const { accessToken } = useAuth()
  const { t } = useLanguage()
  const [feedback, setFeedback] = useState(submission.feedback ?? '')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleReview() {
    setError(null)
    setBusy(true)
    try {
      const updated = await reviewSubmission(accessToken, submission.id, feedback.trim())
      onReviewed(updated.submission)
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <ErrorAlert>{error}</ErrorAlert>}
      <Field>
        <FieldLabel htmlFor={`feedback-${submission.id}`}>
          {t('submissions.feedbackLabel')}
        </FieldLabel>
        <Textarea
          id={`feedback-${submission.id}`}
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          rows={3}
          disabled={busy}
        />
      </Field>
      <div>
        <Button size="sm" onClick={handleReview} disabled={busy || !feedback.trim()}>
          {/* Re-reviewing is allowed and does not re-notify -- the server makes
              the notification fire only on the first review, so a teacher
              fixing a typo doesn't tell the student twice. */}
          {submission.status === 'reviewed'
            ? t('submissions.updateFeedback')
            : t('submissions.markReviewed')}
        </Button>
      </div>
    </div>
  )
}

// The student's editor for work not yet reviewed. Once the teacher reviews it,
// the server answers 409 and this is replaced by a read-only card -- the lock
// is enforced there, not here.
function EditBox({ submission, onUpdated }) {
  const { accessToken } = useAuth()
  const { t } = useLanguage()
  const [body, setBody] = useState(submission.body ?? '')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSave() {
    setError(null)
    setBusy(true)
    try {
      const updated = await updateSubmission(accessToken, submission.id, body.trim() || null)
      onUpdated(updated.submission)
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <ErrorAlert>{error}</ErrorAlert>}
      <Field>
        <FieldLabel htmlFor={`edit-${submission.id}`}>{t('submissions.editLabel')}</FieldLabel>
        <Textarea
          id={`edit-${submission.id}`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          disabled={busy}
        />
      </Field>
      <div>
        <Button size="sm" variant="outline" onClick={handleSave} disabled={busy}>
          {t('submissions.saveEdit')}
        </Button>
      </div>
    </div>
  )
}

// THE SCREEN THE CANVAS TEARDOWN WAS FOR.
//
// Instruction, reference link and due date on top; the student's own submission
// INLINE below -- no "Start Assignment" gate, no tab that discards the other
// draft when switched. For a teacher the lower half is the review roster
// instead.
export default function AssignmentDetailPage() {
  const { courseId, id } = useParams()
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const isTeaching = canManageCourses(user)
  const isStudent = canSubmitWork(user)

  const [status, setStatus] = useState('loading')
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const [assignmentBody, submissionBody] = await Promise.all([
        getAssignment(accessToken, courseId, id),
        // A draft has no submissions and the student list is empty for a
        // student who has not submitted -- either way this is the same call.
        listSubmissions(accessToken, id).catch(() => ({ submissions: [] })),
      ])
      setAssignment(assignmentBody.assignment)
      setSubmissions(submissionBody.submissions)
      setStatus('success')
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
      setStatus('error')
    }
  }, [accessToken, courseId, id])

  useEffect(() => {
    load()
  }, [load])

  function replaceSubmission(updated) {
    setSubmissions((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
  }

  async function handlePublishToggle() {
    setActionError(null)
    setBusy(true)
    try {
      const updated = await updateAssignment(accessToken, courseId, id, {
        status: assignment.status === 'published' ? 'draft' : 'published',
      })
      setAssignment(updated.assignment)
    } catch (err) {
      setActionError((err.body && err.body.message) || err.message)
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') {
    return (
      <PageContainer>
        <LoadingText>{t('assignments.loading')}</LoadingText>
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

  const published = assignment.status === 'published'
  // A student's own attempts, newest first -- the latest is what they are
  // working on, and the earlier ones are the record of how it got there.
  const ownSubmissions = [...submissions].sort((a, b) => b.attempt - a.attempt)
  const latest = ownSubmissions[0]
  const canStillSubmit =
    assignment.allowed_attempts === null || ownSubmissions.length < assignment.allowed_attempts

  return (
    <PageContainer>
      <BackLink to={`/courses/${courseId}`}>{t('courses.backToCourse')}</BackLink>
      <PageHeader
        title={assignment.title}
        meta={assignment.course_title ?? undefined}
      />

      <div className="flex flex-wrap items-center gap-2">
        {isTeaching && (
          <Badge variant={published ? 'priorityLow' : 'outline'}>
            {published ? t('assignments.published') : t('assignments.draft')}
          </Badge>
        )}
        {assignment.due_date && (
          <span className="text-muted-foreground flex items-center gap-1 text-sm">
            <CalendarClock className="size-3.5" aria-hidden="true" />
            {t('assignments.due')} {assignment.due_date}
          </span>
        )}
        {assignment.allowed_attempts !== null && (
          <span className="text-muted-foreground text-sm">
            {t('assignments.attemptsAllowed')} {assignment.allowed_attempts}
          </span>
        )}
      </div>

      {actionError && <ErrorAlert>{actionError}</ErrorAlert>}

      {/* The instruction, the link and the due date -- everything the student
          needs to read before answering. */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-4">
          {assignment.body ? (
            <p className="text-sm whitespace-pre-wrap">{assignment.body}</p>
          ) : (
            <EmptyState>{t('assignments.noInstruction')}</EmptyState>
          )}

          {/* A dedicated field, not a link buried in prose -- the thing Canvas
              has no column for. */}
          {assignment.reference_url && (
            <a
              href={assignment.reference_url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              {t('assignments.reference')}
            </a>
          )}
        </CardContent>
      </Card>

      {isTeaching && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handlePublishToggle} disabled={busy}>
            {published ? (
              <>
                <Undo2 /> {t('assignments.retract')}
              </>
            ) : (
              <>
                <Send /> {t('assignments.publish')}
              </>
            )}
          </Button>
        </div>
      )}

      {/* THE LOWER HALF. For a student, their own work inline; for a teacher,
          the roster of what came in. */}
      {isStudent && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-bold">{t('submissions.yourWork')}</h2>

          {ownSubmissions.length === 0 && !canStillSubmit && (
            <Alert>
              <AlertDescription>{t('submissions.noAttemptsLeft')}</AlertDescription>
            </Alert>
          )}

          {/* Feedback shown ABOVE the form, so a student revising their work can
              see what they are responding to while they type. */}
          {ownSubmissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              actions={
                submission.id === latest?.id && submission.status !== 'reviewed' ? (
                  <EditBox submission={submission} onUpdated={replaceSubmission} />
                ) : null
              }
            />
          ))}

          {canStillSubmit ? (
            <Card>
              <CardContent className="pt-4">
                <SubmissionForm
                  assignment={assignment}
                  onSubmitted={(created) => setSubmissions((current) => [...current, created])}
                />
              </CardContent>
            </Card>
          ) : (
            ownSubmissions.length > 0 && (
              <Alert>
                <AlertDescription>{t('submissions.attemptLimitReached')}</AlertDescription>
              </Alert>
            )
          )}
        </section>
      )}

      {isTeaching && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-bold">
            {t('submissions.reviewQueue')} ({submissions.length})
          </h2>

          {submissions.length === 0 ? (
            <EmptyState>
              {published ? t('submissions.noneYet') : t('submissions.draftNoSubmissions')}
            </EmptyState>
          ) : (
            <div className="flex flex-col gap-3">
              {submissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  showStudent
                  actions={<ReviewBox submission={submission} onReviewed={replaceSubmission} />}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </PageContainer>
  )
}
