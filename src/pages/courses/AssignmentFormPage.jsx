import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { createAssignment } from '../../api/client.js'
import { MAX_RECORDING_SEC_DEFAULT } from '../../constants/submissions.js'
import { isRecordingSupported } from '../../hooks/useMediaRecorder.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageContainer, PageHeader, BackLink, ErrorAlert } from '@/components/Page'

// One accepted-part toggle. Native checkbox, matching the convention in
// OrganizationSettingsPage -- this app has no checkbox primitive.
function PartToggle({ id, label, description, checked, onChange }) {
  return (
    <div className="flex items-start gap-2">
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-4 shrink-0 accent-lime"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div className="min-w-0">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </div>
    </div>
  )
}

// Creating an assignment. Always creates a DRAFT -- publishing is a separate,
// deliberate act on the detail page, because it notifies every enrolled student
// and an accidental double-submit here would otherwise be indistinguishable
// from a real second assignment.
//
// THE THREE TOGGLES ARE NOT CANVAS'S. Canvas's submission-type checkboxes make
// the types mutually exclusive alternatives -- the student picks one tab and
// switching discards the other draft. These declare which parts may appear
// TOGETHER in one submission: tick all three and a student hands in text and
// files and a recording in a single act. Same-looking control, opposite
// meaning; do not let the resemblance pull this toward Canvas's model.
export default function AssignmentFormPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const { t } = useLanguage()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [allowedAttempts, setAllowedAttempts] = useState('')
  const [acceptsText, setAcceptsText] = useState(true)
  const [acceptsFiles, setAcceptsFiles] = useState(true)
  const [acceptsRecording, setAcceptsRecording] = useState(false)
  const [maxRecordingSec, setMaxRecordingSec] = useState(String(MAX_RECORDING_SEC_DEFAULT))
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const acceptsNothing = !acceptsText && !acceptsFiles && !acceptsRecording
  // A student on Safari cannot record: the recorder is WebM-only by design.
  // If recording is the ONLY accepted part they are locked out entirely, so the
  // teacher is told while they can still change it.
  const recordingOnly = acceptsRecording && !acceptsText && !acceptsFiles

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError(t('assignments.titleRequired'))
      return
    }

    // Mirrors the server's 400. The rule lives on the server too -- this is the
    // fast, local copy, not the boundary.
    if (acceptsNothing) {
      setError(t('assignments.acceptsNothing'))
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        accepts_text: acceptsText,
        accepts_files: acceptsFiles,
        accepts_recording: acceptsRecording,
      }
      if (body.trim()) payload.body = body.trim()
      if (referenceUrl.trim()) payload.reference_url = referenceUrl.trim()
      if (dueDate) payload.due_date = dueDate
      if (allowedAttempts) payload.allowed_attempts = Number(allowedAttempts)
      if (acceptsRecording) payload.max_recording_sec = Number(maxRecordingSec)

      const created = await createAssignment(accessToken, courseId, payload)
      navigate(`/courses/${courseId}/assignments/${created.assignment.id}`)
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <BackLink to={`/courses/${courseId}`}>{t('courses.backToCourse')}</BackLink>
      <PageHeader title={t('assignments.new')} meta={t('assignments.createsDraft')} />

      {error && <ErrorAlert>{error}</ErrorAlert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="assignment-title">{t('assignments.titleLabel')}</FieldLabel>
                <Input
                  id="assignment-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={255}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="assignment-body">{t('assignments.bodyLabel')}</FieldLabel>
                <Textarea
                  id="assignment-body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  rows={5}
                />
                <FieldDescription>{t('assignments.bodyHelp')}</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="assignment-reference">
                  {t('assignments.referenceLabel')}
                </FieldLabel>
                <Input
                  id="assignment-reference"
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  value={referenceUrl}
                  onChange={(event) => setReferenceUrl(event.target.value)}
                />
                <FieldDescription>{t('assignments.referenceHelp')}</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="assignment-due">{t('assignments.dueLabel')}</FieldLabel>
                <Input
                  id="assignment-due"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="assignment-attempts">
                  {t('assignments.attemptsLabel')}
                </FieldLabel>
                <Input
                  id="assignment-attempts"
                  type="number"
                  min="1"
                  value={allowedAttempts}
                  onChange={(event) => setAllowedAttempts(event.target.value)}
                />
                <FieldDescription>{t('assignments.attemptsHelp')}</FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('assignments.acceptsLabel')}</FieldLabel>
                <FieldDescription>{t('assignments.acceptsHelp')}</FieldDescription>
                <div className="flex flex-col gap-3 pt-1">
                  <PartToggle
                    id="accepts-text"
                    label={t('assignments.acceptsText')}
                    description={t('assignments.acceptsTextHelp')}
                    checked={acceptsText}
                    onChange={setAcceptsText}
                  />
                  <PartToggle
                    id="accepts-files"
                    label={t('assignments.acceptsFiles')}
                    description={t('assignments.acceptsFilesHelp')}
                    checked={acceptsFiles}
                    onChange={setAcceptsFiles}
                  />
                  <PartToggle
                    id="accepts-recording"
                    label={t('assignments.acceptsRecording')}
                    description={t('assignments.acceptsRecordingHelp')}
                    checked={acceptsRecording}
                    onChange={setAcceptsRecording}
                  />
                </div>
              </Field>

              {acceptsNothing && <ErrorAlert>{t('assignments.acceptsNothing')}</ErrorAlert>}

              {/* Shown only when recording is on -- a length cap for a part the
                  assignment does not accept is a field with no meaning. */}
              {acceptsRecording && (
                <Field>
                  <FieldLabel htmlFor="assignment-recording-cap">
                    {t('assignments.recordingCapLabel')}
                  </FieldLabel>
                  <Input
                    id="assignment-recording-cap"
                    type="number"
                    min="10"
                    max="3600"
                    value={maxRecordingSec}
                    onChange={(event) => setMaxRecordingSec(event.target.value)}
                  />
                  <FieldDescription>{t('assignments.recordingCapHelp')}</FieldDescription>
                </Field>
              )}

              {/* Not hypothetical: this browser is the check. If the teacher is
                  themselves on Safari the recorder is unavailable here too. */}
              {recordingOnly && (
                <Alert>
                  <AlertDescription>
                    {t('assignments.recordingOnlyWarning')}
                    {!isRecordingSupported() && ` ${t('assignments.recordingUnsupportedHere')}`}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={submitting || acceptsNothing}>
                {submitting ? t('assignments.creating') : t('assignments.create')}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
