import { useEffect, useState } from 'react'
import { canManageStudents } from '../../lib/roles.js'
import { CalendarDays, Clock3, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import {
  listOpenSlots,
  listBookings,
  createBooking,
  cancelBooking,
  listAvailability,
  createAvailability,
  deleteAvailability,
} from '../../api/client.js'
import { formatSlotTime, formatSlotDate, formatEasternWallClockTime } from '../../utils/formatSlotTime.js'
import { useStudents } from '../../hooks/useStudents.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import StudentSelect from '@/components/StudentSelect'
import { JoinClassLink } from '@/components/BookingList'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'
import InsightCard from '@/components/records/InsightCard'
import ConfirmDialog from '@/components/ConfirmDialog'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// The open-slots `date` query param means an Eastern calendar date (per the
// backend's timezone model), so "today" for the date picker must also be
// computed in Eastern terms, not the browser's UTC/local terms.
function todayEasternDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
}

function shiftDate(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function BookingCalendarPage() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const isElle = canManageStudents(user)
  const { students, status: studentsStatus, error: studentsError } = useStudents(accessToken, { enabled: isElle })

  const [selectedDate, setSelectedDate] = useState(todayEasternDate)

  const [slotsStatus, setSlotsStatus] = useState('loading') // loading | success | error
  const [slots, setSlots] = useState([])
  const [slotsError, setSlotsError] = useState(null)

  const [studentIdInput, setStudentIdInput] = useState('')
  const [bookingError, setBookingError] = useState(null)
  const [bookingSlot, setBookingSlot] = useState(null)

  const [ownBookingsStatus, setOwnBookingsStatus] = useState('loading')
  const [ownBookings, setOwnBookings] = useState([])
  const [ownBookingsError, setOwnBookingsError] = useState(null)

  // Shared by the fetch-on-date-change effect below and by handleBookSlot
  // (which must re-fetch after a booking succeeds or a 409 reveals the slot
  // list is stale). Takes an `isCancelled` check so the effect can avoid
  // setting state after the date has already changed again / on unmount,
  // while manual post-action refreshes (no race to guard against) just pass
  // a check that always returns false.
  function loadSlots(isCancelled = () => false) {
    setSlotsStatus('loading')
    return listOpenSlots(accessToken, selectedDate)
      .then((body) => {
        if (isCancelled()) return
        setSlots(body.slots)
        setSlotsStatus('success')
      })
      .catch((err) => {
        if (isCancelled()) return
        setSlotsError((err.body && err.body.message) || err.message)
        setSlotsStatus('error')
      })
  }

  function loadOwnBookings(isCancelled = () => false) {
    setOwnBookingsStatus('loading')
    return listBookings(accessToken, { upcoming: true, status: 'booked' })
      .then((body) => {
        if (isCancelled()) return
        setOwnBookings(body.bookings)
        setOwnBookingsStatus('success')
      })
      .catch((err) => {
        if (isCancelled()) return
        setOwnBookingsError((err.body && err.body.message) || err.message)
        setOwnBookingsStatus('error')
      })
  }

  useEffect(() => {
    let cancelled = false
    loadSlots(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [accessToken, selectedDate])

  useEffect(() => {
    let cancelled = false
    loadOwnBookings(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [accessToken])

  async function handleBookSlot(slot) {
    setBookingError(null)
    setBookingSlot(slot)
    try {
      await createBooking(accessToken, {
        scheduled_at: slot,
        student_id: isElle ? Number(studentIdInput) : undefined,
      })
      await Promise.all([loadSlots(), loadOwnBookings()])
    } catch (err) {
      if (err.status === 409) {
        setBookingError((err.body && err.body.message) || 'That slot is no longer available.')
        await loadSlots()
      } else {
        setBookingError((err.body && err.body.message) || err.message)
      }
    } finally {
      setBookingSlot(null)
    }
  }

  async function handleCancelBooking(bookingId) {
    try {
      await cancelBooking(accessToken, bookingId)
      setOwnBookings((prev) => prev.filter((booking) => booking.id !== bookingId))
    } catch {
      // Leave the booking in place so the user can retry.
    }
  }

  const canBook = !isElle || studentIdInput.trim().length > 0
  // Bookings has no per-item detail route (unlike Videos/Surveys) — a
  // booking's only "detail" action is joining/cancelling it, both already
  // inline on its list row — so this page adapts MASTER.md's master-detail-
  // insight composition without nested routing: a persistent dark list
  // panel (upcoming bookings) beside the existing light booking/
  // availability form content, plus a lime insight card spotlighting the
  // soonest upcoming booking. See the frontend engineer's report for the
  // full reasoning.
  const nextBooking = ownBookings[0] ?? null

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row">
      <div className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-dark-border bg-dark p-5 lg:h-full lg:w-[22rem] lg:border-r lg:border-b-0">
        <h1 className="m-0 font-heading text-xl font-extrabold text-white">{t('bookings.title')}</h1>
        <StatTiles
          tiles={[
            { label: 'Upcoming', value: ownBookings.length, icon: CalendarDays },
            { label: 'Open today', value: slots.length, icon: Clock3 },
          ]}
        />
        <h2 className="m-0 text-xs font-semibold tracking-wide text-dark-muted uppercase">{t('bookings.yourUpcoming')}</h2>
        <ul className="flex flex-col gap-2">
          {ownBookingsStatus === 'loading' && <li className="px-1 text-sm text-dark-muted">Loading bookings…</li>}
          {ownBookingsStatus === 'error' && <li className="px-1 text-sm text-priority-high">{ownBookingsError}</li>}
          {ownBookingsStatus === 'success' && ownBookings.length === 0 && (
            <li className="px-1 text-sm text-dark-muted">{t('bookings.emptyUpcoming')}</li>
          )}
          {ownBookingsStatus === 'success' &&
            ownBookings.map((booking) => (
              <li key={booking.id}>
                <RecordCard
                  icon={CalendarDays}
                  title={`${formatSlotDate(booking.scheduled_at)} · ${formatSlotTime(booking.scheduled_at)}`}
                  meta={isElle ? booking.student_name : undefined}
                  pillLabel={booking.joinable ? 'Joinable now' : 'Scheduled'}
                  pillVariant={booking.joinable ? 'lime' : 'outlineDark'}
                  actions={
                    <>
                      {booking.joinable && (
                        <JoinClassLink
                          bookingId={booking.id}
                          size="sm"
                          className="focus-visible:border-lime focus-visible:ring-lime/50"
                        />
                      )}
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-dark-muted hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50"
                        onClick={() => handleCancelBooking(booking.id)}
                        aria-label="Cancel booking"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                    </>
                  }
                />
              </li>
            ))}
        </ul>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-6 p-6 lg:h-full lg:flex-row lg:items-start lg:overflow-y-auto">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <section className="flex flex-col gap-3 border-b border-border pb-5">
            <h2>Available slots — {formatSlotDate(selectedDate)}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedDate((prev) => shiftDate(prev, -1))}>
                Previous day
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate((prev) => shiftDate(prev, 1))}>
                Next day
              </Button>
            </div>

            {isElle && (
              <Field className="max-w-sm">
                <FieldLabel htmlFor="booking-student-id">Student ID (required to book)</FieldLabel>
                <StudentSelect
                  id="booking-student-id"
                  value={studentIdInput}
                  onChange={setStudentIdInput}
                  students={students}
                  status={studentsStatus}
                />
                {studentsStatus === 'error' && <FieldDescription>{studentsError}</FieldDescription>}
              </Field>
            )}

            {bookingError && <ErrorAlert>{bookingError}</ErrorAlert>}
            {slotsStatus === 'loading' && <LoadingText>Loading slots...</LoadingText>}
            {slotsStatus === 'error' && <ErrorAlert>{slotsError}</ErrorAlert>}
            {slotsStatus === 'success' && slots.length === 0 && <EmptyState>No open slots for this day.</EmptyState>}
            {slotsStatus === 'success' && slots.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <li key={slot}>
                    <Button
                      variant="outline"
                      disabled={!canBook || bookingSlot === slot}
                      onClick={() => handleBookSlot(slot)}
                    >
                      {formatSlotTime(slot)}
                      {bookingSlot === slot ? ' — booking...' : ''}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {isElle && <AvailabilityManager accessToken={accessToken} />}
        </div>

        {nextBooking && (
          <aside className="w-full shrink-0 lg:w-72">
            <InsightCard tone="lime" title="Next booking">
              <p className="m-0 font-semibold">
                {formatSlotDate(nextBooking.scheduled_at)} · {formatSlotTime(nextBooking.scheduled_at)}
              </p>
              {isElle && <p className="m-0 opacity-80">{nextBooking.student_name}</p>}
              {nextBooking.joinable && (
                <div className="pt-1">
                  <JoinClassLink bookingId={nextBooking.id} />
                </div>
              )}
            </InsightCard>
          </aside>
        )}
      </div>
    </div>
  )
}

// Feature 3: weekly availability calendar. A reasonable 6am–10pm hour range
// covers this app's realistic tutoring hours, but expands automatically to
// fit any existing window that falls outside it, so real data is never
// clipped out of view.
const DEFAULT_RANGE_START_HOUR = 6
const DEFAULT_RANGE_END_HOUR = 22
const HOUR_HEIGHT = 48 // px per hour in the grid

// hhmm: a bare "HH:MM" or "HH:MM:SS" Eastern wall-clock time (same shape
// formatSlotTime.js's formatEasternWallClockTime already parses) -> minutes
// since midnight, for positioning/sizing a block within the grid.
function parseTimeToMinutes(hhmm) {
  const match = String(hhmm).match(/^(\d{1,2}):(\d{2})/)
  if (!match) return 0
  return Number(match[1]) * 60 + Number(match[2])
}

// Inverse of the above, snapped to the nearest 15 minutes, for prefilling a
// <input type="time"> value from a grid click position.
function minutesToTimeInputValue(minutes) {
  const snapped = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes / 15) * 15))
  const hh = String(Math.floor(snapped / 60)).padStart(2, '0')
  const mm = String(snapped % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// Axis tick label only ("6 AM", "10 PM") — not a stored/fetched date-time
// value, so this doesn't go through formatSlotTime.js's formatters (which
// exist to keep *data* formatting consistent); it's purely the grid's own
// static hour scaffold, already unambiguously Eastern via this section's own
// heading/description.
function formatHourLabel(hour) {
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12} ${period}`
}

function AvailabilityManager({ accessToken }) {
  const [status, setStatus] = useState('loading') // loading | success | error
  const [windows, setWindows] = useState([])
  const [error, setError] = useState(null)

  // `editing` holds the panel's current target: `{ id, day_of_week,
  // start_time, end_time }` when editing an existing block, or the same
  // shape without `id` when creating a new one from a grid click / the "Add"
  // button. `panelKey` is bumped on every open so <AvailabilityPanel>'s
  // internal form state remounts fresh instead of needing a sync effect.
  const [editing, setEditing] = useState(null)
  const [panelKey, setPanelKey] = useState(0)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function loadWindows(isCancelled = () => false) {
    setStatus('loading')
    return listAvailability(accessToken)
      .then((body) => {
        if (isCancelled()) return
        setWindows(body.availability)
        setStatus('success')
      })
      .catch((err) => {
        if (isCancelled()) return
        setError((err.body && err.body.message) || err.message)
        setStatus('error')
      })
  }

  useEffect(() => {
    let cancelled = false
    loadWindows(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [accessToken])

  const rangeStartHour = Math.min(DEFAULT_RANGE_START_HOUR, ...windows.map((w) => Math.floor(parseTimeToMinutes(w.start_time) / 60)))
  const rangeEndHour = Math.max(DEFAULT_RANGE_END_HOUR, ...windows.map((w) => Math.ceil(parseTimeToMinutes(w.end_time) / 60)))
  const totalHeight = (rangeEndHour - rangeStartHour) * HOUR_HEIGHT
  const hourTicks = []
  for (let hour = rangeStartHour; hour <= rangeEndHour; hour += 1) hourTicks.push(hour)

  function openCreatePanel(dayOfWeek, startMinutes) {
    const start = startMinutes ?? rangeStartHour * 60
    const end = Math.min(rangeEndHour * 60, start + 60)
    setFormError(null)
    setEditing({ day_of_week: dayOfWeek, start_time: minutesToTimeInputValue(start), end_time: minutesToTimeInputValue(end) })
    setPanelKey((key) => key + 1)
  }

  function openEditPanel(window) {
    setFormError(null)
    setEditing({
      id: window.id,
      day_of_week: window.day_of_week,
      start_time: window.start_time.slice(0, 5),
      end_time: window.end_time.slice(0, 5),
    })
    setPanelKey((key) => key + 1)
  }

  function closePanel() {
    setEditing(null)
    setFormError(null)
    setConfirmDeleteOpen(false)
  }

  // Clicking an empty area of a day column derives an approximate start time
  // from the click's vertical position (nice-to-have per the task) and opens
  // the same panel in create mode. Blocks stop this from firing when a block
  // itself is clicked (see the block's own onClick below).
  function handleGridClick(event, dayOfWeek) {
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetMinutes = ((event.clientY - rect.top) / HOUR_HEIGHT) * 60
    const snapped = Math.round(offsetMinutes / 30) * 30
    openCreatePanel(dayOfWeek, rangeStartHour * 60 + snapped)
  }

  async function handleSave({ day_of_week, start_time, end_time }) {
    setSaving(true)
    setFormError(null)
    try {
      const payload = { day_of_week: Number(day_of_week), start_time, end_time }
      if (editing.id) {
        await updateAvailability(accessToken, editing.id, payload)
      } else {
        await createAvailability(accessToken, payload)
      }
      await loadWindows()
      closePanel()
    } catch (err) {
      setFormError((err.body && err.body.message) || err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteAvailability(accessToken, editing.id)
      await loadWindows()
      closePanel()
    } catch (err) {
      setFormError((err.body && err.body.message) || err.message)
      setConfirmDeleteOpen(false)
      setDeleting(false)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0">Availability</h2>
        <Button size="sm" variant="outline" onClick={() => openCreatePanel(0)}>
          Add availability window
        </Button>
      </div>
      <FieldDescription>
        All times are Eastern Time (America/New_York). Click an existing block to edit or delete it; click an empty
        area of the grid to add a new window.
      </FieldDescription>

      {status === 'loading' && <LoadingText>Loading availability...</LoadingText>}
      {status === 'error' && <ErrorAlert>{error}</ErrorAlert>}
      {status === 'success' && windows.length === 0 && (
        <EmptyState>No recurring availability windows yet — click the grid below (or "Add availability window") to create one.</EmptyState>
      )}

      {status === 'success' && (
        // Horizontal scroll is contained to this element only, never the
        // page itself, so the grid stays usable at mobile widths (375px)
        // without breaking the surrounding layout.
        <div className="overflow-x-auto rounded-md border border-border">
          <div className="inline-grid min-w-[44rem]" style={{ gridTemplateColumns: '3.5rem repeat(7, minmax(6rem, 1fr))' }}>
            <div className="sticky left-0 z-10 border-b border-border bg-card" />
            {DAY_NAMES.map((name) => (
              <div key={name} className="border-b border-l border-border bg-card px-2 py-2 text-center text-xs font-semibold">
                {name.slice(0, 3)}
              </div>
            ))}

            <div className="sticky left-0 z-10 bg-card">
              <div className="relative" style={{ height: totalHeight }}>
                {hourTicks.map((hour) => (
                  <span
                    key={hour}
                    className="absolute right-1.5 -translate-y-1/2 text-[0.65rem] text-muted-foreground"
                    style={{ top: (hour - rangeStartHour) * HOUR_HEIGHT }}
                  >
                    {formatHourLabel(hour)}
                  </span>
                ))}
              </div>
            </div>

            {DAY_NAMES.map((_, dayIndex) => (
              <div
                key={dayIndex}
                className="relative cursor-pointer border-l border-border"
                style={{ height: totalHeight }}
                onClick={(event) => handleGridClick(event, dayIndex)}
              >
                {hourTicks.map((hour) => (
                  <div
                    key={hour}
                    className="pointer-events-none absolute inset-x-0 border-t border-border/60"
                    style={{ top: (hour - rangeStartHour) * HOUR_HEIGHT }}
                  />
                ))}
                {windows
                  .filter((window) => window.day_of_week === dayIndex)
                  .map((window) => {
                    const startMinutes = parseTimeToMinutes(window.start_time)
                    const endMinutes = parseTimeToMinutes(window.end_time)
                    const top = (startMinutes / 60 - rangeStartHour) * HOUR_HEIGHT
                    const height = Math.max(18, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT)
                    return (
                      <button
                        key={window.id}
                        type="button"
                        className="absolute inset-x-1 overflow-hidden rounded-sm bg-lime px-1.5 py-1 text-left text-[0.7rem] leading-tight font-medium text-on-lime shadow-sm transition-colors hover:bg-lime-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        style={{ top, height }}
                        onClick={(event) => {
                          event.stopPropagation()
                          openEditPanel(window)
                        }}
                      >
                        {formatEasternWallClockTime(window.start_time)}–{formatEasternWallClockTime(window.end_time)}
                      </button>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <AvailabilityPanel
          key={panelKey}
          editing={editing}
          onSave={handleSave}
          onRequestDelete={() => setConfirmDeleteOpen(true)}
          onCancel={closePanel}
          saving={saving}
          error={formError}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={(next) => {
          if (!deleting) setConfirmDeleteOpen(next)
        }}
        title="Delete this availability window?"
        description="This can't be undone."
        pending={deleting}
        onConfirm={handleDelete}
      />
    </section>
  )
}

// The create/edit panel for a single availability window (Feature 3).
// Deliberately a simple inline expand rather than a positioned popover — no
// Popover component exists in this app yet, and the task calls this an
// acceptable alternative — pre-filled from `editing` and remounted (via the
// parent's `key`) whenever a different block/empty-area is clicked.
function AvailabilityPanel({ editing, onSave, onRequestDelete, onCancel, saving, error }) {
  const [dayOfWeek, setDayOfWeek] = useState(String(editing.day_of_week))
  const [startTime, setStartTime] = useState(editing.start_time)
  const [endTime, setEndTime] = useState(editing.end_time)

  function handleSubmit(event) {
    event.preventDefault()
    onSave({ day_of_week: dayOfWeek, start_time: startTime, end_time: endTime })
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <h3 className="m-0">{editing.id ? 'Edit availability window' : 'Add availability window'}</h3>
            {error && <ErrorAlert>{error}</ErrorAlert>}
            <Field>
              <FieldLabel htmlFor="availability-day">Day</FieldLabel>
              <Select
                value={dayOfWeek}
                onValueChange={setDayOfWeek}
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
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              {editing.id && (
                <Button type="button" variant="destructive" onClick={onRequestDelete} disabled={saving}>
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
