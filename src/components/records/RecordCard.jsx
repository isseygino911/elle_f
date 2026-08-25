import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// The reference's "Worklist" record card (MASTER.md Source Analysis #3):
// avatar/icon + title + meta line + a status pill, stacked in the dark
// list panel. Selected item gets the lime fill; its pill shifts to a
// harmonious lime-family tone (bg-on-lime/text-lime) per MASTER.md.
//
// Reused by Videos (dark list panel, navigable via `to`) and by
// Invitations (light card-list, no navigation target) via `variant`.
// `metrics` is an optional array of { icon, value, label } rendered as small
// icon+number chips in the bottom row beside the status pill.
//
// It exists so a row's countable facts stop being concatenated into the meta
// string. "42 enrolled · Jane Doe" puts two unrelated facts on one truncating
// line, and the number -- the thing you scan a list for -- is the half that
// gets cut. As chips they align down the column and the meta line goes back to
// carrying one fact.
//
// `label` is for assistive tech only; the icon carries the meaning visually.
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
  metrics,
  imageUrl,
}) {
  // Reset on URL change: a replaced image gets a fresh UUID key, and a new
  // presigned URL, so a previous failure says nothing about the new one. Same
  // reasoning as BrandMark's effect on logoUrl.
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => {
    setImageFailed(false)
  }, [imageUrl])

  const isDark = variant === 'dark'
  const isChecked = selected
  const Component = to ? Link : 'div'
  const effectivePillVariant = isChecked ? (isDark ? 'onLime' : 'lime') : pillVariant || (isDark ? 'outlineDark' : 'outline')

  return (
    <Component
      {...(to ? { to } : {})}
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
        {/* A cover image when the record has one, the status icon when it does
            not. Square and rounded-md rather than the icon's circle: a
            photograph cropped to a circle loses its corners, and the two
            shapes read as "this record has its own picture" versus "this is
            the generic mark for its kind".
            imageFailed degrades to the icon rather than a broken-image glyph,
            the same way BrandMark handles a lapsed logo URL -- these are
            presigned URLs and one left open long enough will expire. */}
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt=""
            onError={() => setImageFailed(true)}
            className="size-9 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full',
              isDark ? (isChecked ? 'bg-on-lime/10' : 'bg-dark-border/70') : isChecked ? 'bg-on-lime/10' : 'bg-muted'
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
          </span>
        )}
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
      {(pillLabel || actions || (metrics && metrics.length > 0)) && (
        <span className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            {pillLabel ? <Badge variant={effectivePillVariant}>{pillLabel}</Badge> : null}
            {metrics &&
              metrics.map((metric) => (
                <span
                  key={metric.label ?? metric.value}
                  className={cn(
                    'flex shrink-0 items-center gap-1 text-xs tabular-nums',
                    isDark
                      ? isChecked
                        ? 'text-on-lime/70'
                        : 'text-dark-muted'
                      : isChecked
                        ? 'text-on-lime/70'
                        : 'text-muted-foreground'
                  )}
                >
                  {metric.icon && <metric.icon className="size-3.5 shrink-0" aria-hidden="true" />}
                  <span>{metric.value}</span>
                  {metric.label && <span className="sr-only">{metric.label}</span>}
                </span>
              ))}
          </span>
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
