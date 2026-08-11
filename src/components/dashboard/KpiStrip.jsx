import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

// The dashboard's at-a-glance layer: the handful of numbers that answer
// "what is the state of my day" before you read a single list.
//
// WHY ONE CONTAINER AND NOT N CARDS
//
// The previous manager dashboard rendered each figure as its own bordered,
// shadowed tile. A shadow on each of several adjacent cells reads as several
// separate floating objects, so the eye has to first work out whether they
// are related at all. These numbers are facets of one panel, not independent
// records, so they share a single flat surface and are separated by hairlines
// instead. Shadow is reserved for cards you can act on individually (the list
// sections below, the next-session spotlight) -- see the elevation note in
// the dashboard plan.
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
      <span className="flex items-center gap-1.5">
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        <span className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase" title={label}>
          {label}
        </span>
        {showDot && (
          // Decorative: the count beside it already carries the meaning, so
          // color is reinforcing rather than the sole signal.
          <span className="size-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
        )}
      </span>
      {/* Muted at zero. The figure itself still reads as "0", so this is a
          second channel on top of the text, never a replacement for it. */}
      <span
        className={cn(
          'font-heading text-2xl leading-tight font-extrabold tabular-nums',
          isZero ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {value ?? 0}
      </span>
    </>
  )

  // min-h-16 keeps the cell above the 44px touch-target floor even when a
  // label wraps short; py-2.5 alone would not guarantee it.
  const cellClass = 'flex min-h-16 flex-col justify-center gap-1 px-3 py-2.5'

  if (!to) {
    return <div className={cellClass}>{body}</div>
  }

  return (
    <Link
      to={to}
      className={cn(
        cellClass,
        // bg-accent is the registered utility for --color-surface-2.
        'transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none'
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
      className={cn(
        'grid grid-cols-2 overflow-hidden rounded-md border border-border bg-card',
        // Hairlines between cells rather than around them. divide-y is needed
        // for the 2-col mobile stack; divide-y is cleared once the strip is a
        // single row.
        'divide-x divide-y divide-border sm:divide-y-0',
        columnsClass
      )}
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
