import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Every dashboard list section shares this shape: a Card with a real <h2>
// title (CardTitle renders a <div>, which would drop it from screen-reader
// heading navigation) plus CardContent.
//
// WHY THERE IS NO LONGER AN ACCENT COLOR HERE
//
// This card used to fill its header band with one of three tag colors,
// cycled by index from a shared palette. That was decoration wearing the
// clothes of meaning: the indices were hardcoded per call site, so
// Notifications, Homework due and Unread messages all came out the same
// coral for no reason anyone could state. Six solid bands also flattened the
// page -- when every section shouts, none of them does.
//
// Sections are now neutral and are told apart by their icon, their position
// (the action column versus the awareness rail) and their count. Color has
// moved to where it can carry a fact: a badge on a row. See the color rules
// in the dashboard plan.
//
// The contrast finding that shaped the old design is worth keeping even
// though the fills are gone, because it is the reason not to put them back
// casually: text-muted-foreground fails contrast against all three of those
// tag fills, which is why color was confined to the header band and never
// allowed into the list body. Anything that reintroduces a colored surface
// here has to re-verify that pairing.
export default function SectionCard({ title, icon: Icon, actions, children }) {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
            <h2 className="m-0 truncate text-base leading-snug font-medium">{title}</h2>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  )
}

// Loose approximation of a SectionCard's shape for the loading state — not
// pixel-perfect, just enough that the grid doesn't look broken while the
// dashboard fetch is in flight.
export function SectionCardSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-3">
        <Skeleton className="h-5 w-1/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </CardContent>
    </Card>
  )
}
