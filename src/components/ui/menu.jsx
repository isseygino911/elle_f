import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

// Dropdown menu primitive, built on the same @base-ui/react package already
// used by sheet.jsx and alert-dialog.jsx (not a new dependency). Gives us
// roving focus, typeahead, Escape-to-close and outside-click for free, and
// portals the popup so it escapes any overflow-clipped ancestor.
//
// Added for the sidebar's account menu, which folds the language toggle and
// logout into the identity block at the foot of the rail. No shadcn "dropdown
// menu" component existed in this project prior to this file.

function Menu({ ...props }) {
  return <MenuPrimitive.Root data-slot="menu" {...props} />
}

function MenuTrigger({ ...props }) {
  return <MenuPrimitive.Trigger data-slot="menu-trigger" {...props} />
}

function MenuGroup({ ...props }) {
  return <MenuPrimitive.Group data-slot="menu-group" {...props} />
}

// side/align/sideOffset are forwarded to Positioner rather than hardcoded, so
// a caller can open the menu wherever it makes sense. The sidebar opens it
// upward ("top"), since the trigger sits at the floor of the rail.
function MenuContent({ className, side = "bottom", align = "start", sideOffset = 6, ...props }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <MenuPrimitive.Popup
          data-slot="menu-content"
          className={cn(
            "min-w-[10rem] overflow-hidden rounded-sm border border-dark-border bg-dark-card p-1 text-white shadow-md outline-none",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function MenuItem({ className, ...props }) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-item"
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-[min(var(--radius-sm),10px)] px-2 py-1.5 text-sm outline-none",
        "data-highlighted:bg-dark-card-hover data-highlighted:text-white",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function MenuSeparator({ className, ...props }) {
  return (
    <MenuPrimitive.Separator
      data-slot="menu-separator"
      className={cn("-mx-1 my-1 h-px bg-dark-border", className)}
      {...props}
    />
  )
}

function MenuLabel({ className, ...props }) {
  return (
    <div
      data-slot="menu-label"
      className={cn("px-2 py-1 text-xs font-medium tracking-wide text-dark-muted uppercase", className)}
      {...props}
    />
  )
}

export { Menu, MenuTrigger, MenuGroup, MenuContent, MenuItem, MenuSeparator, MenuLabel }
