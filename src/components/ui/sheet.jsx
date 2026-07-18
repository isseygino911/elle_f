import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"

// Minimal off-canvas drawer primitive, built on the same @base-ui/react
// Dialog used by alert-dialog.jsx (not a new dependency — already installed
// and already relied on elsewhere in ui/). Gives us a modal focus trap,
// Escape-to-close, and outside-click-to-close for free, matching the
// AlertDialog/Tooltip primitive shape (Root/Trigger/Portal/Backdrop/Popup).
// No shadcn "sheet" component existed in this project prior to this file.

function Sheet({ ...props }) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

// side="left" is the only variant this app currently needs (mobile primary
// nav mirrors the desktop sidebar's left placement), but right/top/bottom
// are wired up since this is meant to be a reusable primitive, not a
// one-off inlined into AppShell.
function SheetContent({ className, children, side = "left", ...props }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-dark shadow-md outline-none duration-200 data-open:animate-in data-closed:animate-out",
          side === "left" &&
            "inset-y-0 left-0 h-full w-72 max-w-[85vw] border-r border-dark-border p-3 data-open:slide-in-from-left data-closed:slide-out-to-left",
          side === "right" &&
            "inset-y-0 right-0 h-full w-72 max-w-[85vw] border-l border-dark-border p-3 data-open:slide-in-from-right data-closed:slide-out-to-right",
          side === "top" &&
            "inset-x-0 top-0 max-h-[85vh] border-b border-dark-border p-3 data-open:slide-in-from-top data-closed:slide-out-to-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[85vh] border-t border-dark-border p-3 data-open:slide-in-from-bottom data-closed:slide-out-to-bottom",
          className
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetTitle({ className, ...props }) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn(className)} {...props} />
}

function SheetDescription({ className, ...props }) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn(className)} {...props} />
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription }
