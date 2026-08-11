import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ErrorAlert } from '@/components/Page'
import { useLanguage } from '@/lib/LanguageContext'
import StudentSelect from '@/components/StudentSelect'

// The add-task form used to sit permanently expanded inside the Tasks card,
// where it pushed that card's height well past its neighbours and made the
// column balance impossible. It is the same form; it just waits behind a
// button now.
//
// A dialog rather than its own route: there is no /tasks page and no
// listTasks in the API client, so the dashboard is the only surface where a
// task exists. Building that page to host one form would be scope nobody
// asked for.
export default function CreateTaskDialog({ onCreateTask, students, studentsStatus, studentsError }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim()) return

    try {
      await onCreateTask({
        title: title.trim(),
        assigned_to: assignedTo.trim() ? assignedTo.trim() : null,
        due_date: dueDate || null,
      })
      setTitle('')
      setAssignedTo('')
      setDueDate('')
      setError(null)
      setOpen(false)
    } catch (err) {
      // Keep the dialog open so the entered values survive and can be retried.
      setError((err.body && err.body.message) || err.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Plus className="size-4" aria-hidden="true" />
            {t('dashboard.addTask')}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dashboard.addTask')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {error && <ErrorAlert>{error}</ErrorAlert>}
            <Field>
              <FieldLabel htmlFor="task-title">{t('dashboard.taskTitle')}</FieldLabel>
              <Input
                id="task-title"
                type="text"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="task-assigned-to">{t('dashboard.assignTo')}</FieldLabel>
              <StudentSelect
                id="task-assigned-to"
                value={assignedTo}
                onChange={setAssignedTo}
                students={students}
                status={studentsStatus}
                emptyLabel={t('dashboard.noStudentOption')}
              />
              {studentsStatus === 'error' && <FieldDescription>{studentsError}</FieldDescription>}
            </Field>
            <Field>
              <FieldLabel htmlFor="task-due-date">{t('dashboard.dueDate')}</FieldLabel>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('dashboard.cancel')}
              </Button>
              <Button type="submit">{t('dashboard.addTask')}</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
