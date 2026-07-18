import { Link } from 'react-router-dom'

// Minimal footer — repeats the page's only real destination (Log in) plus
// the same "Server status" link LoginPage already exposes. Nothing else is
// invented (no social links, no contact details not already in the repo).
// The wordmark echoes LandingHeader, bookending the page rather than
// trailing off into an unstyled link row.
//
// Uses --landing-bg-alt (the darkest tier in the Stitch "Lumina Precision"
// scale, only defined inside .landing-theme) rather than --background, so
// the footer reads as one shade grounded below the page canvas — matching
// the reference design's tonal banding — instead of blending flush into it.
export default function LandingFooter() {
  return (
    <footer className="border-t border-border bg-[var(--landing-bg-alt)]">
      <div className="mx-auto flex w-full max-w-(--content-max-width) flex-col items-center gap-4 px-5 py-10 text-center [--content-max-width:64rem] sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-base font-extrabold tracking-tight text-foreground">
            Elle
          </span>
          <p className="m-0 text-sm text-muted-foreground">Summer Violin Camp</p>
          <p className="m-0 text-xs text-muted-foreground/70">&copy; 2026 Elle&rsquo;s Summer Violin Camp</p>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/login" className="font-medium text-muted-foreground hover:text-primary">
            Log in
          </Link>
          <Link to="/status" className="font-medium text-muted-foreground hover:text-primary">
            Server status
          </Link>
        </nav>
      </div>
    </footer>
  )
}
