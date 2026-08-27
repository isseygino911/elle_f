import { useEffect, useState } from 'react'
import {
  listAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  listAvailabilityExceptions,
  createAvailabilityException,
  updateAvailabilityException,
  deleteAvailabilityException,
} from '../../api/client.js'
import { formatEasternWallClockTime } from '../../utils/formatSlotTime.js'
import {
  todayEasternDate,
  shiftDate,
  dayOfWeek,
  weekDates,
  monthGridDates,
  shiftMonth,
  monthKey,
  formatMonthLabel,
  dayOfMonth,
} from '../../utils/calendarDates.js'
import { Button } from '@/components/ui/button'
import { FieldDescription } from '@/components/ui/field'
import { LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import AvailabilityDialog from './AvailabilityDialog.jsx'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// A reasonable 6am–10pm range covers this app's realistic tutoring hours, but
// expands automatically to fit any window that falls outside it, so real data
// is never clipped out of view.
const DEFAULT_RANGE_START_HOUR = 6
const DEFAULT_RANGE_END_HOUR = 22
const HOUR_HEIGHT = 48 // px per hour in the week grid

// hhmm: a bare "HH:MM"/"HH:MM:SS" Eastern wall-clock time -> minutes since
// midnight, for positioning a block within the grid.
function parseTimeToMinutes(hhmm) {
  const match = String(hhmm).match(/^(\d{1,2}):(\d{2})/)
  if (!match) return 0
  return Number(match[1]) * 60 + Number(match[2])
}

// Inverse, snapped to 15 minutes, for prefilling <input type="time"> from a
// grid click position.
function minutesToTimeInputValue(minutes) {
  const snapped = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes / 15) * 15))
  const hh = String(Math.floor(snapped / 60)).padStart(2, '0')
  const mm = String(snapped % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// Axis tick label only ("6 AM") — the grid's own static scaffold, not a
// stored/fetched value, so it doesn't go through formatSlotTime.js's
// data formatters.
function formatHourLabel(hour) {
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12} ${period}`
}

// The recurring weekly template projected onto one real date, with that date's
// exceptions applied. Returns the segments to draw for that day.
//
// Mirrors the backend's merge order (recurring -> adds -> blocks) so the grid
// shows what computeOpenSlotsRange will actually offer. It is a VISUAL
// approximation: the backend subtracts at 30-minute slot granularity, whereas
// this draws blocks as overlay bands. The authoritative answer is always the
// open-slots response, never this.
function segmentsForDate(date, windows, exceptionsByDate) {
  const dow = dayOfWeek(date)
  const exceptions = exceptionsByDate.get(date) || []

  const recurring = windows
    .filter((w) => w.day_of_week === dow)
    .map((w) => ({ kind: 'recurring', row: w, start: w.start_time, end: w.end_time }))

  const added = exceptions
    .filter((e) => e.type === 'add')
    .map((e) => ({ kind: 'add', row: e, start: e.start_time, end: e.end_time }))

  const blocked = exceptions
    .filter((e) => e.type === 'block')
    .map((e) => ({
      kind: 'block',
      row: e,
      wholeDay: e.start_time === null,
      start: e.start_time ?? '00:00',
      end: e.end_time ?? '24:00',
    }))

  return { recurring, added, blocked }
}

// `adminId` names whose calendar this is. Undefined for a teacher, who always
// acts on their own; an owner must pass one, because they have no calendar of
// their own for the server to fall back to.
export default function AvailabilityCalendar({ accessToken, adminId }) {
  const [status, setStatus] = useState('loading') // loading | success | error
  const [windows, setWindows] = useState([])
  const [exceptions, setExceptions] = useState([])
  const [error, setError] = useState(null)

  const [view, setView] = useState('week') // week | month
  const [anchorDate, setAnchorDate] = useState(todayEasternDate)

  const [editing, setEditing] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const visibleDates = view === 'week' ? weekDates(anchorDate) : monthGridDates(anchorDate)
  const rangeFrom = visibleDates[0]
  const rangeTo = visibleDates[visibleDates.length - 1]

  function loadAll(isCancelled = () => false) {
    setStatus('loading')
    return Promise.all([
      listAvailability(accessToken, adminId),
      // Exceptions are fetched for exactly the visible span, so switching
      // month or week refetches only what is on screen.
      listAvailabilityExceptions(accessToken, { from: rangeFrom, to: rangeTo, admin_id: adminId }),
    ])
      .then(([availabilityBody, exceptionsBody]) => {
        if (isCancelled()) return
        setWindows(availabilityBody.availability)
        setExceptions(exceptionsBody.exceptions)
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
    loadAll(() => cancelled)
    return () => {
      cancelled = true
    }
    // Refetch when the visible span moves, not on every render.
  }, [accessToken, adminId, rangeFrom, rangeTo])

  const exceptionsByDate = new Map()
  for (const exception of exceptions) {
    const existing = exceptionsByDate.get(exception.date)
    if (existing) existing.push(exception)
    else exceptionsByDate.set(exception.date, [exception])
  }

  const rangeStartHour = Math.min(
    DEFAULT_RANGE_START_HOUR,
    ...windows.map((w) => Math.floor(parseTimeToMinutes(w.start_time) / 60))
  )
  const rangeEndHour = Math.max(
    DEFAULT_RANGE_END_HOUR,
    ...windows.map((w) => Math.ceil(parseTimeToMinutes(w.end_time) / 60))
  )
  const totalHeight = (rangeEndHour - rangeStartHour) * HOUR_HEIGHT
  const hourTicks = []
  for (let hour = rangeStartHour; hour <= rangeEndHour; hour += 1) hourTicks.push(hour)

  // `key` forces the dialog body to remount so its form state resets between
  // targets without a sync effect.
  function openDialog(next) {
    setFormError(null)
    setEditing({ ...next, key: `${next.kind}-${next.id ?? 'new'}-${next.date ?? ''}-${Date.now()}` })
    setDialogOpen(true)
  }

  function openCreateForDate(date, startMinutes) {
    const start = startMinutes ?? rangeStartHour * 60
    const end = Math.min(rangeEndHour * 60, start + 60)
    openDialog({
      kind: 'recurring',
      date,
      day_of_week: dayOfWeek(date),
      start_time: minutesToTimeInputValue(start),
      end_time: minutesToTimeInputValue(end),
      defaultScope: 'recurring',
    })
  }

  function openEditRecurring(window, date) {
    openDialog({
      kind: 'recurring',
      id: window.id,
      date,
      day_of_week: window.day_of_week,
      start_time: window.start_time.slice(0, 5),
      end_time: window.end_time.slice(0, 5),
    })
  }

  function openEditException(exception) {
    openDialog({
      kind: 'exception',
      id: exception.id,
      date: exception.date,
      day_of_week: dayOfWeek(exception.date),
      type: exception.type,
      start_time: exception.start_time ? exception.start_time.slice(0, 5) : null,
      end_time: exception.end_time ? exception.end_time.slice(0, 5) : null,
    })
  }

  function handleGridClick(event, date) {
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetMinutes = ((event.clientY - rect.top) / HOUR_HEIGHT) * 60
    const snapped = Math.round(offsetMinutes / 30) * 30
    openCreateForDate(date, rangeStartHour * 60 + snapped)
  }

  async function handleSave(payload) {
    setSaving(true)
    setFormError(null)
    try {
      if (payload.scope === 'date') {
        const body = {
          date: payload.date,
          type: payload.type,
          start_time: payload.start_time,
          end_time: payload.end_time,
          admin_id: adminId,
        }
        if (payload.kind === 'exception' && payload.id) {
          await updateAvailabilityException(accessToken, payload.id, body)
        } else {
          await createAvailabilityException(accessToken, body)
        }
      } else {
        const body = {
          day_of_week: payload.day_of_week,
          start_time: payload.start_time,
          end_time: payload.end_time,
          admin_id: adminId,
        }
        if (payload.kind === 'recurring' && payload.id) {
          await updateAvailability(accessToken, payload.id, body)
        } else {
          await createAvailability(accessToken, body)
        }
      }
      await loadAll()
      setDialogOpen(false)
      setEditing(null)
    } catch (err) {
      setFormError((err.body && err.body.message) || err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setFormError(null)
    try {
      if (editing.kind === 'exception') {
        await deleteAvailabilityException(accessToken, editing.id, adminId)
      } else {
        await deleteAvailability(accessToken, editing.id, adminId)
      }
      await loadAll()
      setDialogOpen(false)
      setEditing(null)
    } catch (err) {
      setFormError((err.body && err.body.message) || err.message)
    } finally {
      setDeleting(false)
    }
  }

  function goToday() {
    setAnchorDate(todayEasternDate())
  }

  function goPrev() {
    setAnchorDate((prev) => (view === 'week' ? shiftDate(prev, -7) : shiftMonth(prev, -1)))
  }

  function goNext() {
    setAnchorDate((prev) => (view === 'week' ? shiftDate(prev, 7) : shiftMonth(prev, 1)))
  }

  const today = todayEasternDate()

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0">Availability</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-border">
            <button
              type="button"
              className={`px-3 py-1 text-sm ${view === 'week' ? 'bg-lime text-on-lime' : 'bg-card'}`}
              onClick={() => setView('week')}
              aria-pressed={view === 'week'}
            >
              Week
            </button>
            <button
              type="button"
              className={`border-l border-border px-3 py-1 text-sm ${view === 'month' ? 'bg-lime text-on-lime' : 'bg-card'}`}
              onClick={() => setView('month')}
              aria-pressed={view === 'month'}
            >
              Month
            </button>
          </div>
          <Button size="sm" variant="outline" onClick={goPrev} aria-label="Previous">
            ←
          </Button>
          <Button size="sm" variant="outline" onClick={goToday}>
            Today
          </Button>
          <Button size="sm" variant="outline" onClick={goNext} aria-label="Next">
            →
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-sm">
          {view === 'week'
            ? `Week of ${visibleDates[0]}`
            : formatMonthLabel(anchorDate)}
        </strong>
        {/* Three states in one grid is not self-evident without a legend. */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded-sm bg-lime" aria-hidden="true" /> Recurring
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block size-3 rounded-sm border border-lime bg-lime/40"
              aria-hidden="true"
            />{' '}
            Added
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block size-3 rounded-sm bg-[repeating-linear-gradient(45deg,#9993,#9993_2px,transparent_2px,transparent_4px)] ring-1 ring-border"
              aria-hidden="true"
            />{' '}
            Blocked
          </span>
        </div>
      </div>

      <FieldDescription>
        All times are Eastern Time (America/New_York). Click a block to edit it, or an empty area to
        add. A block only stops new bookings — it never cancels one already made.
      </FieldDescription>

      {status === 'loading' && <LoadingText>Loading availability...</LoadingText>}
      {status === 'error' && <ErrorAlert>{error}</ErrorAlert>}
      {status === 'success' && windows.length === 0 && exceptions.length === 0 && (
        <EmptyState>
          No recurring availability yet — click the grid below to create your first window.
        </EmptyState>
      )}

      {status === 'success' && view === 'week' && (
        <WeekGrid
          dates={visibleDates}
          today={today}
          windows={windows}
          exceptionsByDate={exceptionsByDate}
          hourTicks={hourTicks}
          rangeStartHour={rangeStartHour}
          totalHeight={totalHeight}
          onGridClick={handleGridClick}
          onEditRecurring={openEditRecurring}
          onEditException={openEditException}
        />
      )}

      {status === 'success' && view === 'month' && (
        <MonthGrid
          dates={visibleDates}
          today={today}
          anchorMonth={monthKey(anchorDate)}
          windows={windows}
          exceptionsByDate={exceptionsByDate}
          onSelectDate={(date) => openCreateForDate(date)}
          onEditException={openEditException}
        />
      )}

      <AvailabilityDialog
        open={dialogOpen}
        editing={editing}
        onOpenChange={(next) => {
          if (saving || deleting) return
          setDialogOpen(next)
          if (!next) setEditing(null)
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        saving={saving}
        deleting={deleting}
        error={formError}
      />
    </section>
  )
}

function WeekGrid({
  dates,
  today,
  windows,
  exceptionsByDate,
  hourTicks,
  rangeStartHour,
  totalHeight,
  onGridClick,
  onEditRecurring,
  onEditException,
}) {
  return (
    // Horizontal scroll is contained to this element only, never the page
    // itself, so the grid stays usable at mobile widths.
    <div className="overflow-x-auto rounded-md border border-border">
      <div className="inline-grid min-w-[44rem]" style={{ gridTemplateColumns: '3.5rem repeat(7, minmax(6rem, 1fr))' }}>
        <div className="sticky left-0 z-10 border-b border-border bg-card" />
        {dates.map((date) => (
          <div
            key={date}
            className={`border-b border-l border-border px-2 py-2 text-center text-xs font-semibold ${
              date === today ? 'bg-lime/20' : 'bg-card'
            }`}
          >
            <div>{DAY_NAMES[dayOfWeek(date)].slice(0, 3)}</div>
            <div className="font-normal text-muted-foreground">{dayOfMonth(date)}</div>
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

        {dates.map((date) => {
          const { recurring, added, blocked } = segmentsForDate(date, windows, exceptionsByDate)
          return (
            <div
              key={date}
              className="relative cursor-pointer border-l border-border"
              style={{ height: totalHeight }}
              onClick={(event) => onGridClick(event, date)}
            >
              {hourTicks.map((hour) => (
                <div
                  key={hour}
                  className="pointer-events-none absolute inset-x-0 border-t border-border/60"
                  style={{ top: (hour - rangeStartHour) * HOUR_HEIGHT }}
                />
              ))}

              {[...recurring, ...added].map((segment) => {
                const startMinutes = parseTimeToMinutes(segment.start)
                const endMinutes = parseTimeToMinutes(segment.end)
                const top = (startMinutes / 60 - rangeStartHour) * HOUR_HEIGHT
                const height = Math.max(18, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT)
                return (
                  <button
                    key={`${segment.kind}-${segment.row.id}`}
                    type="button"
                    className={`absolute inset-x-1 overflow-hidden rounded-sm px-1.5 py-1 text-left text-[0.7rem] leading-tight font-medium shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      segment.kind === 'add'
                        ? 'border border-lime bg-lime/40 text-foreground'
                        : 'bg-lime text-on-lime hover:bg-lime-hover'
                    }`}
                    style={{ top, height }}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (segment.kind === 'add') onEditException(segment.row)
                      else onEditRecurring(segment.row, date)
                    }}
                  >
                    {formatEasternWallClockTime(segment.start)}–{formatEasternWallClockTime(segment.end)}
                  </button>
                )
              })}

              {/* Blocks are drawn OVER the windows they suppress, so a
                  partially-blocked window still reads as one window with a
                  hole in it rather than two unrelated bars. */}
              {blocked.map((segment) => {
                const startMinutes = segment.wholeDay ? rangeStartHour * 60 : parseTimeToMinutes(segment.start)
                const endMinutes = segment.wholeDay
                  ? (rangeStartHour * 60) + (totalHeight / HOUR_HEIGHT) * 60
                  : parseTimeToMinutes(segment.end)
                const top = (startMinutes / 60 - rangeStartHour) * HOUR_HEIGHT
                const height = Math.max(18, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT)
                return (
                  <button
                    key={`block-${segment.row.id}`}
                    type="button"
                    title={segment.wholeDay ? 'Blocked all day' : 'Blocked'}
                    className="absolute inset-x-1 overflow-hidden rounded-sm bg-[repeating-linear-gradient(45deg,#8888,#8888_3px,transparent_3px,transparent_6px)] px-1.5 py-1 text-left text-[0.7rem] leading-tight font-medium text-foreground ring-1 ring-border backdrop-blur-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    style={{ top, height }}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEditException(segment.row)
                    }}
                  >
                    {segment.wholeDay ? 'Blocked' : `Blocked ${formatEasternWallClockTime(segment.start)}`}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// A 6x7 day-cell grid. Each cell summarizes its date rather than drawing a
// time axis — at month scale a per-slot rendering is unreadable.
function MonthGrid({ dates, today, anchorMonth, windows, exceptionsByDate, onSelectDate, onEditException }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <div className="grid min-w-[36rem] grid-cols-7">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="border-b border-l border-border bg-card px-2 py-2 text-center text-xs font-semibold first:border-l-0"
          >
            {name.slice(0, 3)}
          </div>
        ))}

        {dates.map((date) => {
          const { recurring, added, blocked } = segmentsForDate(date, windows, exceptionsByDate)
          const wholeDayBlocked = blocked.some((b) => b.wholeDay)
          const inMonth = date.slice(0, 7) === anchorMonth
          const openCount = wholeDayBlocked ? 0 : recurring.length + added.length

          return (
            <div
              key={date}
              role="button"
              tabIndex={0}
              className={`min-h-[5.5rem] cursor-pointer border-b border-l border-border p-1.5 text-left transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${
                inMonth ? '' : 'opacity-40'
              } ${date === today ? 'bg-lime/10' : ''}`}
              onClick={() => onSelectDate(date)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectDate(date)
                }
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${date === today ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                >
                  {dayOfMonth(date)}
                </span>
                {wholeDayBlocked && (
                  <span className="rounded-sm bg-muted px-1 text-[0.6rem] text-muted-foreground">
                    Off
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-col gap-0.5">
                {!wholeDayBlocked &&
                  [...recurring, ...added].slice(0, 2).map((segment) => (
                    <span
                      key={`${segment.kind}-${segment.row.id}`}
                      className={`truncate rounded-sm px-1 text-[0.6rem] leading-tight ${
                        segment.kind === 'add'
                          ? 'border border-lime bg-lime/40 text-foreground'
                          : 'bg-lime text-on-lime'
                      }`}
                    >
                      {formatEasternWallClockTime(segment.start)}
                    </span>
                  ))}
                {!wholeDayBlocked && openCount > 2 && (
                  <span className="px-1 text-[0.6rem] text-muted-foreground">
                    +{openCount - 2} more
                  </span>
                )}
                {blocked
                  .filter((b) => !b.wholeDay)
                  .slice(0, 1)
                  .map((segment) => (
                    <button
                      key={`block-${segment.row.id}`}
                      type="button"
                      className="truncate rounded-sm bg-[repeating-linear-gradient(45deg,#8888,#8888_3px,transparent_3px,transparent_6px)] px-1 text-left text-[0.6rem] leading-tight ring-1 ring-border"
                      onClick={(event) => {
                        event.stopPropagation()
                        onEditException(segment.row)
                      }}
                    >
                      Blocked
                    </button>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
