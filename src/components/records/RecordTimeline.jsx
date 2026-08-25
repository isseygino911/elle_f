import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatBookingMonthKey, formatBookingMonthLabel, formatBookingDayParts } from '@/utils/formatSlotTime'

// The shared record vocabulary for detail panes: a frosted panel, grouped
// sections, and tonal rail entries. Used by StudentDetailPage (four tabbed
// collections) and CourseDetailPage (homework and roster).
//
// These began as private functions inside StudentDetailPage and were promoted
// here when the course page became the second caller. The comments below
// describe geometry that is not obvious from the class strings -- the rail
// line's anchoring, the opacity ladder, why tone carries the hierarchy -- and
// are load-bearing documentation rather than narration.

// The frosted panel a collection sits on.
//
// `className` lets a caller override the corner rounding. The default
// rounds the BOTTOM only, for the folder join: a tab strip overlaps this
// panel's top edge and supplies the rounding on its own top corners, so
// rounding here too would bite a visible notch out of the join. A caller with
// no tab strip above it passes `rounded-lg` to round all four.
//
// shadow-md against the rows' shadow-sm keeps the nesting reading as
// container-then-cards. ring-foreground/5 is the soft inner glow -- dialog.jsx
// uses /10 for the same trick, halved here because this ring sits on an
// already-translucent surface where /10 reads as a second border.
//
// The ring is dropped from the top edge (ring-inset would trace the seam an
// active tab just erased); the border does the same job on the three sides
// that still need an outline.
export function GlassPanel({ children, className }) {
  return (
    <div
      className={cn(
        'rounded-b-lg border border-border/60 bg-card/70 p-3 shadow-md ring-1 ring-foreground/5 supports-backdrop-filter:bg-card/50 supports-backdrop-filter:backdrop-blur-xs sm:p-4',
        className
      )}
    >
      {children}
    </div>
  )
}

// A group of records under one header -- a month for dated collections, a
// status band for the others.
//
// The meta count rides in the header rather than in a separate stat band, for
// the same reason a tab strip carries collection counts: same information, no
// extra vertical furniture competing with the content. `meta` accepts a node
// as well as a string, so a caller can hang a small action off the header.
export function RecordGroup({ label, meta, children }) {
  return (
    <section className="flex flex-col gap-1">
      <header className="flex items-baseline justify-between gap-3 border-b border-border/40 px-1 pb-1.5">
        <h3 className="text-sm font-semibold">{label}</h3>
        {meta && <span className="text-muted-foreground text-xs tabular-nums">{meta}</span>}
      </header>
      <ul className="flex flex-col">{children}</ul>
    </section>
  )
}

// One record on the rail.
//
// TONE IS THE HIERARCHY. Three tones, three weights:
//   'accent'  -- solid accent node, full opacity. The records that still want
//                something: an upcoming session, an unsubmitted assignment.
//   'muted'   -- filled grey node, full opacity. Real, but settled.
//   'dimmed'  -- recessive (opacity-60), hollow node, title struck through.
//                Cancelled sessions and archived courses: auditable, no
//                longer competing for attention.
//
// `lead` is the fixed-width left column: a weekday/day stack for dated
// records, an avatar for people, and nothing at all for records whose date is
// not the point. Keeping it fixed-width is what holds the titles aligned down
// a group.
//
// `trailing` is a slot after the badge for a per-row control. A row with
// `trailing` must NOT also pass `to`: the linked branch wraps everything in an
// <a>, and a nested <button> there is invalid HTML.
// `below` is an optional third line inside the title block, under the meta
// line -- for a progress bar or anything else that should inherit the title's
// width rather than claim a column of its own. It sits inside the min-w-0
// flex-1 span deliberately: a sibling column would take width from the name,
// which is the scarce resource in a narrow rail.
export function RecordEntry({ tone = 'muted', lead, title, meta, badge, to, trailing, below }) {
  const dimmed = tone === 'dimmed'

  const inner = (
    <>
      {/* The rail: a node plus the connecting line running down to the next
          entry's node.

          The line is anchored to the NODE (top-3.5, just under the node's own
          centre) rather than to the row's midpoint, and -bottom-6 carries it
          through the gap py-2 opens between rows. Anchoring it to the row
          instead leaves a stub floating between two nodes it never touches --
          the node is top-aligned via mt-1.5, so the row's centre sits well
          below it. group-last/entry:hidden drops the trailing line so the rail
          ends ON the final node instead of dangling past it. */}
      <span className="relative flex w-3 shrink-0 justify-center self-stretch">
        <span
          aria-hidden="true"
          className="absolute top-3.5 -bottom-6 left-1/2 w-px -translate-x-1/2 bg-border/60 group-last/entry:hidden"
        />
        <span
          aria-hidden="true"
          className={cn(
            'relative z-10 mt-1.5 size-2 shrink-0 rounded-full',
            tone === 'accent' && 'bg-lime',
            tone === 'muted' && 'bg-muted-foreground/50',
            dimmed && 'border border-border bg-card'
          )}
        />
      </span>

      {lead}

      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-sm font-medium', dimmed && 'line-through')}>
          {title}
        </span>
        {meta && <span className="text-muted-foreground block truncate text-xs">{meta}</span>}
        {below && <span className="mt-1.5 block">{below}</span>}
      </span>

      {badge}
      {trailing}
    </>
  )

  // A row links out only when there is somewhere to go. A booking has no
  // detail page of its own, so it stays inert rather than pointing at a route
  // that would 404 -- and only the linked ones take the stronger hover.
  const className = cn(
    'group/entry flex items-center gap-3 rounded-md px-1 py-2 transition-colors',
    dimmed && 'opacity-60'
  )

  return to ? (
    <li>
      <Link to={to} className={cn(className, 'hover:bg-card')}>
        {inner}
      </Link>
    </li>
  ) : (
    // Hover on an inert row is a readability aid, not an affordance, so the
    // fill stays subtle rather than implying somewhere to click.
    <li className={cn(className, 'hover:bg-card/60')}>{inner}</li>
  )
}

// The weekday/day stack used as `lead` by every dated record. Fixed width so
// single- and double-digit days stay aligned down a group.
export function DateLead({ iso }) {
  const { weekday, day } = formatBookingDayParts(iso)
  return (
    <span className="w-9 shrink-0 text-center">
      <span className="text-muted-foreground block text-[0.6875rem] leading-tight uppercase">
        {weekday}
      </span>
      <span className="block text-base leading-tight font-semibold tabular-nums">{day}</span>
    </span>
  )
}

// Buckets dated records into consecutive months.
//
// The backend already returns bookings ORDER BY scheduled_at ASC, so entries
// arrive chronological and only the group keys need sorting -- which a Map
// preserves by insertion for free. Keyed on the EASTERN month
// (formatBookingMonthKey), never on sliced UTC digits: a session at 02:00Z on
// the 1st is still the previous month in Eastern time and belongs under the
// previous header.
export function groupByMonth(records, getDate) {
  const groups = new Map()
  for (const record of records) {
    const iso = getDate(record)
    const key = formatBookingMonthKey(iso)
    if (!groups.has(key)) {
      groups.set(key, { key, label: formatBookingMonthLabel(iso), records: [] })
    }
    groups.get(key).records.push(record)
  }
  return [...groups.values()]
}

// Buckets records into named bands (active/archived, submitted/not started).
// `bands` is an ordered [{ key, label, match }] list; empty bands are dropped
// so a panel never shows a header with nothing under it.
export function groupByBand(records, bands) {
  return bands
    .map((band) => ({ ...band, records: records.filter(band.match) }))
    .filter((band) => band.records.length > 0)
}
