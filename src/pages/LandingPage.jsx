import { useEffect } from 'react'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingHero from '@/components/landing/LandingHero'
import LandingBio from '@/components/landing/LandingBio'
import LandingGallery from '@/components/landing/LandingGallery'
import LandingHighlights from '@/components/landing/LandingHighlights'
import LandingCta from '@/components/landing/LandingCta'
import LandingFooter from '@/components/landing/LandingFooter'

// Public entry point ("/") — introduces Elle to prospective students/parents
// ahead of the invite-only login flow. Composes the landing sections in
// order: a slim sticky identity bar -> hero (full-bleed photo + intro + CTA)
// -> her letter to students -> a photo gallery -> a minimal footer. No
// business logic here; this page is purely presentational, matching the
// surrounding public/unauthenticated pages (LoginPage, RegisterPage) which
// are similarly just composition + markup.
//
// `landing-theme` (global.css) scopes the Stitch "Lumina Precision" dark
// redesign to just this page/subtree — the CRM app itself stays light-first
// and is unaffected. `overflow-x-clip` is the belt-and-suspenders guard
// against any full-bleed child (hero image, gallery) pushing the viewport
// wider than 100vw on mobile.
export default function LandingPage() {
  // <body> itself is outside the `.landing-theme` div and keeps the CRM's
  // light --color-surface background. On mobile/trackpad overscroll
  // (rubber-banding past the top/bottom), that light body flashes behind
  // this otherwise all-dark page — jarring and reads as broken. Painting
  // the body directly for the lifetime of this page (reverted on unmount)
  // closes that gap without touching the shared light-first token set every
  // other route relies on.
  useEffect(() => {
    document.body.style.backgroundColor = '#0b1323'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className="landing-theme flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      <LandingHeader />
      {/* LandingHeader is `fixed` (Stitch nav pattern), so it's out of flow —
          this top padding matches its h-16/md:h-20 to keep the hero from
          sliding under it. */}
      <main className="flex-1 pt-16 md:pt-20">
        <LandingHero />
        <LandingBio />
        <LandingGallery />
        <LandingHighlights />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
