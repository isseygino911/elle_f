import { useCallback, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  ClipboardList,
  Upload,
  Video,
  CalendarDays,
  UserPlus,
  MessageSquare,
  LogOut,
  ChevronLeft,
  Users,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed'

function readStoredCollapsed() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    // Private browsing / storage disabled — default to expanded.
    return false
  }
}

function persistCollapsed(collapsed) {
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
  } catch {
    // Ignore storage errors; the toggle still works for this session.
  }
}

const ICONS = {
  dashboard: LayoutGrid,
  surveys: ClipboardList,
  upload: Upload,
  videos: Video,
  bookings: CalendarDays,
  invitations: UserPlus,
  messages: MessageSquare,
  students: Users,
}

function initials(label) {
  return (label || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

// Wraps a sidebar nav link in a Tooltip when the sidebar is collapsed, since
// the label is visually hidden (but still in the DOM) at that width.
//
// Active state per MASTER.md's Source Analysis: a solid lime circle behind
// the icon (not a tinted background bar) — the icon glyph switches to
// --color-on-lime so it stays readable against the fill.
function NavLinkItem({ to, end, label, icon: IconComponent, collapsed }) {
  const link = (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) =>
        cn(
          'group flex w-full items-center gap-3 overflow-hidden rounded-md px-2 py-1.5 text-sm font-medium whitespace-nowrap text-dark-muted transition-colors duration-150 hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50',
          collapsed && 'justify-center px-0',
          isActive && 'text-white hover:bg-transparent'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150',
              isActive && 'bg-lime'
            )}
          >
            <IconComponent className={cn('size-4.5', isActive ? 'text-on-lime' : 'text-current')} aria-hidden="true" />
          </span>
          <span className={cn('overflow-hidden text-ellipsis', collapsed && 'sr-only')}>{label}</span>
        </>
      )}
    </NavLink>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const isElle = Boolean(user && user.role === 'elle')
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      persistCollapsed(next)
      return next
    })
  }, [])

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    isElle && { to: '/students', label: 'Students', icon: 'students' },
    { to: '/surveys', label: 'Surveys', icon: 'surveys', end: true },
    isElle && { to: '/surveys/upload', label: 'Upload Survey', icon: 'upload' },
    { to: '/videos', label: 'Videos', icon: 'videos', end: true },
    { to: '/videos/upload', label: 'Upload Video', icon: 'upload' },
    { to: '/bookings', label: 'Bookings', icon: 'bookings' },
    isElle && { to: '/invitations', label: 'Invitations', icon: 'invitations' },
    !isElle && user && {
      to: `/messages/${encodeURIComponent(user.id)}`,
      label: 'Messages',
      icon: 'messages',
    },
  ].filter(Boolean)

  const userLabel = (user && (user.name || user.email)) || 'Account'

  return (
    <div className="flex min-h-screen items-stretch bg-background">
      <aside
        className={cn(
          'sticky top-0 flex h-screen flex-none flex-col gap-4 overflow-y-auto border-r border-dark-border bg-dark p-3 shadow-md transition-[width] duration-200 ease-out',
          collapsed ? 'w-18' : 'w-60'
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-dark-border px-1 pb-3">
          <span
            className={cn(
              'overflow-hidden font-heading text-lg font-extrabold whitespace-nowrap text-lime',
              collapsed && 'sr-only'
            )}
          >
            {collapsed ? 'E' : 'Elle CRM'}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-dark-muted hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('size-5 transition-transform duration-200 ease-out', collapsed && 'rotate-180')} aria-hidden="true" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto" aria-label="Primary">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLinkItem
                  to={item.to}
                  end={item.end}
                  label={item.label}
                  icon={ICONS[item.icon]}
                  collapsed={collapsed}
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 border-t border-dark-border pt-3">
          <div
            className={cn('flex items-center gap-2 overflow-hidden px-1 text-sm text-dark-muted', collapsed && 'justify-center px-0')}
            title={userLabel}
          >
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="bg-dark-card-hover text-xs text-white">{initials(userLabel) || '?'}</AvatarFallback>
            </Avatar>
            <span className={cn('overflow-hidden text-ellipsis whitespace-nowrap text-white', collapsed && 'sr-only')}>{userLabel}</span>
          </div>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mx-auto text-dark-muted hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50"
                    title="Log out"
                    aria-label="Log out"
                    onClick={() => logout()}
                  >
                    <LogOut className="size-5" aria-hidden="true" />
                  </Button>
                }
              />
              <TooltipContent side="right">Log out</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-dark-muted hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50"
              title="Log out"
              onClick={() => logout()}
            >
              <LogOut className="size-5" aria-hidden="true" />
              Log out
            </Button>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
