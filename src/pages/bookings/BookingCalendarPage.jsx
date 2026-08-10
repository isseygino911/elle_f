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
} from '../../api/client.js'
import { formatSlotTime, formatSlotDate } from '../../utils/formatSlotTime.js'
// The open-slots `date` query param means an Eastern calendar date (per the
// backend's timezone model), so "today" for the date picker must be computed
// in Eastern terms too, not the browser's UTC/local terms. These live in
// utils/calendarDates.js now, shared with the week/month calendar.
import { todayEasternDate, shiftDate } from '../../utils/calendarDates.js'
import { useStudents } from '../../hooks/useStudents.js'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import StudentSelect from '@/components/StudentSelect'
import { JoinClassLink } from '@/components/BookingList'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'
import InsightCard from '@/components/records/InsightCard'
import AvailabilityCalendar from './AvailabilityCalendar.jsx'

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

          {isElle && <AvailabilityCalendar accessToken={accessToken} />}
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
