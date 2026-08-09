import { useCallback, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { requestVideoUploadUrl, uploadFileToS3, confirmVideoUpload } from '../../api/client.js'
import { MAX_FILE_SIZE_BYTES, ALLOWED_CONTENT_TYPES } from '../../constants/video.js'
import { readVideoDuration } from '../../utils/readVideoDuration.js'
import { useStudents } from '../../hooks/useStudents.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageContainer, PageHeader, BackLink, ErrorAlert } from '@/components/Page'
import StudentSelect from '@/components/StudentSelect'
import VideoRecorder from '@/components/videos/VideoRecorder'
import { Separator } from '@/components/ui/separator'

export default function VideoUploadPage() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const isStudent = Boolean(user && user.role === 'student')
  const { students, status: studentsStatus, error: studentsError } = useStudents(accessToken, { enabled: !isStudent })

  const [type, setType] = useState(isStudent ? 'practice' : 'class')
  const [studentId, setStudentId] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  // Set only for a camera recording. A MediaRecorder WebM carries no duration
  // in its header (readVideoDuration reports Infinity for it), so the recorder's
  // own elapsed-time count is the only reliable source and is kept alongside the
  // file rather than probed back out of it.
  const [recordedDurationSec, setRecordedDurationSec] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploaded, setUploaded] = useState(null)

  // A finished recording becomes the file to upload, so it travels the exact
  // same presigned-S3 path as a file picked from disk. Stable identity via
  // useCallback: VideoRecorder publishes through an effect keyed on this.
  const handleRecorded = useCallback((recordedFile, durationSec) => {
    setFile(recordedFile)
    setRecordedDurationSec(durationSec)
    setError(null)
  }, [])

  // Picking a file supersedes any recording, so `file` and recordedDurationSec
  // can never describe two different videos.
  function handleFileChange(event) {
    setFile(event.target.files[0] || null)
    setRecordedDurationSec(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.target
    setError(null)
    setUploaded(null)

    if (!file) {
      setError('Please choose a video file to upload.')
      return
    }
    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload an MP4, WebM, or QuickTime video.')
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('File is too large. Maximum size is 2 GiB.')
      return
    }
    if (!isStudent && type === 'practice' && !studentId.trim()) {
      setError('Student ID is required for practice videos.')
      return
    }
    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    setSubmitting(true)
    try {
      // For students, omit student_id entirely rather than sending null: the
      // server treats an explicit null as "student tried to set someone
      // else's id" and rejects it, whereas omitting it lets the server
      // resolve the student's own id.
      const resolvedStudentId = studentId.trim() ? Number(studentId.trim()) : null

      // Probe the file only when it came from disk; a recording already knows
      // its duration and probing it would yield Infinity.
      const durationSec = recordedDurationSec ?? (await readVideoDuration(file))

      const { upload } = await requestVideoUploadUrl(accessToken, {
        type,
        ...(isStudent ? {} : { student_id: resolvedStudentId }),
        original_filename: file.name,
        content_type: file.type,
        content_length: file.size,
      })

      await uploadFileToS3(upload.url, upload.fields, file)

      const { video } = await confirmVideoUpload(accessToken, {
        type,
        ...(isStudent ? {} : { student_id: resolvedStudentId }),
        title,
        s3_key: upload.s3_key,
        duration_sec: durationSec,
      })

      setUploaded(video)
      setTitle('')
      setStudentId('')
      setFile(null)
      setRecordedDurationSec(null)
      form.reset()
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title={t('uploadVideo.title')} />
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel>Record with your camera</FieldLabel>
                <VideoRecorder onRecorded={handleRecorded} disabled={submitting} />
                <FieldDescription>
                  Your browser will ask for camera and microphone permission when you start.
                </FieldDescription>
              </Field>
              <Separator />
              <Field>
                <FieldLabel htmlFor="file">Or choose a video file (MP4, WebM, or QuickTime, max 2 GiB)</FieldLabel>
                <Input
                  id="file"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileChange}
                />
                {recordedDurationSec !== null && file && (
                  <FieldDescription>
                    Using your recording ({file.name}). Choosing a file here replaces it.
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="title">Title (required)</FieldLabel>
                <Input id="title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
              </Field>
              {isStudent ? (
                <FieldDescription>Type: practice (uploaded as yourself)</FieldDescription>
              ) : (
                <>
                  <Field>
                    <FieldLabel htmlFor="type">Type</FieldLabel>
                    <Select
                      value={type}
                      onValueChange={setType}
                      items={[
                        { value: 'class', label: 'Class' },
                        { value: 'practice', label: 'Practice' },
                      ]}
                    >
                      <SelectTrigger id="type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class">Class</SelectItem>
                        <SelectItem value="practice">Practice</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="student_id">
                      Student ID {type === 'practice' ? '(required)' : '(optional)'}
                    </FieldLabel>
                    <StudentSelect
                      id="student_id"
                      value={studentId}
                      onChange={setStudentId}
                      students={students}
                      status={studentsStatus}
                      emptyLabel={type === 'practice' ? '— Select a student —' : '— No student —'}
                    />
                    <FieldDescription>
                      {studentsStatus === 'error' ? studentsError : 'Select the student, if known.'}
                    </FieldDescription>
                  </Field>
                </>
              )}
              {error && <ErrorAlert>{error}</ErrorAlert>}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Uploading...' : 'Upload'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      {uploaded && (
        <section className="flex flex-col gap-3">
          <h2>Uploaded: {uploaded.title}</h2>
          <Alert variant="success" role="status">
            <AlertDescription>
              {uploaded.type} — {uploaded.status} — {uploaded.created_at}
            </AlertDescription>
          </Alert>
        </section>
      )}
      <BackLink to="/videos">{t('uploadVideo.viewAll')}</BackLink>
    </PageContainer>
  )
}
