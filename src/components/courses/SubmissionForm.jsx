import { useCallback, useState } from 'react'
import { Paperclip, Send, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { requestSubmissionUploadUrl, uploadFileToS3, createSubmission } from '../../api/client.js'
import {
  ALLOWED_CONTENT_TYPES,
  MAX_FILE_SIZE_BYTES,
  RECORDING_CONTENT_TYPE,
} from '../../constants/submissions.js'
import { isRecordingSupported } from '../../hooks/useMediaRecorder.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ErrorAlert } from '@/components/Page'
import VideoRecorder from '@/components/videos/VideoRecorder'

// One accepted part of a submission, drawn as its own bordered block.
//
// The framing exists to make the multi-part model legible. 0032's header is
// emphatic that accepts_text/accepts_files/accepts_recording declare PARTS OF
// ONE SUBMISSION -- all three may be true at once and are sent together -- and
// that the UI must never render them as tabs. Stacked bare fields understated
// that: three unlabelled controls in a column read as one long form, so a
// student could reasonably submit prose and miss that a recording was also
// expected. A titled block per part says "these are the pieces of your answer".
//
// Only framed when there is more than one part. A border around a lone textarea
// is a box drawn around nothing.
//
// The part's existing FieldLabel serves as its heading -- no separate title is
// passed in, because a heading above a label saying the same words twice is
// worse than either alone.
function SubmissionPart({ framed, children }) {
  if (!framed) return children

  return <div className="border-border rounded-md border p-4">{children}</div>
}

// THE ONE FORM. Text, files and a camera take, submitted TOGETHER in a single
// act -- the thing Canvas structurally cannot express, and the reason this
// feature was built.
//
// There is no "Start Assignment" gate: the parent renders this inline under the
// instruction, so the student reads the homework and answers it in one place.
//
// Only the parts the assignment accepts are rendered. That is not merely a
// convenience -- the server rejects a part it does not accept with a distinct
// 400, so drawing a control for it would be drawing a control that can only
// fail.
export default function SubmissionForm({ assignment, onSubmitted }) {
  const { accessToken } = useAuth()
  const { t } = useLanguage()

  const [body, setBody] = useState('')
  const [files, setFiles] = useState([])
  const [recording, setRecording] = useState(null) // { file, durationSec }
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(null)

  // How many parts this assignment asks for. Drives the framing: one part
  // needs no border to tell it apart from anything.
  const multipart =
    [assignment.accepts_text, assignment.accepts_files, assignment.accepts_recording].filter(
      Boolean,
    ).length > 1

  const recordingSupported = isRecordingSupported()
  // Recording is the only way in and this browser cannot do it. Said plainly,
  // because the alternative is a student staring at a dead control.
  const lockedOut =
    assignment.accepts_recording &&
    !assignment.accepts_text &&
    !assignment.accepts_files &&
    !recordingSupported

  // Stable identity: VideoRecorder publishes through an effect keyed on this,
  // so an unstable one re-fires the callback on every render while a take sits
  // in 'stopped'.
  const handleRecorded = useCallback((file, durationSec) => {
    setRecording({ file, durationSec })
    setError(null)
  }, [])

  function handleFileChange(event) {
    setFiles(Array.from(event.target.files || []))
    setError(null)
  }

  function removeFile(index) {
    setFiles((current) => current.filter((_, position) => position !== index))
  }

  // Uploads one file to S3 and returns the entry the submit call expects.
  // `kind` decides which server-side rules apply -- a recording is re-checked
  // for video/webm and against the assignment's max_recording_sec.
  async function uploadOne(file, kind, durationSec) {
    const { upload } = await requestSubmissionUploadUrl(accessToken, assignment.id, {
      original_filename: file.name,
      content_type: file.type,
      content_length: file.size,
    })

    await uploadFileToS3(upload.url, upload.fields, file)

    return {
      kind,
      original_filename: file.name,
      s3_key: upload.s3_key,
      // Only ever set for a recording, and only from the recorder's own
      // wall-clock count. A MediaRecorder WebM carries no duration in its
      // header, so probing the file back would lose it -- and null is a
      // legitimate value the server accepts for a sub-second take.
      ...(kind === 'recording' ? { duration_sec: durationSec ?? null } : {}),
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    const hasText = Boolean(body.trim())
    if (!hasText && files.length === 0 && !recording) {
      setError(t('submissions.empty'))
      return
    }

    const oversized = files.find((file) => file.size > MAX_FILE_SIZE_BYTES)
    if (oversized) {
      setError(t('submissions.tooLarge'))
      return
    }

    const unsupported = files.find((file) => !ALLOWED_CONTENT_TYPES.includes(file.type))
    if (unsupported) {
      setError(t('submissions.unsupportedType'))
      return
    }

    setSubmitting(true)
    try {
      const uploaded = []

      // Uploaded one at a time so the progress line means something. These are
      // student recordings on a home connection, not a fast fan-out.
      for (const [index, file] of files.entries()) {
        setProgress(
          `${t('submissions.uploading')} ${index + 1}/${files.length + (recording ? 1 : 0)}`,
        )
        // eslint-disable-next-line no-await-in-loop
        uploaded.push(await uploadOne(file, 'attachment'))
      }

      if (recording) {
        setProgress(t('submissions.uploadingRecording'))
        uploaded.push(await uploadOne(recording.file, 'recording', recording.durationSec))
      }

      setProgress(t('submissions.submitting'))
      const created = await createSubmission(accessToken, assignment.id, {
        ...(hasText ? { body: body.trim() } : {}),
        ...(uploaded.length ? { files: uploaded } : {}),
      })

      setBody('')
      setFiles([])
      setRecording(null)
      onSubmitted(created.submission)
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
      setProgress(null)
    }
  }

  if (lockedOut) {
    return (
      <Alert>
        <AlertDescription>{t('submissions.recordingUnsupported')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {error && <ErrorAlert>{error}</ErrorAlert>}

        {assignment.accepts_text && (
          <SubmissionPart framed={multipart}>
            <Field>
              <FieldLabel htmlFor="submission-body">{t('submissions.bodyLabel')}</FieldLabel>
              <Textarea
                id="submission-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={6}
                disabled={submitting}
              />
            </Field>
          </SubmissionPart>
        )}

        {assignment.accepts_files && (
          <SubmissionPart framed={multipart}>
            <Field>
              <FieldLabel htmlFor="submission-files">{t('submissions.filesLabel')}</FieldLabel>
              <Input
                id="submission-files"
                type="file"
                multiple
                accept={ALLOWED_CONTENT_TYPES.join(',')}
                onChange={handleFileChange}
                disabled={submitting}
              />
              <FieldDescription>{t('submissions.filesHelp')}</FieldDescription>
              {files.length > 0 && (
                <ul className="flex flex-col gap-1 pt-1">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${index}`} className="flex items-center gap-2 text-sm">
                      <Paperclip className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{file.name}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                        disabled={submitting}
                      >
                        <X />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Field>
          </SubmissionPart>
        )}

        {assignment.accepts_recording && (
          <SubmissionPart framed={multipart}>
            <Field>
              <FieldLabel>{t('submissions.recordingLabel')}</FieldLabel>
              <FieldDescription>{t('submissions.recordingHelp')}</FieldDescription>
              {recordingSupported ? (
                <VideoRecorder
                  onRecorded={handleRecorded}
                  disabled={submitting}
                  maxSeconds={assignment.max_recording_sec}
                  doneCaption={t('submissions.recordingDone')}
                />
              ) : (
                // Not a dead control: the other parts still work, so this states
                // what happened and leaves them to it.
                <Alert>
                  <AlertDescription>
                    {t('submissions.recordingUnsupportedPartial')}
                  </AlertDescription>
                </Alert>
              )}
              {recording && (
                <p className="text-muted-foreground text-sm">
                  {t('submissions.recordingAttached')} (
                  {recording.file.type || RECORDING_CONTENT_TYPE})
                </p>
              )}
            </Field>
          </SubmissionPart>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            <Send /> {submitting ? t('submissions.submitting') : t('submissions.submit')}
          </Button>
          {progress && <span className="text-muted-foreground text-sm">{progress}</span>}
        </div>
      </FieldGroup>
    </form>
  )
}
