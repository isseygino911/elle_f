import { useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

// A hand-rolled tablist. There is no Tabs primitive in components/ui, and this
// is the only place in the app that needs one, so it lives beside its caller
// rather than being promoted to a shared primitive before there is a second
// user for it.
//
// WHY THE KEYBOARD CODE IS NOT OPTIONAL
// A row of <button>s is not a tab bar. Under the APG's tabs pattern the strip
// is ONE tab stop: Tab moves into the active tab and straight out again, and
// the arrows move between tabs. That is what `tabIndex={active ? 0 : -1}`
// (roving tabindex) plus the arrow handler below implement. Without it a
// keyboard user tabs through four buttons to reach the panel, and a screen
// reader announces four unrelated buttons instead of "tab 2 of 4, selected".
//
// Activation is automatic (selecting on arrow, not on a separate Enter): the
// panels are already loaded client-side, so there is no fetch to spare and
// automatic activation is the APG's recommendation in that case.

// `baseId` is passed in rather than generated here: the panels live in the
// caller, and aria-controls/aria-labelledby only work if both halves derive
// their ids from the SAME base. A useId() local to this component would
// produce ids no panel could match.
export function StudentTabs({ tabs, activeId, onChange, label, baseId }) {
  const refs = useRef({})

  const tabId = (id) => `${baseId}-tab-${id}`

  const onKeyDown = useCallback(
    (event) => {
      const order = tabs.map((tab) => tab.id)
      const current = order.indexOf(activeId)
      if (current === -1) return

      // Home/End are part of the pattern, not extras -- with counts in the
      // labels the strip can get wide, and jumping to either end without
      // arrowing through the middle is the point.
      let next = null
      if (event.key === 'ArrowRight') next = order[(current + 1) % order.length]
      else if (event.key === 'ArrowLeft') next = order[(current - 1 + order.length) % order.length]
      else if (event.key === 'Home') next = order[0]
      else if (event.key === 'End') next = order[order.length - 1]
      if (next === null) return

      // The arrows move focus as well as selection; without the focus() the
      // roving tabindex would leave focus on a tab that is no longer active.
      event.preventDefault()
      onChange(next)
      refs.current[next]?.focus()
    },
    [tabs, activeId, onChange]
  )

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      // FOLDER TABS, not a pill strip. The tabs sit directly ON the panel
      // below rather than in a shell of their own: -mb-px pulls the strip down
      // by exactly the panel's top border width, so the active tab's
      // transparent bottom edge lands on that border and erases it. That erased
      // seam is the whole illusion -- tab and panel read as one folder rather
      // than as a control floating above a box.
      //
      // px-2 insets the strip slightly so the first tab's rounded top-left
      // corner is visible against the panel edge rather than flush with it.
      //
      // Scrolls rather than wraps on a narrow pane: a wrapped strip reflows
      // the panel below it as tabs change width, and the master-detail layout
      // already gives this pane very little room under 1024px.
      className="-mb-px flex items-end gap-1 overflow-x-auto px-2 [scrollbar-width:thin]"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId
        return (
          <button
            key={tab.id}
            id={tabId(tab.id)}
            ref={(node) => {
              refs.current[tab.id] = node
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              // min-h-11 is the 44px touch target. It makes the tab slightly
              // taller than the reference's slim bar, which is the right
              // trade: a 32px tab is comfortably tappable only with a mouse.
              //
              // Rounded on top only, bordered on three sides: a folder tab has
              // no bottom edge of its own -- it opens into the panel.
              // focus-visible uses a -2 offset so the ring sits INSIDE the tab;
              // the default +2 would draw it across the joined bottom seam and
              // re-introduce the line the active tab exists to erase.
              'relative inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-t-lg border border-b-0 px-3.5 text-sm whitespace-nowrap transition-all duration-150',
              'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
              active
                ? // The active tab matches the panel's own surface (bg-card,
                  // fully opaque -- one step up the opacity ladder from the
                  // panel's /70, same rule the rows follow) and pays out its
                  // bottom border as transparent so the two surfaces merge.
                  //
                  // The accent is a TOP EDGE rather than a fill: a fully
                  // accent-filled tab cannot merge into a light panel, which
                  // would cost exactly the folder read this redesign is for.
                  // border-t-2 with -mt-px keeps the thicker top edge from
                  // making the active tab shorter than its neighbours.
                  //
                  // The side borders take the accent at 30% rather than the
                  // neutral border token: the corner radius turns the top edge
                  // through 90deg, so a neutral side border makes the accent
                  // stop dead mid-curve in a visibly blunt cut. Fading it out
                  // down the sides lets the stroke resolve into the panel.
                  '-mt-px z-10 border-t-2 border-t-lime border-x-lime/30 bg-card font-semibold text-foreground'
                : // Inactive tabs sit a pixel lower and lighter, so they read
                  // as sheets filed BEHIND the open one. Hover lifts them back
                  // up to meet the active tab's baseline.
                  'translate-y-px border-border/40 bg-card/40 font-medium text-muted-foreground hover:translate-y-0 hover:bg-card/70 hover:text-foreground'
            )}
          >
            {tab.label}
            {/* The count rides inside the tab instead of in a separate stat
                row -- same information, no extra vertical band.

                It inherits the tab's own colour at 70% rather than taking a
                second token, so it stays secondary in both states without
                needing its own contrast check. tabular-nums stops the pill
                changing width as counts change. */}
            <span className="tabular-nums opacity-70">{tab.count}</span>
          </button>
        )
      })}
    </div>
  )
}

// The panel half of the pattern. Kept here so the id convention that links it
// to its tab cannot drift from the tablist above.
export function StudentTabPanel({ baseId, id, activeId, children }) {
  if (id !== activeId) return null
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${id}`}
      aria-labelledby={`${baseId}-tab-${id}`}
      // tabIndex=0 so a keyboard user can reach panel content that contains no
      // focusable element of its own (an empty state, or plain booking rows).
      tabIndex={0}
      className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </div>
  )
}
