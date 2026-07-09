import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/Page'
import { formatSlotDate, formatSlotTime } from '@/utils/formatSlotTime.js'

// Shared "Join Class" CTA — the same join-eligibility affordance used by
// booking list rows and the dashboard's next-session spotlight, so the
// button styling (and route) only lives in one place. `className` lets
// callers rendering this on a dark surface (the Bookings page's dark list
// panel) swap in a visible-on-dark focus ring, since buttonVariants' default
// focus ring is tuned for light surfaces.
export function JoinClassLink({ bookingId, size = 'sm', className }) {
  return (
    <Link to={`/bookings/${bookingId}/call`} className={cn(buttonVariants({ size }), className)}>
      Join Class
    </Link>
  )
}

// Shared "upcoming bookings" list — same row shape used by the dashboard
// summary and the booking calendar's own-bookings section, just with/without
// the date prefix and student name.
export default function BookingList({ bookings, showDate = false, showStudent = false, onCancel, emptyMessage = 'No upcoming bookings.' }) {
  if (bookings.length === 0) return <EmptyState>{emptyMessage}</EmptyState>

  return (
    <ul className="flex flex-col">
      {bookings.map((booking) => (
        <li key={booking.id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span>
              {showDate && `${formatSlotDate(booking.scheduled_at)} `}
              {formatSlotTime(booking.scheduled_at)}
            </span>
            {showStudent && <span className="text-sm text-muted-foreground">{booking.student_name}</span>}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {booking.joinable && <JoinClassLink bookingId={booking.id} />}
            <Button size="sm" variant="outline" onClick={() => onCancel(booking.id)}>
              Cancel
            </Button>
          </span>
        </li>
      ))}
    </ul>
  )
}
