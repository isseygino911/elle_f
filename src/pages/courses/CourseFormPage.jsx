import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { isOwner } from '../../lib/roles.js'
import { createCourse, listAdmins } from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageContainer, PageHeader, BackLink, ErrorAlert } from '@/components/Page'

// Creating a course. Short by design -- a course is a title, an optional
// description, and (for an owner) which teacher owns it. Everything else about
// it is expressed by the assignments inside it.
export default function CourseFormPage() {
  const navigate = useNavigate()
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()

  // Only an owner picks the teacher: a teacher's course is always their own,
  // and the server ignores any admin_id they send. Drawing the control for them
  // would offer a choice that cannot take effect.
  //
  // For an owner it is REQUIRED, not merely offered -- they own no roster, so
  // there is no sensible default for the server to guess and it answers 400
  // without one.
  const owner = isOwner(user)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [adminId, setAdminId] = useState('')
  const [teachers, setTeachers] = useState([])
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!owner) return undefined
    let cancelled = false

    listAdmins(accessToken)
      .then((body) => {
        if (!cancelled) setTeachers(body.admins ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError((err.body && err.body.message) || err.message)
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, owner])

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError(t('courses.titleRequired'))
      return
    }

    // Mirrors the server's 400 rather than letting the request fail: an owner
    // owns no roster, so there is no teacher for the server to default to.
    if (owner && !adminId) {
      setError(t('courses.teacherRequired'))
      return
    }

    setSubmitting(true)
    try {
      const body = { title: title.trim() }
      if (description.trim()) body.description = description.trim()
      if (owner && adminId) body.admin_id = Number(adminId)

      const created = await createCourse(accessToken, body)
      navigate(`/courses/${created.course.id}`)
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <BackLink to="/courses">{t('courses.title')}</BackLink>
      <PageHeader title={t('courses.new')} />

      {error && <ErrorAlert>{error}</ErrorAlert>}

      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="course-title">{t('courses.titleLabel')}</FieldLabel>
                <Input
                  id="course-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={255}
                  required
                />
              </Field>

              {owner && (
                <Field>
                  <FieldLabel htmlFor="course-teacher">{t('courses.teacherLabel')}</FieldLabel>
                  <Select value={adminId} onValueChange={setAdminId}>
                    <SelectTrigger id="course-teacher" className="w-full">
                      <SelectValue>
                        {(value) =>
                          teachers.find((teacher) => String(teacher.id) === value)?.name ??
                          t('courses.teacherPlaceholder')
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={String(teacher.id)}>
                          {teacher.name} ({teacher.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>{t('courses.teacherHelp')}</FieldDescription>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="course-description">{t('courses.descriptionLabel')}</FieldLabel>
                <Textarea
                  id="course-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                />
                <FieldDescription>{t('courses.descriptionHelp')}</FieldDescription>
              </Field>

              <Button type="submit" disabled={submitting}>
                {submitting ? t('courses.creating') : t('courses.create')}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
