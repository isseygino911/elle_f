import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        // Neutral outline variant tuned for the dark sidebar/list-panel
        // surfaces (RecordCard), where the light `outline` variant above
        // (border-border/text-foreground) would render dark-on-dark.
        outlineDark: "border-dark-border text-white [a]:hover:bg-dark-card-hover",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Lime — MASTER.md's "selection state, primary highlight" accent.
        // Reused for every attention-drawing badge (unread counts,
        // available-to-answer state) so lime keeps one consistent meaning
        // app-wide rather than introducing a third saturated color.
        accent: "bg-lime text-on-lime",
        lime: "bg-lime text-on-lime",
        // Inverted lime chip — used for a RecordCard's own status pill once
        // the card itself is lime-filled (selected state), per MASTER.md's
        // "priority pill also shifts to a harmonious lime-family tone".
        onLime: "bg-on-lime text-lime",
        // Violet — MASTER.md's second decorative accent / Mid-priority pill.
        violet: "bg-violet text-on-violet",
        // High/Low priority-status pills (MASTER.md Color Palette).
        priorityHigh: "bg-priority-high text-on-priority",
        priorityLow: "bg-priority-low text-on-priority",
        success: "bg-success-bg text-success-text border-success-border",
        warning: "bg-warning-bg text-warning-text border-warning-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps({
      className: cn(badgeVariants({ variant }), className),
    }, props),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants }
