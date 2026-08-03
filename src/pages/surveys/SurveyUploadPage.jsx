import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { uploadSurvey } from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageContainer, PageHeader, BackLink, ErrorAlert } from '@/components/Page'

export default function SurveyUploadPage() {
  const { accessToken } = useAuth()
  const { t } = useLanguage()

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
      setError('Please choose an XML file to upload.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)

    setSubmitting(true)
    try {
      const { survey, questions } = await uploadSurvey(accessToken, formData)
      setUploaded({ ...survey, questions })
      setTitle('')
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
      <PageHeader title={t('uploadSurvey.title')} />
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="file">Survey XML file (max 5MB)</FieldLabel>
                <Input
                  id="file"
                  type="file"
                  accept=".xml"
                  onChange={(event) => setFile(event.target.files[0] || null)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input id="title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
              </Field>
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
              {uploaded.original_filename} — {uploaded.uploaded_at}
            </AlertDescription>
          </Alert>
          <ol className="flex flex-col gap-1">
            {uploaded.questions.map((question) => (
              <li key={question.id} className="flex flex-col gap-2 border-b border-border py-2 last:border-b-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span>{question.question_text}</span>
                  <Badge variant="outline">max {question.points} pts</Badge>
                </div>
                {question.answers && question.answers.length > 0 && (
                  <ul className="flex flex-col">
                    {question.answers.map((answer) => (
                      <li key={answer.id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
                        <span>{answer.answer_text}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          {answer.category && <Badge variant="accent">{answer.category}</Badge>}
                          <Badge variant="outline">rated 1-{answer.points}</Badge>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
      <BackLink to="/surveys">{t('uploadSurvey.viewAll')}</BackLink>
    </PageContainer>
  )
}
