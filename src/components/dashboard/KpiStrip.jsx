import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

// The dashboard's at-a-glance layer: the handful of numbers that answer
// "what is the state of my day" before you read a single list.
//
// WHY N CARDS AND NOT ONE CONTAINER
//
// This component used to render one flat surface with hairline dividers. The
// reason recorded here was that "a shadow on each of several ADJACENT cells
// reads as several separate floating objects" -- true, and the fix it chose
// (collapse them into one panel) was the wrong one. The actual fault was
// adjacency, not elevation: tiles flush against each other with a shadow on
// each do fragment. Separate them by a real gap and the same three cards read
// as three deliberate objects, which is what a KPI row is.
//
// The flat strip's cost was that the numbers -- the most scannable thing on
// the dashboard -- carried the least visual weight on the page. Each cell is
// now its own card: elevated, gapped, with the figure at display size and the
// icon in a tinted tile. Shadow is no longer "reserved" for actionable cards;
// it marks a discrete object, which these are.
//
// This component is deliberately PRESENTATIONAL and knows nothing about
// roles. Each role's dashboard builds its own array of cells and passes it
// in. That is what keeps the manager's privacy boundary structural rather
// than a conditional inside here: a manager's cells are built from aggregate
// totals only, so no student-bearing field can reach this component at all.

// A count that means "you owe someone something" reads differently from one
// that is merely a fact. `attention` marks the former: at zero it goes quiet
// like any other cell, and above zero it earns the lime dot. `students` or
// `sessions` are facts -- they never take a dot, because a large roster is
// not a problem to be cleared.
function KpiCell({ icon: Icon, label, value, to, attention }) {
  const isZero = !value
  const showDot = Boolean(attention) && !isZero

  const body = (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase"
            title={label}
          >
            {label}
          </span>
          {showDot && (
            // Decorative: the count beside it already carries the meaning, so
            // color is reinforcing rather than the sole signal.
            <span className="size-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
          )}
        </span>
        {/* The icon moves into a tinted tile on the trailing edge. Inline
            beside the label it competed with the text for the row; parked
            here it reads as the cell's mark and leaves the label its width. */}
        {Icon && (
          <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          </span>
        )}
      </span>
      {/* Muted at zero. The figure itself still reads as "0", so this is a
          second channel on top of the text, never a replacement for it. */}
      <span
        className={cn(
          'font-heading text-3xl leading-tight font-extrabold tabular-nums',
          isZero ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {value ?? 0}
      </span>
    </>
  )

  // Each cell is its own card now: border + shadow + its own radius, with the
  // gap between them supplied by the parent grid.
  const cellClass =
    'flex min-h-24 flex-col justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-md'

  if (!to) {
    return <div className={cellClass}>{body}</div>
  }

  return (
    <Link
      to={to}
      className={cn(
        cellClass,
        // bg-accent is the registered utility for --color-surface-2.
        'transition-shadow transition-colors hover:bg-accent hover:shadow-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none'
      )}
    >
      {body}
    </Link>
  )
}

// `cells` is an array of { key, icon, label, value, to?, attention? }.
// Columns are driven by cell count so a three-cell student strip does not
// inherit a four-column rhythm and leave a gap.
export default function KpiStrip({ cells, label }) {
  const columnsClass = cells.length <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'

  return (
    <section
      aria-label={label}
      // The gap is what makes separate elevated cards work -- see the note at
      // the top of this file. Without it they would be the flush, fragmented
      // row the old comment rightly warned about.
      className={cn('grid grid-cols-2 gap-4', columnsClass)}
    >
      {cells.map((cell) => (
        <KpiCell
          key={cell.key}
          icon={cell.icon}
          label={cell.label}
          value={cell.value}
          to={cell.to}
          attention={cell.attention}
        />
      ))}
    </section>
  )
}
