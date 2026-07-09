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
