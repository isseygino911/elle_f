// Small leading icon avatar shared by the dashboard's row lists — the
// "avatar/icon + label + pill" record-card language applied to the divided-row
// lists rather than rebuilding them as standalone cards.
//
// Notifications deliberately does NOT use this; see the note beside UnreadDot
// in NotificationsList.jsx for why.
export default function DashboardRowIcon({ icon: Icon }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}
