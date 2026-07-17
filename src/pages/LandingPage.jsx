import LandingHeader from '@/components/landing/LandingHeader'
import LandingHero from '@/components/landing/LandingHero'
import LandingBio from '@/components/landing/LandingBio'
import LandingGallery from '@/components/landing/LandingGallery'
import LandingFooter from '@/components/landing/LandingFooter'

// Public entry point ("/") — introduces Elle to prospective students/parents
// ahead of the invite-only login flow. Composes the landing sections in
// order: a slim sticky identity bar -> hero (full-bleed photo + intro + CTA)
// -> her letter to students -> a photo gallery -> a minimal footer. No
// business logic here; this page is purely presentational, matching the
// surrounding public/unauthenticated pages (LoginPage, RegisterPage) which
// are similarly just composition + markup.
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingBio />
        <LandingGallery />
      </main>
      <LandingFooter />
    </div>
  )
}
