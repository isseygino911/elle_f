import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

// Stitch "Lumina Precision" reference closing section: a centered card with
// soft blurred glow blobs behind it, a headline, and two CTAs. Kept the
// framed card + glow treatment; the two buttons point at real destinations
// on this page/app (Log in, the photo gallery) rather than the reference's
// "Inquire Now" / "Join Waiting List" (no booking or waitlist exists here).
export default function LandingCta() {
  return (
    <section className="relative overflow-hidden px-5 py-20 sm:py-28 md:px-8">
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-primary/20 bg-card px-8 py-14 text-center sm:px-14 sm:py-16">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 size-56 rounded-full bg-primary/10 blur-[70px]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-20 size-56 rounded-full bg-primary/10 blur-[70px]"
        />
        <div className="relative flex flex-col items-center gap-6">
          <h2 className="m-0 text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] leading-tight font-extrabold tracking-tight text-balance text-foreground">
            Ready for summer?
          </h2>
          <p className="m-0 max-w-md text-lg leading-relaxed text-muted-foreground">
            Log in to see your booking details, or take one more look through the photos before camp
            starts.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-lg px-8 text-base font-bold')}
            >
              Log in
            </Link>
            <a
              href="#photos"
              className="flex h-12 items-center rounded-lg border border-primary/40 px-8 text-base font-bold text-primary transition-colors hover:bg-primary/5"
            >
              See camp photos
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
