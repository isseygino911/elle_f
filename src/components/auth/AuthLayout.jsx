import AuroraPanel from './AuroraPanel.jsx'

/*
  The shared shell for every public auth screen: an inset rounded frame on a
  dark ground, form column on one side, decorative animated panel on the other.

  This markup started life inline in LoginPage. It was extracted once the rest
  of the auth pages needed the same treatment — leaving it in place would have
  meant two implementations of the same split-screen, and the one nobody was
  looking at would have drifted.

  ## Why the <h1> lives here

  Every page used to hand-roll its own <h1>. The global @layer base rule sets
  the heading font and weight but no SIZE, so each one rendered at the browser
  default 2em with no way to tune it short of editing every page. Owning the
  heading here makes that a single decision.

  ## Why `aside` is a prop rather than fixed copy

  "Plan the week. Teach the lesson." is right for a login screen and wrong for
  someone who just clicked a password-reset link. Per-page copy makes the panel
  read as authored rather than as wallpaper. Omitting `aside` drops the panel
  entirely and centres the form — which is what the terminal states of the
  multi-step pages want, since there is no form left to balance.

  ## Multi-state pages must render ONE of these

  Pages with several branches (register, reset, forgot) should compute `title`
  and `children` per state and render a single AuthLayout, never one per
  branch. Returning a different AuthLayout per branch remounts it, which
  restarts the aurora drift from frame 0 and re-fires the field entrance on
  every state change — the panel would visibly jump the moment a token check
  resolved.
*/
export default function AuthLayout({ title, description, aside, footer, children }) {
  const hasAside = Boolean(aside)

  return (
    // overflow-hidden on the frame is load-bearing: the aurora blobs are wider
    // than their panel and would otherwise paint over the rounded corners.
    <div className="min-h-screen bg-dark p-3 sm:p-4">
      <div
        className={`grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-dark-border bg-background sm:min-h-[calc(100vh-2rem)] ${
          hasAside ? 'md:grid-cols-2' : ''
        }`}
      >
        {/*
          `auth-form` is the hook for the auth-only control density and the
          field entrance in global.css. It is set here rather than per page so
          no page can forget it.
        */}
        <main className="auth-form flex flex-col justify-center gap-6 px-5 py-10 sm:px-8">
          <div className="mx-auto flex w-full max-w-(--narrow-max-width) flex-col gap-5 [--narrow-max-width:26rem]">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl leading-tight">{title}</h1>
              {description && (
                <p className="text-pretty text-sm text-muted-foreground">{description}</p>
              )}
            </div>

            {children}

            {footer && <div className="flex flex-col gap-2">{footer}</div>}
          </div>
        </main>

        {/*
          Decorative only: aria-hidden, and carrying no heading that would
          compete with the form's own <h1>. Content is pinned low with
          justify-end — the headline sitting against open space above it is
          what keeps the panel feeling unhurried rather than filled.
        */}
        {hasAside && (
          <aside
            aria-hidden="true"
            className="relative hidden flex-col justify-end overflow-hidden bg-dark p-10 md:flex lg:p-12"
          >
            <AuroraPanel />
            {/*
              The aurora has to stay bright enough to read as colour, but the
              headline sits on top of it and orgThemes ships accents as light
              as amber and lime. A bottom-weighted scrim darkens only the band
              the text occupies, so the copy holds its contrast on every
              palette without dimming the whole panel for the worst case.
            */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-dark/80 via-dark/40 to-transparent" />
            <div className="relative z-10">
              {/*
                Mixed-weight headline: most of the line muted, the clause that
                matters at full strength. Lets one sentence carry emphasis
                without needing a second type size.
              */}
              <p className="max-w-sm text-balance font-heading text-3xl leading-snug text-dark-muted lg:text-4xl">
                {aside.headline} <span className="text-white">{aside.emphasis}</span>
              </p>
              {aside.sub && (
                <p className="mt-4 max-w-xs text-pretty text-sm text-dark-muted">{aside.sub}</p>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
