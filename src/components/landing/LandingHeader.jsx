import { Link } from 'react-router-dom'

// Slim, always-visible identity bar — the one piece of "this is a real site,
// not just a single hero block" affordance the previous version lacked.
// Sticky (reusing the app's own --z-sticky token, tokens.css) so the login
// path stays reachable without scrolling back up, matching the landing
// pattern's "sticky nav CTA" convention. Solid background, no blur/glass —
// PRODUCT.md bans glassmorphism-as-decoration.
export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-(--content-max-width) items-center justify-between px-5 py-4 [--content-max-width:64rem]">
        <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">Elle</span>
        <Link
          to="/login"
          className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          Log in
        </Link>
      </div>
    </header>
  )
}
