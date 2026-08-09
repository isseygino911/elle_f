import { useCallback, useEffect, useState } from 'react'
import { canManageStudents, canReadBroadcasts, isStudent, isManager, isOwner } from '../lib/roles.js'
import { useOrganization } from '@/lib/OrganizationContext'
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
  Menu,
  X,
  Users,
  Languages,
  BookOpen,
  Building2,
  Megaphone,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'

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
  library: BookOpen,
  organization: Building2,
  broadcasts: Megaphone,
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

// The organization's brand mark, shown in all three sidebar surfaces: the
// mobile top bar, the mobile nav sheet, and the desktop rail (expanded and
// collapsed). One component rather than three copies of the markup -- the
// three used to be near-identical spans, and a logo plus a visibility toggle
// would have meant maintaining the same decision in three places.
//
// Falls back to the text wordmark whenever there is no logo, which is exactly
// how every organization looked before logos existed. The same fallback
// catches a logo that fails to load (deleted object, bucket misconfigured, an
// offline client): degrading to the studio's name reads as intentional, where
// a broken-image glyph reads as a bug.
function BrandMark({ brandName, logoUrl, showName, collapsed = false }) {
  const [logoFailed, setLogoFailed] = useState(false)

  // A replaced logo gets a new URL (the key carries a fresh UUID), so this
  // resets the failure state rather than leaving the fallback stuck on for a
  // perfectly good new image.
  useEffect(() => {
    setLogoFailed(false)
  }, [logoUrl])

  const hasLogo = Boolean(logoUrl) && !logoFailed
  // The collapsed rail is 72px wide and already hides the nav labels; there is
  // no room for a wordmark beside the logo, so the name is dropped there
  // regardless of the toggle. Without a logo the name is the only mark there
  // is, so it always renders -- the server refuses to hide it in that state.
  const nameVisible = !hasLogo || (showName && !collapsed)

  return (
    <div className={cn('flex min-w-0 items-center gap-2', collapsed && 'justify-center')}>
      {hasLogo && (
        <img
          src={logoUrl}
          alt={brandName}
          onError={() => setLogoFailed(true)}
          className={cn(
            'shrink-0 object-contain',
            // Height-capped rather than width-capped: logos are wider than
            // they are tall, and the mobile bar is a 56px row shared with a
            // 44px menu button. Capping height keeps a wide logo from
            // crowding that button off the edge.
            collapsed ? 'size-8' : 'h-8 w-auto max-w-[10rem]'
          )}
        />
      )}
      <span
        className={cn(
          'truncate font-heading text-lg font-extrabold text-lime',
          !nameVisible && 'sr-only'
        )}
      >
        {!hasLogo && collapsed ? brandName.charAt(0).toUpperCase() : brandName}
      </span>
    </div>
  )
}

// Wraps a sidebar nav link in a Tooltip when the sidebar is collapsed, since
// the label is visually hidden (but still in the DOM) at that width.
//
// Active state per MASTER.md's Source Analysis: a solid lime circle behind
// the icon (not a tinted background bar) — the icon glyph switches to
// --color-on-lime so it stays readable against the fill.
function NavLinkItem({ to, end, label, icon: IconComponent, collapsed, onNavigate }) {
  const link = (
    <NavLink
      to={to}
      end={end}
      title={label}
      onClick={onNavigate}
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

// Flips between 'en' and 'zh', styled to match the sidebar's other ghost
// icon/text controls (collapse toggle, logout). Collapsed desktop state
// reuses the same Tooltip-wrapped icon-button pattern as NavLinkItem/logout;
// expanded state is a two-segment EN / 中文 switch.
function LanguageToggle({ collapsed }) {
  const { language, setLanguage, t } = useLanguage()
  const isZh = language === 'zh'
  const toggleLabel = isZh ? t('language.switchToEnglish') : t('language.switchToChinese')

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mx-auto text-dark-muted hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50"
              aria-label={toggleLabel}
              onClick={() => setLanguage(isZh ? 'en' : 'zh')}
            >
              <Languages className="size-5" aria-hidden="true" />
            </Button>
          }
        />
        <TooltipContent side="right">{toggleLabel}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div
      role="group"
      aria-label={t('language.toggleLabel')}
      className="flex items-center gap-0.5 rounded-md bg-dark-card-hover/50 p-0.5"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={!isZh}
        className={cn(
          'flex-1 text-dark-muted hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50',
          !isZh && 'bg-dark-card-hover text-white'
        )}
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={isZh}
        className={cn(
          'flex-1 text-dark-muted hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50',
          isZh && 'bg-dark-card-hover text-white'
        )}
        onClick={() => setLanguage('zh')}
      >
        中文
      </Button>
    </div>
  )
}

// Nav list + user/logout footer — shared between the desktop icon-rail
// `<aside>` (collapsible) and the mobile off-canvas Sheet (always expanded,
// with `onNavigate` closing the sheet on tap). Keeps the two surfaces from
// drifting apart into two copies of the same nav markup.
function SidebarNavList({ navItems, collapsed, userLabel, onLogout, onNavigate }) {
  const { t } = useLanguage()

  return (
    <>
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
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-2 border-t border-dark-border pt-3">
        <LanguageToggle collapsed={collapsed} />
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
                  title={t('nav.logout')}
                  aria-label={t('nav.logout')}
                  onClick={onLogout}
                >
                  <LogOut className="size-5" aria-hidden="true" />
                </Button>
              }
            />
            <TooltipContent side="right">{t('nav.logout')}</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-dark-muted hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50"
            title={t('nav.logout')}
            onClick={onLogout}
          >
            <LogOut className="size-5" aria-hidden="true" />
            {t('nav.logout')}
          </Button>
        )}
      </div>
    </>
  )
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const { organization } = useOrganization()
  // The tenant's own name, with the product name as the fallback while the
  // fetch is in flight or if it failed. Every tenant used to see the literal
  // string "Elle CRM" regardless of what they called their studio at signup.
  const brandName = (organization && organization.name) || 'Elle CRM'
  // Null until an owner uploads one; every surface falls back to the wordmark.
  const logoUrl = (organization && organization.logo_url) || null
  // Defaults to showing the name so an org mid-fetch (or one that predates
  // logos entirely) never flashes a nameless header.
  const showNameWithLogo = !organization || organization.show_name_with_logo !== false
  const { t } = useLanguage()
  const isElle = canManageStudents(user)
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      persistCollapsed(next)
      return next
    })
  }, [])

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  // A manager's entire surface is the aggregate dashboard: every per-student
  // route returns 403 or 404 for them, so linking to any of it would be an
  // invitation to hit an error page. Built as its own list rather than by
  // subtracting items from the teaching nav, so the two cannot drift.
  //
  // This is a menu, not a lock -- typing a URL bypasses it entirely. The
  // matching route guards live in App.jsx (canOpenStudentContent), and the
  // real boundary is the server, which fences every one of these endpoints by
  // organization and capability.
  const navItems = isManager(user)
    ? [
        { to: '/dashboard', label: t('nav.dashboard'), icon: 'dashboard' },
        // The manager's second link, and the only one that is not the
        // dashboard. It leads to the oversight feed -- sender, subject and
        // recipient count -- which is aggregate data of exactly the kind this
        // role already sees. It is not a compose form: the server refuses a
        // manager's POST, and the page draws no form for them.
        { to: '/broadcasts', label: t('nav.broadcasts'), icon: 'broadcasts' },
      ]
    : [
        { to: '/dashboard', label: t('nav.dashboard'), icon: 'dashboard' },
        isElle && { to: '/students', label: t('nav.students'), icon: 'students' },
        { to: '/surveys', label: t('nav.surveys'), icon: 'surveys', end: true },
        isElle && { to: '/surveys/upload', label: t('nav.uploadSurvey'), icon: 'upload' },
        { to: '/videos', label: t('nav.videos'), icon: 'videos', end: true },
        { to: '/videos/upload', label: t('nav.uploadVideo'), icon: 'upload' },
        { to: '/library', label: t('nav.library'), icon: 'library', end: true },
        { to: '/bookings', label: t('nav.bookings'), icon: 'bookings' },
        isElle && { to: '/invitations', label: t('nav.invitations'), icon: 'invitations' },
        // Owner and teacher only. canReadBroadcasts also admits managers, who
        // are handled by the branch above and never reach this list.
        canReadBroadcasts(user) && {
          to: '/broadcasts',
          label: t('nav.broadcasts'),
          icon: 'broadcasts',
        },
        // Owner only — renaming the studio is an organization-level act, not a
        // teaching one, so this is narrower than the isElle items above.
        isOwner(user) && {
          to: '/organization',
          label: t('nav.organization'),
          icon: 'organization',
        },
        user && {
          // Students go straight to their own thread; everyone else to the list.
          to: isStudent(user) ? `/messages/${encodeURIComponent(user.id)}` : '/messages',
          label: t('nav.messages'),
          icon: 'messages',
        },
      ].filter(Boolean)

  const userLabel = (user && (user.name || user.email)) || 'Account'

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row md:items-stretch">
      {/* Mobile top bar (< md): replaces the inline sidebar entirely below
          the md breakpoint. Sticky so the menu button stays reachable while
          page content scrolls, same way the desktop sidebar stays put via
          its own `sticky`. */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-dark-border bg-dark px-4 shadow-md md:hidden">
        <BrandMark brandName={brandName} logoUrl={logoUrl} showName={showNameWithLogo} />
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 text-dark-muted hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5.5" aria-hidden="true" />
              </Button>
            }
          />
          <SheetContent side="left">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Elle Coaching CRM primary navigation</SheetDescription>

            <div className="flex items-center justify-between gap-2 border-b border-dark-border px-1 pb-3">
              <BrandMark brandName={brandName} logoUrl={logoUrl} showName={showNameWithLogo} />
              <SheetClose
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 shrink-0 text-dark-muted hover:bg-dark-card-hover hover:text-white focus-visible:border-lime focus-visible:ring-lime/50"
                    aria-label="Close navigation menu"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </Button>
                }
              />
            </div>

            <SidebarNavList
              navItems={navItems}
              collapsed={false}
              userLabel={userLabel}
              onLogout={() => {
                closeMobileNav()
                logout()
              }}
              onNavigate={closeMobileNav}
            />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop sidebar (md+): unchanged sticky icon-rail behavior, just
          hidden below md instead of always rendering. */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen flex-none flex-col gap-4 overflow-y-auto border-r border-dark-border bg-dark p-3 shadow-md transition-[width] duration-200 ease-out md:flex',
          collapsed ? 'w-18' : 'w-60'
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-dark-border px-1 pb-3">
          <BrandMark
            brandName={brandName}
            logoUrl={logoUrl}
            showName={showNameWithLogo}
            collapsed={collapsed}
          />
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

        <SidebarNavList navItems={navItems} collapsed={collapsed} userLabel={userLabel} onLogout={() => logout()} />
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
