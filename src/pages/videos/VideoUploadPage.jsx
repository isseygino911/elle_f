import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { requestVideoUploadUrl, uploadFileToS3, confirmVideoUpload } from '../../api/client.js'
import { MAX_FILE_SIZE_BYTES, ALLOWED_CONTENT_TYPES } from '../../constants/video.js'
import { useStudents } from '../../hooks/useStudents.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageContainer, PageHeader, BackLink, ErrorAlert } from '@/components/Page'
import StudentSelect from '@/components/StudentSelect'

// Reads video duration client-side via an off-DOM <video> element. Resolves
// null (not rejects) if the duration can't be determined, since duration_sec
// is optional on the confirm call.
function readVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const objectUrl = URL.createObjectURL(file)

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl)
    }

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : null
      cleanup()
      resolve(duration)
    }
    video.onerror = () => {
      cleanup()
      resolve(null)
    }

    video.src = objectUrl
  })
}

export default function VideoUploadPage() {
  const { accessToken, user } = useAuth()
  const isStudent = Boolean(user && user.role === 'student')
  const { students, status: studentsStatus, error: studentsError } = useStudents(accessToken, { enabled: !isStudent })

  const [type, setType] = useState(isStudent ? 'practice' : 'class')
  const [studentId, setStudentId] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploaded, setUploaded] = useState(null)

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

    setSubmitting(true)
    try {
      // For students, omit student_id entirely rather than sending null: the
      // server treats an explicit null as "student tried to set someone
      // else's id" and rejects it, whereas omitting it lets the server
      // resolve the student's own id.
      const resolvedStudentId = studentId.trim() ? Number(studentId.trim()) : null

      const durationSec = await readVideoDuration(file)

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
      form.reset()
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title="Upload Video" />
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="file">Video file (MP4, WebM, or QuickTime, max 2 GiB)</FieldLabel>
                <Input
                  id="file"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(event) => setFile(event.target.files[0] || null)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
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
      <BackLink to="/videos">View all videos</BackLink>
    </PageContainer>
  )
}
