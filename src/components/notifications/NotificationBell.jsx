import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import NotificationsList from '@/components/dashboard/sections/NotificationsList.jsx'
import { useNotifications } from '@/lib/NotificationContext'
import { useLanguage } from '@/lib/LanguageContext'
import { cn } from '@/lib/utils'

// Past this, the badge reads "99+" rather than growing wide enough to shove the
// icon off its own button.
const BADGE_OVERFLOW_AT = 99

// The count itself. Absent at zero rather than rendering "0": a badge exists to
// say something is waiting, and a zero badge is a permanent decoration that
// trains the eye to ignore the thing it is meant to draw it to.
//
// bg-lime via `accent` is the app's established unread-count meaning
// (badge.jsx documents it as exactly that), so this reads the same as every
// other count in the product and follows the tenant accent for free.
//
// Not the Badge component: this is absolutely positioned against the icon
// button and needs a fixed circular footprint, where Badge's padding-driven
// sizing would make a one-digit and a two-digit count different shapes.
function UnreadBadge({ count }) {
  if (count <= 0) return null

  return (
    <span
      className={cn(
        'pointer-events-none absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center',
        'rounded-full bg-lime px-1 font-heading text-[0.625rem] leading-none font-bold text-on-lime',
        'tabular-nums'
      )}
      aria-hidden="true"
    >
      {count > BADGE_OVERFLOW_AT ? `${BADGE_OVERFLOW_AT}+` : count}
    </span>
  )
}

// The shell's notification surface: a bell that carries the live unread count
// and opens a right-hand drawer holding the list.
//
// Lives in the app shell rather than on the dashboard because a notification
// arriving while you are on /courses is exactly the case the old
// dashboard-only card could not serve. `collapsed` matches the sidebar rail's
// own state so the trigger gets a tooltip when the label is hidden, the same
// treatment AccountMenu gives its own trigger.
export default function NotificationBell({ collapsed = false, className }) {
  const { t } = useLanguage()
  const notificationState = useNotifications()

  // Rendered outside the provider (login, invitation accept) there is nothing
  // to count, so the bell does not draw at all rather than drawing an empty
  // one that opens an empty drawer.
  if (!notificationState) return null

  const { notifications, unreadCount, markRead, markAllRead } = notificationState

  const label = unreadCount > 0
    ? `${t('notifications.title')} (${unreadCount} ${t('dashboard.notificationsUnread')})`
    : t('notifications.title')

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      // relative: the badge is positioned against this button's own box.
      className={cn(
        'relative size-8 shrink-0 text-dark-muted hover:bg-dark-card-hover hover:text-white',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime',
        className
      )}
      aria-label={label}
    >
      <Bell className="size-4.5" aria-hidden="true" />
      <UnreadBadge count={unreadCount} />
    </Button>
  )

  return (
    <Sheet>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger render={<SheetTrigger render={trigger} />} />
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ) : (
        <SheetTrigger render={trigger} />
      )}

      {/* Wider than the primitive's nav-sized w-72, and on the app's own card
          surface rather than the sidebar's dark wash: this holds content, not
          navigation. Set at the call site, never in ui/sheet.jsx -- the
          convention AppShell's own mobile nav established, keeping the
          primitive generic. */}
      <SheetContent
        side="right"
        className="w-[24rem] max-w-[90vw] gap-0 border-l-border bg-background p-0 text-foreground"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <SheetTitle className="font-heading text-base font-bold">{t('notifications.title')}</SheetTitle>
          <div className="flex items-center gap-1">
            {/* Only offered when there is something to clear, and wired to
                PATCH /notifications/read-all -- which has existed server-side
                all along with no caller until now. */}
            {unreadCount > 0 && (
              <Button type="button" size="sm" variant="ghost" onClick={markAllRead}>
                {t('notifications.markAllRead')}
              </Button>
            )}
            <SheetClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label={t('notifications.close')}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              }
            />
          </div>
        </div>

        <SheetDescription className="sr-only">{t('notifications.description')}</SheetDescription>

        {/* NotificationsList unchanged, dot-and-left-border treatment intact --
            its own header comment records that the row styling is the only
            remaining thing distinguishing a notification from a task, and must
            not be restyled to match neighbouring lists. */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-4 py-2">
            <NotificationsList notifications={notifications} onMarkRead={markRead} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
