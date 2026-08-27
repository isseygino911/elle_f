import { useEffect, useState } from 'react'
import { canManageStudents, isOwner } from '../../lib/roles.js'
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
import { useAdmins } from '../../hooks/useAdmins.js'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import StudentSelect from '@/components/StudentSelect'
import TeacherSelect from '@/components/TeacherSelect'
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

  // Only an owner picks a calendar. A teacher acts on their own and a student
  // on their teacher's, both resolved server-side from identity alone — so for
  // them `calendarAdminId` stays undefined and no admin_id is ever sent.
  const ownerPicksTeacher = isOwner(user)
  const { admins, status: adminsStatus, error: adminsError } = useAdmins(accessToken, {
    enabled: ownerPicksTeacher,
  })
  const [selectedAdminId, setSelectedAdminId] = useState('')
  const calendarAdminId = ownerPicksTeacher ? selectedAdminId : undefined

  // Default to the first teacher so the page lands on a working calendar
  // rather than an empty prompt. Only fills a blank choice, so it never
  // overrides a teacher the owner picked themselves.
  useEffect(() => {
    if (!ownerPicksTeacher) return
    if (selectedAdminId) return
    if (admins.length === 0) return
    setSelectedAdminId(String(admins[0].id))
  }, [ownerPicksTeacher, admins, selectedAdminId])

  // An owner with no teacher chosen yet has nothing to fetch. Without this the
  // page fired every scheduling request unscoped and painted the resolver's
  // raw "admin_id is required" where the slots and calendar belong.
  const calendarReady = !ownerPicksTeacher || Boolean(selectedAdminId)

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
    return listOpenSlots(accessToken, selectedDate, calendarAdminId)
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
    if (!calendarReady) return undefined
    let cancelled = false
    loadSlots(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [accessToken, selectedDate, calendarAdminId, calendarReady])

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
  // Bookings has no per-item detail route (unlike Videos) — a
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

            {/* Owner-only, and above the student picker: which teacher's
                calendar this is has to be settled before "which slot" or
                "for which student" means anything. */}
            {ownerPicksTeacher && (
              <Field className="max-w-sm">
                <FieldLabel htmlFor="booking-teacher-id">{t('bookings.teacher')}</FieldLabel>
                <TeacherSelect
                  id="booking-teacher-id"
                  value={selectedAdminId}
                  onChange={setSelectedAdminId}
                  admins={admins}
                  status={adminsStatus}
                />
                <FieldDescription>
                  {adminsStatus === 'success' && admins.length === 0
                    ? t('bookings.noTeachers')
                    : t('bookings.teacherHint')}
                </FieldDescription>
                {adminsStatus === 'error' && <FieldDescription>{adminsError}</FieldDescription>}
              </Field>
            )}

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
            {!calendarReady && <EmptyState>{t('bookings.pickTeacher')}</EmptyState>}
            {calendarReady && slotsStatus === 'loading' && <LoadingText>Loading slots...</LoadingText>}
            {calendarReady && slotsStatus === 'error' && <ErrorAlert>{slotsError}</ErrorAlert>}
            {calendarReady && slotsStatus === 'success' && slots.length === 0 && (
              <EmptyState>No open slots for this day.</EmptyState>
            )}
            {calendarReady && slotsStatus === 'success' && slots.length > 0 && (
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

          {isElle && calendarReady && (
            // Keyed on the teacher so switching rebuilds the calendar from
            // scratch rather than briefly showing the previous teacher's
            // windows under the new one's heading.
            <AvailabilityCalendar
              key={calendarAdminId || 'self'}
              accessToken={accessToken}
              adminId={calendarAdminId}
            />
          )}
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
