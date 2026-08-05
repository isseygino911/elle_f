import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { isOwner } from '../../lib/roles.js'
import { listAdmins, reassignStudent } from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Sentinel for "no teacher". Base UI's Select has no concept of a null value,
// and an empty string would make the control flip between uncontrolled and
// controlled once a real id arrives — the same trick StudentSelect uses.
const UNASSIGNED = '__unassigned__'

// Owner-only control for assigning a student to a teacher.
//
// This is the missing half of a flow the schema has always described: an
// owner-invited student starts with admin_id NULL (auth.route.js — "the owner
// chooses"), and deleting a teacher SET NULLs their students rather than
// cascade-deleting them (migration 0017 — "an owner reassigns them"). Until
// this existed, both states were reachable and permanent: an unassigned
// student is on no roster, so no admin can see or teach them.
//
// Renders nothing for an admin. Reassignment is an ownership decision — a
// teacher who could do it could pull a peer's student onto their own roster or
// dump one off it. The server enforces the same rule (requireRole(OWNER)); this
// only decides what to draw.
export default function AssignTeacherCard({ student, onAssigned }) {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()

  const [admins, setAdmins] = useState([])
  // idle | loading | error — tracks the admin list, not the save.
  const [status, setStatus] = useState('loading')
  const [selected, setSelected] = useState(UNASSIGNED)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const canAssign = isOwner(user)

  useEffect(() => {
    // The picker is owner-only, so an admin never issues this request — it
    // would 403, and the resulting error banner would be noise on a page that
    // is otherwise working fine for them.
    if (!canAssign) return undefined

    let cancelled = false
    setStatus('loading')

    listAdmins(accessToken)
      .then((body) => {
        if (cancelled) return
        setAdmins(body.admins || [])
        setStatus('idle')
      })
      .catch((err) => {
        if (cancelled) return
        setError((err.body && err.body.message) || err.message)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, canAssign])

  // Re-sync when the route moves to a different student. Keyed on the id as
  // well as admin_id so navigating between two students who share a teacher
  // still resets the dirty/saved state.
  useEffect(() => {
    setSelected(student && student.admin_id ? String(student.admin_id) : UNASSIGNED)
    setSaved(false)
  }, [student && student.id, student && student.admin_id])

  if (!canAssign || !student) return null

  const currentValue = student.admin_id ? String(student.admin_id) : UNASSIGNED
  const isDirty = selected !== currentValue

  function renderLabel(value) {
    if (value === UNASSIGNED || !value) return t('students.unassigned')
    const admin = admins.find((candidate) => String(candidate.id) === value)
    return admin ? admin.name : t('students.unassigned')
  }

  async function handleSave() {
    setError(null)
    setSaved(false)
    setSaving(true)

    try {
      const body = await reassignStudent(
        accessToken,
        student.id,
        selected === UNASSIGNED ? null : selected
      )
      setSaved(true)
      // Hand the updated student back up so the page's own copy stays in step
      // — otherwise `currentValue` keeps reporting the pre-save teacher and the
      // control still looks dirty after a successful write.
      if (onAssigned) onAssigned(body.student)
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setSaving(false)
    }
  }

  // A plain Card rather than the color-blocked InsightCard used elsewhere in
  // this rail: those are read-only metric panels, and their solid lime/violet
  // ground fights the form controls this one contains.
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('students.assignTeacher')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
      {status === 'error' && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status !== 'error' && (
        <Field>
          <FieldLabel htmlFor="assign-teacher" className="sr-only">
            {t('students.assignTeacher')}
          </FieldLabel>
          <Select
            value={selected}
            onValueChange={(next) => {
              setSelected(next)
              setSaved(false)
            }}
            disabled={status === 'loading' || saving}
          >
            <SelectTrigger id="assign-teacher" className="w-full">
              <SelectValue>{renderLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>{t('students.unassigned')}</SelectItem>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={String(admin.id)}>
                  {admin.name} ({admin.student_count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* An unassigned student is on nobody's roster, which is easy to
              create by accident and invisible everywhere else in the UI. */}
          {currentValue === UNASSIGNED && !isDirty && (
            <FieldDescription>{t('students.unassignedHint')}</FieldDescription>
          )}

          {error && status !== 'error' && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isDirty && (
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? t('students.assigning') : t('students.assign')}
            </Button>
          )}

          {saved && !isDirty && <FieldDescription>{t('students.assigned')}</FieldDescription>}
        </Field>
      )}
      </CardContent>
    </Card>
  )
}
