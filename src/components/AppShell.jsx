import { useCallback, useEffect, useState } from 'react'
import { canManageStudents, canReadBroadcasts, isStudent, isManager, isOwner } from '../lib/roles.js'
import { useOrganization } from '@/lib/OrganizationContext'
import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  ClipboardList,
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
  GraduationCap,
  ChevronsUpDown,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
// Aliased: `Menu` is already the lucide hamburger icon on the mobile top bar.
import {
  Menu as MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuLabel,
} from '@/components/ui/menu'
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
  videos: Video,
  bookings: CalendarDays,
  invitations: UserPlus,
  messages: MessageSquare,
  students: Users,
  library: BookOpen,
  organization: Building2,
  broadcasts: Megaphone,
  // BookOpen is already the library's. A course is the teaching relationship
  // rather than the shelf of resources, so it gets its own mark.
  courses: GraduationCap,
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
// Active state: a faint card fill lifted by a hairline border, with the label
// and icon in white against the muted grey of the unselected rows.
//
// The border, not the fill, is what marks the selection. --color-card-dark
// (#151b2c) is only a few steps off the rail's own #0b0f1a, so the fill alone
// would barely register; the 1px --color-dark-border edge is what makes the
// row read as a distinct object. That also settles what would otherwise be a
// conflict with hover: --color-card-dark-hover (#1c2338) is *lighter* than the
// selected fill, so on fill alone a hovered row would look more selected than
// the selected one. Hover has no border, so the two never compete.
//
// Every row carries a transparent border so selecting one does not add 2px to
// its height and shift the rows below it.
function NavLinkItem({ to, end, label, icon: IconComponent, collapsed, onNavigate }) {
  const link = (
    <NavLink
      to={to}
      end={end}
      title={label}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex w-full items-center gap-3 rounded-sm border px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150',
          // The old focus-visible:border-lime / ring-lime/50 pair drew
          // nothing here: NavLink renders a bare <a> with no border width
          // and no ring-* utility to consume the ring color, so the only
          // ring was global.css's element-level ink outline -- #0f172a on
          // the #0b0f1a rail, effectively invisible.
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime',
          collapsed && 'justify-center px-0',
          isActive
            ? 'border-dark-border bg-dark-card text-white'
            : 'border-transparent text-dark-muted hover:bg-dark-card-hover hover:text-white'
        )
      }
    >
      {/* No render-prop children: with the icon on text-current, nothing in
          here varies by active state -- the className callback carries all
          of it. */}
      {/* text-current: the icon takes the row's own color in every state, so
          it brightens to white with the label on select and on hover rather
          than being lit separately. */}
      <IconComponent className="size-4.5 shrink-0 text-current" aria-hidden="true" />
      {/* truncate on the label rather than overflow-hidden on the row: the
          clip belongs to the text, not to the whole pill. min-w-0 lets the
          flex child shrink below its content width. */}
      <span className={cn('min-w-0 truncate', collapsed && 'sr-only')}>{label}</span>
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

// The rail's bottom anchor: avatar, name and role as one block, with a menu
// holding the controls that used to sit in the footer as their own rows
// (language switch, logout).
//
// The whole block is the trigger rather than a separate chevron button: at
// this size a 44px row with a 20px hit target buried at its right edge is
// harder to hit than the row itself, and the avatar-plus-name is what a user
// reads as "me" anyway.
function AccountMenu({ collapsed, userLabel, roleLabel, onLogout }) {
  const { language, setLanguage, t } = useLanguage()
  const isZh = language === 'zh'

  const trigger = (
    <button
      type="button"
      title={userLabel}
      aria-label={userLabel}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-sm p-1.5 text-left transition-colors duration-150',
        'hover:bg-dark-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime',
        collapsed && 'justify-center p-0'
      )}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-dark-card-hover text-xs font-semibold text-white">
          {initials(userLabel) || '?'}
        </AvatarFallback>
      </Avatar>
      {/* Two lines: who you are, then what you are. The role was never shown
          in the sidebar before, and it is the one piece of context that makes
          a shared-device login obvious at a glance. */}
      <span className={cn('flex min-w-0 flex-1 flex-col', collapsed && 'sr-only')}>
        <span className="truncate text-sm font-medium text-white">{userLabel}</span>
        {roleLabel && <span className="truncate text-xs text-dark-muted">{roleLabel}</span>}
      </span>
      <ChevronsUpDown
        className={cn('size-4 shrink-0 text-dark-muted', collapsed && 'hidden')}
        aria-hidden="true"
      />
    </button>
  )

  const menu = (
    <MenuRoot>
      <MenuTrigger render={trigger} />
      {/* Opens upward: the trigger is the last thing in the rail, so there is
          no room below it. align="end" keeps the popup inside the viewport
          on the collapsed rail, where the trigger is only 32px wide. */}
      <MenuContent side="top" align={collapsed ? 'start' : 'end'} className="min-w-[11rem]">
        <MenuLabel>{t('language.toggleLabel')}</MenuLabel>
        <MenuItem
          onClick={() => setLanguage('en')}
          className={cn(!isZh && 'text-lime')}
        >
          <Languages aria-hidden="true" />
          EN
        </MenuItem>
        <MenuItem
          onClick={() => setLanguage('zh')}
          className={cn(isZh && 'text-lime')}
        >
          <Languages aria-hidden="true" />
          中文
        </MenuItem>
        <MenuSeparator />
        <MenuItem onClick={onLogout}>
          <LogOut aria-hidden="true" />
          {t('nav.logout')}
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )

  if (!collapsed) return menu

  // Collapsed, the name and role are sr-only, so the tooltip is the only way
  // to read who is signed in -- same reasoning as the nav rows.
  return (
    <Tooltip>
      <TooltipTrigger render={menu} />
      <TooltipContent side="right">{userLabel}</TooltipContent>
    </Tooltip>
  )
}

// Nav list + user/logout footer — shared between the desktop icon-rail
// `<aside>` (collapsible) and the mobile off-canvas Sheet (always expanded,
// with `onNavigate` closing the sheet on tap). Keeps the two surfaces from
// drifting apart into two copies of the same nav markup.
//
// `showHeaders` is decided by the caller: a role with only one titled section
// gets a plain flat list, because a heading whose job is to separate its group
// from a neighbour has nothing to separate. Since the headings became sr-only
// this is an assistive-tech decision rather than a visual one -- it controls
// whether the groups are announced as named lists or as one flat run.
function SidebarNavList({ navSections, showHeaders, collapsed, userLabel, roleLabel, onLogout, onNavigate }) {
  const { t } = useLanguage()

  // The pinned section (Admin) is lifted out of the scrolling area entirely,
  // so Invitations and Organization stay reachable against the footer instead
  // of scrolling away with the groups above them. Left inside the scroll area,
  // `mt-auto` would push it to the end of the *scrollable content* rather than
  // the end of the sidebar, putting it past the fold on a short viewport.
  const scrollingSections = navSections.filter((section) => !section.pinned)
  const pinnedSections = navSections.filter((section) => section.pinned)

  const renderSection = (section, index) => {
    // Only titled sections get a heading, and only when this role has enough
    // of them to be worth distinguishing. Not drawn either way -- see the
    // sr-only <h2> below.
    const headingId = section.id ? `nav-section-${section.id}` : undefined
    const withHeading = Boolean(showHeaders && section.id)

    return (
      <div
        key={section.id || 'main'}
        className={cn(
          // Natural height: the scroll happens on the container, so a group is
          // never squeezed by the flex column it sits in.
          'shrink-0',
          // Whitespace alone separates one group from the next now that the
          // headings are not drawn. mt-6 rather than the mt-4 that sat under
          // a visible label: with nothing to read at the boundary, the gap is
          // the only signal, so it has to be unmistakably larger than the
          // gap-1 between rows inside a group.
          index > 0 && 'mt-6',
          // Collapsed, the rail is 72px of stacked glyphs with no text at all,
          // so even a large gap reads as an accident rather than a boundary.
          // The hairline states it -- the same one the footer uses.
          index > 0 && collapsed && 'border-t border-dark-border pt-4',
        )}
      >
        {withHeading && (
          // Visually hidden, never removed. The reference groups by whitespace
          // alone, but this <h2> is what `aria-labelledby` on the <ul> below
          // points at: deleting it would cost a screen reader the "Teaching,
          // list, 3 items" announcement and flatten eleven links into one
          // undifferentiated run. Hiding it is a UI change; dropping it would
          // be an accessibility regression.
          <h2 id={headingId} className="sr-only">
            {t(section.labelKey)}
          </h2>
        )}
        <ul className="flex flex-col gap-1" aria-labelledby={withHeading ? headingId : undefined}>
          {section.items.map((item) => (
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
      </div>
    )
  }

  return (
    <>
      <nav className="flex min-h-0 flex-1 flex-col" aria-label="Primary">
        {/* overflow-x-clip because overflow-y-auto computes overflow-x to
            `auto`, which would make the flush-right nav pills scrollable
            sideways. `clip` (unlike `hidden`) adds no scroll container. */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-clip">{scrollingSections.map(renderSection)}</div>
        {/* Index 1 rather than 0 so this block keeps the same top spacing (and
            the collapsed rail's hairline) that it had as a trailing section. */}
        {pinnedSections.map((section) => renderSection(section, 1))}
      </nav>

      {/* One identity block anchoring the foot of the rail, in place of the
          three stacked controls (language switch, avatar row, full-width
          logout) this used to be. Language and logout move into the menu it
          opens -- both are settings you reach occasionally, and giving each a
          permanent row made the footer heavier than the nav above it. */}
      <div className="border-t border-dark-border pt-3">
        <AccountMenu
          collapsed={collapsed}
          userLabel={userLabel}
          roleLabel={roleLabel}
          onLogout={onLogout}
        />
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

  // Grouped by the teaching loop -- you set work, they do work, you review
  // what came back, you talk about it -- which is also the order a coach's
  // attention moves through a working day. That is why Surveys and Videos sit
  // apart from Courses: opening /videos is review, not authoring.
  //
  // Nothing collapses. Every row here is daily-use for somebody, and hiding
  // nav one level deep measurably costs discoverability, so the headings group
  // without concealing. With eleven rows at the widest role there is no space
  // problem to solve in the first place.
  //
  // A manager's entire surface is the aggregate dashboard: every per-student
  // route returns 403 or 404 for them, so linking to any of it would be an
  // invitation to hit an error page. Built as its own list rather than by
  // subtracting items from the teaching nav, so the two cannot drift. Wrapped
  // as a single untitled section only so this component takes one shape; the
  // heading rule below then drops the headings for them on its own.
  //
  // This is a menu, not a lock -- typing a URL bypasses it entirely. The
  // matching route guards live in App.jsx (canOpenStudentContent), and the
  // real boundary is the server, which fences every one of these endpoints by
  // organization and capability.
  const navSections = (
    isManager(user)
      ? [
          {
            id: null,
            items: [
              { to: '/dashboard', label: t('nav.dashboard'), icon: 'dashboard' },
              // The manager's second link, and the only one that is not the
              // dashboard. It leads to the oversight feed -- sender, subject and
              // recipient count -- which is aggregate data of exactly the kind
              // this role already sees. It is not a compose form: the server
              // refuses a manager's POST, and the page draws no form for them.
              { to: '/broadcasts', label: t('nav.broadcasts'), icon: 'broadcasts' },
            ],
          },
        ]
      : [
          // Headerless and first: the landing route has no peers, and a
          // heading over a single row is noise.
          {
            id: null,
            items: [{ to: '/dashboard', label: t('nav.dashboard'), icon: 'dashboard' }],
          },
          {
            id: 'teaching',
            // A student is not "teaching", and asking them to read
            // "Student work" and infer "mine" is a translation step the
            // heading exists to avoid.
            labelKey: isStudent(user) ? 'nav.section.myLearning' : 'nav.section.teaching',
            // Roster, then course, then shelf: a student enrols in a course,
            // a course draws on the library.
            items: [
              isElle && { to: '/students', label: t('nav.students'), icon: 'students' },
              // Everyone in this branch: a teacher sets homework, a student
              // does it. (A manager never reaches this list at all.)
              // `end` so the link stops looking active once a course or an
              // assignment is open, matching /surveys, /videos and /library.
              { to: '/courses', label: t('nav.courses'), icon: 'courses', end: true },
              { to: '/library', label: t('nav.library'), icon: 'library', end: true },
            ].filter(Boolean),
          },
          {
            id: 'studentWork',
            labelKey: isStudent(user) ? 'nav.section.myWork' : 'nav.section.studentWork',
            // What came back and is waiting on a review. Surveys first: a
            // survey is a scan, a video is a sit-down.
            items: [
              { to: '/surveys', label: t('nav.surveys'), icon: 'surveys', end: true },
              { to: '/videos', label: t('nav.videos'), icon: 'videos', end: true },
            ],
          },
          {
            id: 'communication',
            labelKey: 'nav.section.communication',
            // Live call, then one-to-one, then one-to-many.
            items: [
              { to: '/bookings', label: t('nav.bookings'), icon: 'bookings' },
              user && {
                // Students go straight to their own thread; everyone else to
                // the list.
                to: isStudent(user) ? `/messages/${encodeURIComponent(user.id)}` : '/messages',
                label: t('nav.messages'),
                icon: 'messages',
              },
              // Owner and teacher only. canReadBroadcasts also admits
              // managers, who are handled by the branch above.
              canReadBroadcasts(user) && {
                to: '/broadcasts',
                label: t('nav.broadcasts'),
                icon: 'broadcasts',
              },
            ].filter(Boolean),
          },
          {
            id: 'admin',
            labelKey: 'nav.section.admin',
            pinned: true,
            items: [
              isElle && { to: '/invitations', label: t('nav.invitations'), icon: 'invitations' },
              // Owner only — renaming the studio is an organization-level act,
              // not a teaching one, so this is narrower than the isElle items
              // above. Last row in the sidebar: set once, then forgotten.
              isOwner(user) && {
                to: '/organization',
                label: t('nav.organization'),
                icon: 'organization',
              },
            ].filter(Boolean),
          },
        ]
    // A section every item of which was gated away leaves no trace -- no
    // heading, no gap. This is what removes Admin for a student, and what
    // keeps any future role from opening a hole in the sidebar.
  ).filter((section) => section.items.length > 0)

  // Headings earn their place only against a neighbouring group, so the test
  // is on how many titled sections survived, not on how many rows there are.
  // The manager falls out of it with no special case: one titled section (in
  // their case none at all) means the flat list they have today.
  const showNavHeaders = navSections.filter((section) => section.id).length >= 2

  const userLabel = (user && (user.name || user.email)) || 'Account'
  // Renders nothing rather than a raw or unresolved role: t() returns the key
  // itself when a translation is missing, so a role the dictionary does not
  // know would otherwise print the literal "role.whatever" under the name.
  const roleKey = user && user.role
  const roleTranslationKey = roleKey ? `role.${roleKey}` : ''
  const roleTranslated = roleTranslationKey ? t(roleTranslationKey) : ''
  const roleLabel = roleTranslated === roleTranslationKey ? '' : roleTranslated

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row md:items-stretch">
      {/* Mobile top bar (< md): replaces the inline sidebar entirely below
          the md breakpoint. Sticky so the menu button stays reachable while
          page content scrolls, same way the desktop sidebar stays put via
          its own `sticky`. */}
      <header className="sidebar-gradient sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-dark-border bg-dark px-4 shadow-md md:hidden">
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
          {/* The drawer is the mobile stand-in for the rail, so it wears the
              same wash. Set here rather than in ui/sheet.jsx: SheetContent is
              a generic primitive and the gradient is navigation styling. */}
          <SheetContent side="left" className="sidebar-gradient">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Elle Coaching CRM primary navigation</SheetDescription>

            {/* Same masthead treatment as the desktop rail: the mark on the
                drawer's own surface, not in a card of its own. */}
            <div className="flex items-center justify-between gap-2 px-1">
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
              navSections={navSections}
              showHeaders={showNavHeaders}
              collapsed={false}
              userLabel={userLabel}
              roleLabel={roleLabel}
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
          hidden below md instead of always rendering.

          gap-5 between the three bands (masthead / nav / identity) rather
          than gap-4: with the brand header no longer a filled card, spacing
          is the only thing left separating the mark from the first nav row,
          so it has to carry more weight. */}
      <aside
        className={cn(
          'sidebar-gradient sticky top-0 hidden h-screen flex-none flex-col gap-5 overflow-y-auto overflow-x-clip border-r border-dark-border bg-dark p-3 shadow-md transition-[width] duration-200 ease-out md:flex',
          collapsed ? 'w-18' : 'w-60'
        )}
      >
        {/* The mark sits directly on the rail rather than inside a card of
            its own: a bordered, rounded, separately-colored box at the top
            read as a widget that had landed in the sidebar instead of as the
            sidebar's own masthead. The tenant's color now arrives as the
            rail's own background wash instead, so the mark does not need to
            carry it. */}
        <div className={cn('flex items-center gap-2 px-1', collapsed ? 'justify-center' : 'justify-between')}>
          <BrandMark
            brandName={brandName}
            logoUrl={logoUrl}
            showName={showNameWithLogo}
            collapsed={collapsed}
          />
          {/* Hidden when collapsed so the mark can sit centred in the 72px
              rail on its own; the toggle moves below it there. */}
          {!collapsed && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-dark-muted hover:bg-dark-card-hover hover:text-white"
              onClick={toggleCollapsed}
              aria-expanded={!collapsed}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-4.5" aria-hidden="true" />
            </Button>
          )}
        </div>

        {collapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mx-auto size-8 shrink-0 text-dark-muted hover:bg-dark-card-hover hover:text-white"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label="Expand sidebar"
          >
            <ChevronLeft className="size-4.5 rotate-180" aria-hidden="true" />
          </Button>
        )}

        <SidebarNavList
          navSections={navSections}
          showHeaders={showNavHeaders}
          collapsed={collapsed}
          userLabel={userLabel}
          roleLabel={roleLabel}
          onLogout={() => logout()}
        />
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
