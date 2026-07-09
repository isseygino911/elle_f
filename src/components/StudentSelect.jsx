import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Shared by every "assign/select a student" dropdown (dashboard task form,
// dashboard message-thread jump, booking calendar, video upload). Wraps the
// same loading/error-aware behavior the hand-rolled <select> markup used to
// duplicate across four pages.
const NONE_VALUE = '__none__'
// Distinct from NONE_VALUE and never undefined, so Select stays controlled on
// every render — passing `undefined` while loading then a real string once
// loaded trips Base UI's uncontrolled-to-controlled warning.
const LOADING_VALUE = '__loading__'

export default function StudentSelect({ id, value, onChange, students, status, emptyLabel = '— Select a student —' }) {
  const isLoading = status === 'loading'
  const isError = status === 'error'

  // Base UI's Select.Value does not look up a matching SelectItem's children
  // to render as the label — by default it displays the raw selected value
  // string. It only renders a custom label when given this children
  // render-prop, so every sentinel/id value needs an explicit mapping here.
  function renderLabel(currentValue) {
    if (currentValue === LOADING_VALUE) return 'Loading students…'
    if (currentValue === NONE_VALUE || !currentValue) return emptyLabel
    const student = students.find((candidate) => String(candidate.id) === currentValue)
    return student ? `${student.name} (${student.email})` : emptyLabel
  }

  return (
    <Select
      value={isLoading ? LOADING_VALUE : value || NONE_VALUE}
      onValueChange={(next) => onChange(next === NONE_VALUE ? '' : next)}
      disabled={isLoading || isError}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue>{renderLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>{emptyLabel}</SelectItem>
        {students.map((student) => (
          <SelectItem key={student.id} value={String(student.id)}>
            {student.name} ({student.email})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
