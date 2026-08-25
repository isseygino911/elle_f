import { cn } from '@/lib/utils'

// A chart-shaped slot on the dashboard.
//
// Phase 1 ships the dashboard's structure without any trend charts, because
// no time-series data exists yet -- every figure the API returns is a
// point-in-time COUNT, and producing a trend needs new bucketed queries. This
// component holds the space those charts will occupy.
//
// THREE RULES THIS COMPONENT EXISTS TO ENFORCE
//
// 1. It carries the FINAL section title, not "Coming soon". The section is
//    permanent structure; only its body is pending. A placeholder that
//    announces itself as a placeholder reads as an unfinished page.
// 2. It reserves the same aspect ratio the real chart will use, so nothing
//    below it reflows on the day the chart lands.
// 3. It is NOT a Skeleton. A skeleton means "loading, back in a moment",
//    which would be a lie about something that is weeks away. Skeletons are
//    still correct for the real fetch -- see `pending` below.
//
// When a chart does ship, `children` carries it and the placeholder body is
// simply not rendered. The frame itself does not change, which is the point.

// A static, muted, chart-shaped glyph. Deliberately not real data and not an
// animated shimmer: an empty white rectangle with one line of text in it
// reads as broken, whereas a shape reads as "something goes here".
function ChartGlyph() {
  return (
    <svg
      viewBox="0 0 64 32"
      className="h-12 w-24 text-muted-foreground/40"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points="2,26 14,18 26,22 38,10 50,14 62,4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ChartFrame({ title, message, aspect = 'aspect-[16/10]', children, className }) {
  return (
    <section className={cn('flex flex-col gap-3 rounded-md border border-border bg-card p-4', className)}>
      <h2 className="m-0 text-base leading-snug font-medium">{title}</h2>
      {children ? (
        children
      ) : (
        <div
          className={cn(
            // max-h caps the reserved block. Rule 2 above keeps the aspect
            // ratio so the real chart lands without reflow, but an aspect
            // ratio alone scales with WIDTH: on a full-width dashboard panel
            // 16/10 reserves ~1000px of empty cream and pushes every section
            // below it off the screen. The cap only ever binds on the empty
            // state -- a real chart passes `children` and never reaches here.
            'flex max-h-56 w-full flex-col items-center justify-center gap-3 rounded-sm bg-background p-4 text-center',
            aspect
          )}
        >
          <ChartGlyph />
          <p className="m-0 max-w-xs text-sm text-muted-foreground">{message}</p>
        </div>
      )}
    </section>
  )
}
