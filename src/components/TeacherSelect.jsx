import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// The owner-only "whose calendar am I looking at?" dropdown on the booking
// page. An owner has no calendar of their own, so every scheduling request
// they make has to name a teacher (see the server's utils/calendarAdmin.js) —
// without this control the page had no way to supply one and rendered the raw
// resolver error instead.
//
// Deliberately mirrors StudentSelect rather than sharing an abstraction with
// it: same sentinel handling and the same Base UI render-prop requirement, but
// the two label different entities and only one of them offers a "none" row.
const LOADING_VALUE = '__loading__'

export default function TeacherSelect({ id, value, onChange, admins, status }) {
  const isLoading = status === 'loading'
  const isError = status === 'error'

  // Base UI's Select.Value renders the raw value string unless given this
  // render-prop, so the sentinel and every id need an explicit label.
  function renderLabel(currentValue) {
    if (currentValue === LOADING_VALUE) return 'Loading teachers…'
    const admin = admins.find((candidate) => String(candidate.id) === currentValue)
    return admin ? admin.name : '— Select a teacher —'
  }

  return (
    <Select
      value={isLoading ? LOADING_VALUE : value || ''}
      onValueChange={onChange}
      disabled={isLoading || isError}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue>{renderLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {admins.map((admin) => (
          <SelectItem key={admin.id} value={String(admin.id)}>
            {admin.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
