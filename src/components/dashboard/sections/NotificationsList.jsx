import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/Page'
import { useLanguage } from '@/lib/LanguageContext'
import { formatSlotDate } from '@/utils/formatSlotTime'

// A notification's row marker, deliberately NOT DashboardRowIcon.
//
// The Tasks and Notifications cards sit in adjacent grid columns (and directly
// above one another on mobile) and rendered structurally identical rows: same
// circular muted icon, same two-line text block, same outline button on the
// right. Because Tasks updates optimistically it also appeared FASTER than a
// real notification, which is how creating a task came to look like it had
// produced a notification -- the belief that set this whole piece of work off.
//
// So the difference is drawn where the eye actually lands: an unread
// notification gets a filled accent dot and a left border rather than a
// bordered circle, which reads as "something arrived" instead of "something to
// do". The card headers already carry distinct icons and accent colours; this
// makes the ROWS distinguishable too, which is what was missing.
//
// REDESIGN NOTE: the header accent colours that sentence refers to are gone --
// section headers are neutral now. That removes one of the two differentiators
// the paragraph above describes, which makes the row treatment below the only
// one left and therefore load-bearing on its own. It must not be "simplified"
// to match the other lists. The layouts also keep Tasks and Notifications in
// different columns for the same reason.
function UnreadDot() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center" aria-hidden="true">
      <span className="size-2.5 rounded-full bg-primary" />
    </span>
  )
}

export default function NotificationsList({ notifications, onMarkRead }) {
  const { t } = useLanguage()

  if (notifications.length === 0) return <EmptyState>{t('dashboard.noNotifications')}</EmptyState>

  return (
    <ul className="flex flex-col">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className="flex items-start justify-between gap-3 border-b border-l-2 border-border border-l-primary/40 py-3 pl-3 last:border-b-0 last:pb-0"
        >
          {/* items-start, not items-center: a row carrying a two-line body
              would otherwise centre the dot and the button against the whole
              block, leaving them floating beside the middle of the text. */}
          <span className="flex min-w-0 items-start gap-3">
            <UnreadDot />
            <span className="flex min-w-0 flex-col gap-0.5">
              {/* title comes from the notification row itself (migration 0026).
                  Before that the row carried only an enum and a pointer, so
                  this line rendered the literal string "comment". Falls back to
                  the type for rows written before the migration, which have an
                  empty title. */}
              <span className="truncate">{notification.title || notification.type}</span>
              {/* An announcement IS its body -- a student has no broadcasts
                  page to open, so a title-only row would strand the actual
                  message. Clamped to two lines: other types use body as a
                  preview of something reachable elsewhere (a thread, a video),
                  and one long comment should not push the rest of the list
                  off-screen. Absent on pre-0026 rows, which render nothing. */}
              {notification.body && (
                <span className="line-clamp-2 text-sm whitespace-pre-wrap text-muted-foreground">
                  {notification.body}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {notification.actor_name ? `${notification.actor_name} · ` : ''}
                {formatSlotDate(notification.created_at)}
              </span>
            </span>
          </span>
          <Button size="sm" variant="outline" onClick={() => onMarkRead(notification.id)}>
            {t('dashboard.markRead')}
          </Button>
        </li>
      ))}
    </ul>
  )
}
