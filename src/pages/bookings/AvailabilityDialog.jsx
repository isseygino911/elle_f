import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ErrorAlert } from '@/components/Page'
import { formatSlotDate } from '../../utils/formatSlotTime.js'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// The create/edit modal for a single availability window or dated exception.
//
// Built on AlertDialog because it is the only modal primitive in this project
// (there is no plain Dialog) — the same reasoning, and the same width
// override, as FilePreviewDialog. Its default max-w-xs suits a confirmation
// prompt, not a form.
//
// The delete confirmation SWAPS this dialog's own content rather than opening
// a second dialog on top of it: stacking two AlertDialogs fights over the
// focus trap and reads as a bug. `mode` is that swap.
//
// SCOPE IS THE DANGEROUS FIELD. Editing from a dated cell, "every week" writes
// the recurring `availability` row and changes every future week; "this date
// only" writes an `availability_exceptions` row and changes exactly one day.
// Defaulting silently either way is the one interaction here that can destroy
// a teacher's schedule, so it is always an explicit choice — never inferred.
export default function AvailabilityDialog({
  open,
  editing,
  onOpenChange,
  onSave,
  onDelete,
  saving,
  deleting,
  error,
}) {
  if (!editing) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[min(28rem,92vw)] sm:max-w-[min(28rem,92vw)]">
        <AvailabilityDialogBody
          // Remounted whenever a different block or empty cell is clicked, so
          // the form's internal state resets instead of needing a sync effect.
          key={editing.key}
          editing={editing}
          onSave={onSave}
          onDelete={onDelete}
          onCancel={() => onOpenChange(false)}
          saving={saving}
          deleting={deleting}
          error={error}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}

function AvailabilityDialogBody({ editing, onSave, onDelete, onCancel, saving, deleting, error }) {
  const [mode, setMode] = useState('form') // form | confirm-delete
  const [dayOfWeekValue, setDayOfWeekValue] = useState(String(editing.day_of_week ?? 0))
  const [startTime, setStartTime] = useState(editing.start_time ?? '09:00')
  const [endTime, setEndTime] = useState(editing.end_time ?? '10:00')
  // 'recurring' edits the weekly rule; 'date' writes a dated exception.
  const [scope, setScope] = useState(editing.defaultScope ?? 'recurring')
  const [exceptionType, setExceptionType] = useState(editing.type ?? 'block')
  const [wholeDay, setWholeDay] = useState(editing.start_time == null && editing.kind === 'exception')

  const isExistingRecurring = editing.kind === 'recurring' && editing.id != null
  const isExistingException = editing.kind === 'exception' && editing.id != null
  const isExisting = isExistingRecurring || isExistingException
  // Scope is only a question when creating from a dated cell. Editing an
  // existing row already knows which table it lives in.
  const scopeIsChoosable = !isExisting && editing.date != null

  const effectiveScope = scopeIsChoosable ? scope : editing.kind === 'exception' ? 'date' : 'recurring'
  const isDateScoped = effectiveScope === 'date'
  const isWholeDayBlock = isDateScoped && exceptionType === 'block' && wholeDay

  function handleSubmit(event) {
    event.preventDefault()
    onSave({
      scope: effectiveScope,
      id: editing.id,
      kind: editing.kind,
      date: editing.date,
      day_of_week: Number(dayOfWeekValue),
      type: exceptionType,
      // A whole-day block sends no times at all — that is what NULL/NULL means
      // to the backend. Sending "00:00"/"23:59" instead would not actually
      // cover the final half-hour slot.
      start_time: isWholeDayBlock ? null : startTime,
      end_time: isWholeDayBlock ? null : endTime,
    })
  }

  if (mode === 'confirm-delete') {
    return (
      <>
        <AlertDialogTitle>
          {isExistingException ? 'Delete this exception?' : 'Delete this availability window?'}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {isExistingRecurring
            ? 'This removes the window from every week, not just one date. It can’t be undone.'
            : 'This restores the normal weekly schedule for this date. It can’t be undone.'}
        </AlertDialogDescription>
        {error && <ErrorAlert>{error}</ErrorAlert>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setMode('form')} disabled={deleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <AlertDialogTitle>
          {isExisting ? 'Edit availability' : 'Add availability'}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {editing.date
            ? `${formatSlotDate(editing.date)} · all times are Eastern (America/New_York).`
            : 'All times are Eastern Time (America/New_York).'}
        </AlertDialogDescription>

        {error && <ErrorAlert>{error}</ErrorAlert>}

        {scopeIsChoosable && (
          <Field>
            <FieldLabel htmlFor="availability-scope">Applies to</FieldLabel>
            <Select
              value={scope}
              onValueChange={setScope}
              items={[
                { value: 'recurring', label: `Every ${DAY_NAMES[editing.day_of_week ?? 0]}` },
                { value: 'date', label: 'This date only' },
              ]}
            >
              <SelectTrigger id="availability-scope" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Every {DAY_NAMES[editing.day_of_week ?? 0]}</SelectItem>
                <SelectItem value="date">This date only</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}

        {isDateScoped && (
          <Field>
            <FieldLabel htmlFor="availability-exception-type">Change</FieldLabel>
            <Select
              value={exceptionType}
              onValueChange={setExceptionType}
              items={[
                { value: 'block', label: 'Block time off' },
                { value: 'add', label: 'Add extra time' },
              ]}
            >
              <SelectTrigger id="availability-exception-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Block time off</SelectItem>
                <SelectItem value="add">Add extra time</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}

        {!isDateScoped && (
          <Field>
            <FieldLabel htmlFor="availability-day">Day</FieldLabel>
            <Select
              value={dayOfWeekValue}
              onValueChange={setDayOfWeekValue}
              items={DAY_NAMES.map((name, index) => ({ value: String(index), label: name }))}
            >
              <SelectTrigger id="availability-day" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_NAMES.map((name, index) => (
                  <SelectItem key={index} value={String(index)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {isDateScoped && exceptionType === 'block' && (
          <Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={wholeDay}
                onChange={(event) => setWholeDay(event.target.checked)}
              />
              Block the whole day
            </label>
          </Field>
        )}

        {!isWholeDayBlock && (
          <>
            <Field>
              <FieldLabel htmlFor="availability-start">Start time (Eastern)</FieldLabel>
              <Input
                id="availability-start"
                type="time"
                required
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="availability-end">End time (Eastern)</FieldLabel>
              <Input
                id="availability-end"
                type="time"
                required
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </Field>
          </>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          {isExisting && (
            <Button
              type="button"
              variant="destructive"
              className="mr-auto"
              onClick={() => setMode('confirm-delete')}
              disabled={saving}
            >
              Delete
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
