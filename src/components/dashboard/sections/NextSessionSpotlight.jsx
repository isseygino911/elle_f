import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/LanguageContext'
import { formatSlotDate, formatSlotTime } from '@/utils/formatSlotTime'
import { JoinClassLink } from '@/components/BookingList'

// The single soonest upcoming booking, pulled out above everything else.
//
// This is the one place on the dashboard that still uses a solid accent
// fill, and it keeps it deliberately: it is a single hero moment rather than
// one of six competing bands, so the colour marks genuine primacy instead of
// decorating a category. Only rendered when a next booking exists -- no empty
// hero tile.
export default function NextSessionSpotlight({ booking, showStudent, onCancelBooking }) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-md bg-lime p-5 text-on-lime shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="m-0 text-sm font-medium opacity-80">{t('dashboard.nextSession')}</p>
        <p className="m-0 font-heading text-xl leading-tight font-extrabold">
          {formatSlotDate(booking.scheduled_at)} · {formatSlotTime(booking.scheduled_at)}
        </p>
        {showStudent && <p className="m-0 text-sm opacity-80">{booking.student_name}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {booking.joinable && <JoinClassLink bookingId={booking.id} size="default" />}
        <Button
          size="sm"
          variant="outline"
          className="border-on-lime/30 bg-transparent text-on-lime hover:bg-on-lime/10"
          onClick={() => onCancelBooking(booking.id)}
        >
          {t('dashboard.cancel')}
        </Button>
      </div>
    </div>
  )
}
