// Calendar date math for the booking page's week and month views.
//
// Every date here is a bare "YYYY-MM-DD" Eastern CALENDAR date — the same
// thing the backend's `date` params mean — never an instant. All arithmetic
// goes through Date.UTC on the date components so it stays a pure calendar
// walk: stepping an actual instant by 86_400_000 ms drifts an hour across each
// DST transition and eventually repeats or skips a day.
//
// No date library: this project has none installed, and these six functions
// are the whole requirement.

// The Eastern calendar date "today", not the browser's local or UTC one. The
// backend's date params mean Eastern dates, so "today" must be computed the
// same way or the calendar highlights the wrong cell near midnight.
export function todayEasternDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
}

export function shiftDate(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

// 0 = Sunday .. 6 = Saturday, matching availability.day_of_week and the
// backend's getEasternDateParts. A pure calendar date needs no timezone
// conversion to yield a weekday.
export function dayOfWeek(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

// The Sunday on or before `dateStr` — the first column of a week grid.
export function startOfWeek(dateStr) {
  return shiftDate(dateStr, -dayOfWeek(dateStr))
}

// The 7 dates of the week containing `dateStr`, Sunday first.
export function weekDates(dateStr) {
  const start = startOfWeek(dateStr)
  return Array.from({ length: 7 }, (_, i) => shiftDate(start, i))
}

// The 6x7 = 42 dates of a month grid: the containing month padded out to whole
// weeks, so leading/trailing cells belong to the adjacent months. Always 42
// cells so the grid's height doesn't jump between months.
//
// NOTE 42 > the backend's 31-day range cap, so a month view must fetch open
// slots in two requests (or fetch only the month proper). See MAX_RANGE_DAYS.
export function monthGridDates(dateStr) {
  const [year, month] = dateStr.split('-').map(Number)
  const firstOfMonth = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`
  const gridStart = startOfWeek(firstOfMonth)
  return Array.from({ length: 42 }, (_, i) => shiftDate(gridStart, i))
}

// Shifts by whole months, clamping the day so 2026-01-31 + 1 month is
// 2026-02-28 rather than rolling over into March.
export function shiftMonth(dateStr, months) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const target = new Date(Date.UTC(year, month - 1 + months, 1))
  const targetYear = target.getUTCFullYear()
  const targetMonth = target.getUTCMonth()
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate()
  return new Date(
    Date.UTC(targetYear, targetMonth, Math.min(day, daysInTargetMonth))
  )
    .toISOString()
    .slice(0, 10)
}

export function monthKey(dateStr) {
  return dateStr.slice(0, 7)
}

// "2026-08" -> "August 2026". Uses UTC so the label can't slip a month at the
// boundary — these are calendar dates, not instants.
export function formatMonthLabel(dateStr) {
  const [year, month] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

// "2026-08-11" -> "11". The day-number shown in a month cell.
export function dayOfMonth(dateStr) {
  return String(Number(dateStr.slice(8, 10)))
}
