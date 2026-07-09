import { Link, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

// MASTER.md's master-detail-insight composition (Layout Pattern section):
// a persistent dark list panel next to its own detail, implemented via
// nested routing so the existing `/videos` and `/videos/:id` (etc.) URLs
// keep working unchanged — this component is the route element for the
// parent path and renders `<Outlet/>` for the `index` / `:id` children.
//
// Mobile (<1024px per the Pre-Delivery Checklist): the list panel is the
// primary view; opening a record hides the list and shows the detail
// full-width with a back link. Detected from the URL, not local state, so
// each item's route is still the single source of truth for what's shown.
export default function MasterDetailLayout({ basePath, title, actions, statTiles, list, listEmpty }) {
  const location = useLocation()
  const isDetailRoute = location.pathname.replace(/\/+$/, '') !== basePath

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row">
      <div
        className={cn(
          'flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-dark-border bg-dark p-5 lg:h-full lg:w-[22rem] lg:border-r lg:border-b-0',
          isDetailRoute && 'hidden lg:flex'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <h1 className="m-0 font-heading text-xl font-extrabold text-white">{title}</h1>
          {actions}
        </div>
        {statTiles}
        <ul className="flex flex-col gap-2">
          {list && list.length > 0 ? list : <li className="px-1 text-sm text-dark-muted">{listEmpty}</li>}
        </ul>
      </div>

      <div className={cn('min-w-0 flex-1 bg-background lg:h-full lg:overflow-y-auto', !isDetailRoute && 'hidden lg:block')}>
        {isDetailRoute && (
          <Link
            to={basePath}
            className="m-5 mb-0 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to list
          </Link>
        )}
        <Outlet />
      </div>
    </div>
  )
}
