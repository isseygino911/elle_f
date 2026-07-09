import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { createInvitation } from '../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Card, CardContent } from '@/components/ui/card'
import { PageContainer, PageHeader, BackLink } from '@/components/Page'
import RecordCard from '@/components/records/RecordCard'

export default function InvitationsPage() {
  const { accessToken } = useAuth()

  const [studentNameHint, setStudentNameHint] = useState('')
  const [link, setLink] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setLink(null)
    setSubmitting(true)

    try {
      const body = await createInvitation(accessToken, { studentNameHint: studentNameHint.trim() })
      setLink(body.link)
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title="Create Invitation" />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="student_name_hint">Student name (optional)</FieldLabel>
                <Input
                  id="student_name_hint"
                  type="text"
                  value={studentNameHint}
                  onChange={(event) => setStudentNameHint(event.target.value)}
                />
              </Field>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Generating...' : 'Generate invitation link'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {link && (
        <ul className="flex flex-col gap-2">
          {/*
            No GET /invitations listing endpoint exists in this app (only
            create-invitation), so there is no table to convert into a
            multi-row card-list per MASTER.md — this renders the just-created
            invitation using the same record-card shape (avatar + name +
            status pill) used by the list panels elsewhere, consistent with
            the rest of the app's visual language.
          */}
          <li>
            <RecordCard
              variant="light"
              icon={UserPlus}
              title={studentNameHint.trim() || 'New invitation'}
              meta={link}
              pillLabel="Link generated"
              pillVariant="lime"
            />
          </li>
        </ul>
      )}
      {link && (
        <Field>
          <FieldLabel htmlFor="invitation-link">Invitation link (copy and send to the student)</FieldLabel>
          <Input id="invitation-link" type="text" readOnly value={link} onFocus={(event) => event.target.select()} />
        </Field>
      )}

      <BackLink to="/dashboard">Back to dashboard</BackLink>
    </PageContainer>
  )
}
