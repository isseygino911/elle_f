import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

// Fixed (not just sticky) top bar with a blurred dark surface — the Stitch
// "Lumina Precision" reference nav pattern (backdrop-blur, border-b hairline,
// wordmark left, in-page anchor links center, filled CTA right). Fixed
// positioning takes it out of flow, so LandingPage adds matching top padding
// to the content below it.
//
// The reference nav links to other pages (Performances/Teaching/Contact)
// that don't exist here — this is a single real page, not a multi-page
// studio site — so the links are in-page anchors to sections that actually
// exist (#letter, #photos, #camp) rather than invented destinations.
export default function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-sticky)] h-16 border-b border-border bg-background/80 backdrop-blur-md md:h-20">
      <div className="mx-auto flex h-full w-full max-w-(--content-max-width) items-center justify-between px-5 [--content-max-width:72rem] md:px-8">
        <a href="#" className="font-heading text-lg font-extrabold tracking-tight text-foreground">
          Elle
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-sm font-semibold text-primary">
            Home
          </a>
          <a
            href="#letter"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            My Letter
          </a>
          <a
            href="#camp"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            Camp Days
          </a>
          <a
            href="#photos"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            Photos
          </a>
        </nav>
        <Link to="/login" className={cn(buttonVariants({ size: 'sm' }), 'h-9 rounded-full px-5 font-bold')}>
          Log in
        </Link>
      </div>
    </header>
  )
}
