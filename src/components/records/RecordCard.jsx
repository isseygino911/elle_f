import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// The reference's "Worklist" record card (MASTER.md Source Analysis #3):
// avatar/icon + title + meta line + a status pill, stacked in the dark
// list panel. Selected item gets the lime fill; its pill shifts to a
// harmonious lime-family tone (bg-on-lime/text-lime) per MASTER.md.
//
// Reused by Videos/Surveys (dark list panel, navigable via `to`) and by
// Invitations (light card-list, no navigation target) via `variant`.
//
// `checkbox` (Feature 1: survey multi-delete select mode) is an optional
// `{ checked, onChange }` pair — when present, the card renders a leading
// checkbox, stops navigating via `to` (selecting shouldn't leave the list),
// and uses `checkbox.checked` in place of `selected` for the lime-fill
// treatment, since "checked for a bulk action" is the same "lime = selection"
// meaning MASTER.md already assigns everywhere else.
export default function RecordCard({
  to,
  icon: Icon,
  title,
  meta,
  pillLabel,
  pillVariant,
  selected = false,
  variant = 'dark',
  actions,
  checkbox,
}) {
  const isDark = variant === 'dark'
  const isSelectable = Boolean(checkbox)
  const isChecked = isSelectable ? checkbox.checked : selected
  const Component = isSelectable ? 'div' : to ? Link : 'div'
  const effectivePillVariant = isChecked ? (isDark ? 'onLime' : 'lime') : pillVariant || (isDark ? 'outlineDark' : 'outline')

  return (
    <Component
      {...(!isSelectable && to ? { to } : {})}
      className={cn(
        'flex w-full flex-col gap-2 rounded-md border p-3 text-left transition-colors duration-150',
        isDark
          ? cn(
              'shadow-sm focus-visible:outline-lime',
              isChecked
                ? 'border-transparent bg-lime text-on-lime'
                : 'border-dark-border bg-dark-card text-white hover:bg-dark-card-hover'
            )
          : cn(
              'shadow-sm',
              isChecked ? 'border-transparent bg-lime text-on-lime' : 'border-border bg-card text-card-foreground hover:bg-muted'
            )
      )}
    >
      <span className="flex items-center gap-3">
        {isSelectable && (
          <input
            type="checkbox"
            checked={checkbox.checked}
            onChange={(event) => checkbox.onChange(event.target.checked)}
            aria-label={`Select ${title}`}
            className={cn(
              'size-4 shrink-0 rounded-sm border accent-lime',
              isDark ? 'border-dark-border bg-transparent' : 'border-border bg-transparent'
            )}
          />
        )}
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full',
            isDark ? (isChecked ? 'bg-on-lime/10' : 'bg-dark-border/70') : isChecked ? 'bg-on-lime/10' : 'bg-muted'
          )}
        >
          {Icon && <Icon className="size-4" aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{title}</span>
          {meta && (
            <span
              className={cn(
                'block truncate text-xs',
                isDark ? (isChecked ? 'text-on-lime/70' : 'text-dark-muted') : isChecked ? 'text-on-lime/70' : 'text-muted-foreground'
              )}
            >
              {meta}
            </span>
          )}
        </span>
      </span>
      {(pillLabel || actions) && (
        <span className="flex items-center justify-between gap-2">
          {pillLabel ? <Badge variant={effectivePillVariant}>{pillLabel}</Badge> : <span />}
          {actions && (
            <span className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
              {actions}
            </span>
          )}
        </span>
      )}
    </Component>
  )
}
