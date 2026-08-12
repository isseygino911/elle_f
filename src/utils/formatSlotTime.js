// THE ONLY place in this app that turns a timestamp/time value into a
// human-displayed string. Every component that shows a slot's time, a
// booking's scheduled_at, or an availability window's start/end time MUST
// call one of the functions in this file -- never format a date/time
// inline anywhere else in the booking UI.
//
// The timezone model (as of the backend's real-timezone migration):
// - Elle's availability lives in America/New_York (Eastern Time, DST-aware).
//   The `availability` table's start_time/end_time columns are bare
//   Eastern wall-clock strings ("HH:MM:SS") with no date/instant attached.
// - Bookings/slots are full UTC ISO instants ("...Z"), as always -- they
//   just now get interpreted against the Eastern calendar server-side
//   (e.g. the open-slots `date` query param means an Eastern calendar day).
// - Every displayed instant also shows a converted China Time
//   (Asia/Shanghai, UTC+8, no DST) label alongside the Eastern time, since
//   that's the other timezone relevant to this app's users.
//
// This file has three entry points, one per input shape call sites
// actually have on hand:
//   - formatSlotTime: a full UTC ISO instant -> Eastern + China time.
//   - formatSlotDate: a full UTC ISO instant (-> Eastern calendar date) OR
//     a bare YYYY-MM-DD string that is already an Eastern calendar date
//     (passthrough).
//   - formatEasternWallClockTime: a bare "HH:MM:SS" Eastern wall-clock
//     time with no date/instant context at all (availability windows) --
//     this is NOT run through any UTC/timezone conversion, because there
//     is no instant to convert.
// No other file should format a date/time inline; add a new function here
// instead if a new input shape shows up.
//
// A fourth group serves GROUPED/SECTIONED display rather than a single
// timestamp -- formatBookingMonthKey/Label and formatBookingDayParts, used by
// the student detail page's bookings timeline to bucket sessions by month and
// label each entry's node. They live here for the same reason as everything
// above: they decide which Eastern calendar day/month an instant falls in, and
// that decision must not be made by slicing UTC digits at a call site.

const EASTERN_TIME_ZONE = 'America/New_York'
const CHINA_TIME_ZONE = 'Asia/Shanghai'

const timeFormatterCache = new Map()
function getTimeFormatter(timeZone) {
  if (!timeFormatterCache.has(timeZone)) {
    timeFormatterCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    )
  }
  return timeFormatterCache.get(timeZone)
}

const dateFormatterCache = new Map()
function getDateFormatter(timeZone) {
  if (!dateFormatterCache.has(timeZone)) {
    dateFormatterCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        month: 'numeric',
        day: 'numeric',
      })
    )
  }
  return dateFormatterCache.get(timeZone)
}

const easternCalendarDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: EASTERN_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// isoUtcString: a full UTC ISO instant, e.g. "2026-07-13T21:43:00.000Z".
// Renders both the Eastern time and the China time for that instant, e.g.
// "5:43 PM ET / 5:43 AM (7/14) China" -- the China-side date is only shown
// when it differs from the Eastern-side date for that same instant.
export function formatSlotTime(isoUtcString) {
  const date = new Date(isoUtcString)
  if (Number.isNaN(date.getTime())) return isoUtcString

  const easternTime = getTimeFormatter(EASTERN_TIME_ZONE).format(date)
  const chinaTime = getTimeFormatter(CHINA_TIME_ZONE).format(date)

  const easternDateLabel = getDateFormatter(EASTERN_TIME_ZONE).format(date)
  const chinaDateLabel = getDateFormatter(CHINA_TIME_ZONE).format(date)
  const chinaSuffix = chinaDateLabel !== easternDateLabel ? ` (${chinaDateLabel})` : ''

  return `${easternTime} ET / ${chinaTime}${chinaSuffix} China`
}

// isoUtcStringOrYyyyMmDd: either a full UTC ISO instant
// ("2026-07-13T09:00:00.000Z") or a bare YYYY-MM-DD string that is already
// an Eastern calendar date (per the backend's timezone model). A full
// instant is converted to its Eastern calendar date for display, since a
// booking near Eastern midnight could otherwise show the wrong day if the
// raw UTC date digits were sliced instead.
export function formatSlotDate(isoUtcStringOrYyyyMmDd) {
  if (!/T/.test(isoUtcStringOrYyyyMmDd)) {
    const match = isoUtcStringOrYyyyMmDd.match(/^\d{4}-\d{2}-\d{2}/)
    return match ? match[0] : isoUtcStringOrYyyyMmDd
  }

  const date = new Date(isoUtcStringOrYyyyMmDd)
  if (Number.isNaN(date.getTime())) return isoUtcStringOrYyyyMmDd
  return easternCalendarDateFormatter.format(date)
}

// isoUtcString: a full UTC ISO instant. Renders the Eastern calendar date and
// time together, e.g. "2026-08-11 5:43 PM".
//
// Single-timezone on purpose, unlike formatSlotTime: a booking is an
// appointment two people in different countries have to agree on, so it earns
// the dual ET/China rendering. A chat timestamp is a "when was this said"
// marker repeated beside every bubble in the thread, and the dual form would
// be longer than most of the messages it annotates.
export function formatMessageTimestamp(isoUtcString) {
  const date = new Date(isoUtcString)
  if (Number.isNaN(date.getTime())) return isoUtcString

  return `${easternCalendarDateFormatter.format(date)} ${getTimeFormatter(EASTERN_TIME_ZONE).format(date)}`
}

// hhmmss: a bare Eastern wall-clock time with no date/instant attached,
// e.g. "17:43:00" (as stored in the availability table). Parsed directly
// as hour/minute -- no Date object, no Intl timezone conversion -- and
// labeled "ET" so it reads unambiguously next to the dual-timezone slot
// times shown elsewhere on the same page.
export function formatEasternWallClockTime(hhmmss) {
  const match = hhmmss.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return hhmmss

  const hour24 = Number(match[1])
  const minute = match[2]
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12

  return `${hour12}:${minute} ${period} ET`
}

// ---------------------------------------------------------------------------
// Grouped display helpers (bookings timeline)
// ---------------------------------------------------------------------------

// Both input shapes -> a Date safely inside the intended EASTERN calendar day.
//
// A bare "2026-07-06" parses as UTC midnight, which is 8pm on the 5th in
// Eastern time -- so grouping or labelling it directly lands a full day early.
// Anchoring the bare form at noon keeps it inside the right Eastern day at any
// DST offset. A full instant already carries a time-of-day and is left exactly
// as it is.
function toEasternAnchoredDate(isoUtcStringOrYyyyMmDd) {
  const bare = !/T/.test(isoUtcStringOrYyyyMmDd)
  return new Date(bare ? `${isoUtcStringOrYyyyMmDd}T12:00:00` : isoUtcStringOrYyyyMmDd)
}

const monthLabelFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: EASTERN_TIME_ZONE,
  year: 'numeric',
  month: 'long',
})

const dayPartsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: EASTERN_TIME_ZONE,
  weekday: 'short',
  day: 'numeric',
})

// isoUtcString: a full UTC ISO instant. Returns a sortable "YYYY-MM" bucket
// key for the EASTERN calendar month that instant falls in, e.g. "2026-07".
//
// Eastern-anchored rather than sliced off the raw ISO string: a booking at
// 2026-08-01T02:00:00Z is still July 31st in Eastern time, and slicing the UTC
// digits would file it under August -- putting one session in a month header
// its neighbours disagree with. Built off the same en-CA YYYY-MM-DD formatter
// formatSlotDate uses, so both agree on which day an instant belongs to.
export function formatBookingMonthKey(isoUtcStringOrYyyyMmDd) {
  const date = toEasternAnchoredDate(isoUtcStringOrYyyyMmDd)
  if (Number.isNaN(date.getTime())) return ''
  return easternCalendarDateFormatter.format(date).slice(0, 7)
}

// isoUtcString: a full UTC ISO instant -> the display label for its Eastern
// calendar month, e.g. "July 2026". Pairs with formatBookingMonthKey: the key
// sorts, this labels.
export function formatBookingMonthLabel(isoUtcStringOrYyyyMmDd) {
  const date = toEasternAnchoredDate(isoUtcStringOrYyyyMmDd)
  if (Number.isNaN(date.getTime())) return isoUtcStringOrYyyyMmDd
  return monthLabelFormatter.format(date)
}

// isoUtcStringOrYyyyMmDd: a full UTC ISO instant, or a bare YYYY-MM-DD that is
// already an Eastern calendar date (an assignment's due_date is a DATE column
// with no time-of-day). Returns { weekday: "Mon", day: "6" } for the Eastern
// calendar day, used by the timeline's per-entry date column.
//
// THE BARE-DATE BRANCH IS NOT OPTIONAL. `new Date("2026-07-06")` parses as UTC
// midnight, which is 8pm on the 5th in Eastern time -- so a due date of the
// 6th would render "Sun 5", off by a full day. Anchoring the bare form at noon
// puts it safely inside the Eastern day regardless of DST offset. Instants
// keep their exact parse, since they carry a real time-of-day.
export function formatBookingDayParts(isoUtcStringOrYyyyMmDd) {
  const date = toEasternAnchoredDate(isoUtcStringOrYyyyMmDd)
  if (Number.isNaN(date.getTime())) return { weekday: '', day: '' }

  const parts = dayPartsFormatter.formatToParts(date)
  const find = (type) => parts.find((part) => part.type === type)?.value ?? ''
  return { weekday: find('weekday'), day: find('day') }
}

// durationSec: a video's length in seconds -> "4 min" / "1 hr 12 min", or an
// empty string when the duration is unknown (null for a video still
// processing). Lives here with the other duration/time renderers rather than
// being inlined at the one call site that needs it.
export function formatVideoDuration(durationSec) {
  if (durationSec === null || durationSec === undefined) return ''

  const totalMinutes = Math.max(1, Math.round(durationSec / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`
}
