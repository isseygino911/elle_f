import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

// Public landing page hero. Fixes the "boxed and timid" photo treatment
// (a small aspect-[3/4] card competing 50/50 with text) by letting the
// recital photo bleed to the true viewport edge and run the full height of
// the section — the photograph IS half the design, not a thumbnail beside
// it (ui-ux-pro-max "Hero-Centric" pattern + impeccable brand register:
// "full-bleed hero imagery... let the photograph be the design"). No
// gradient scrim or glass card on top of it (unchanged from the prior
// version's PRODUCT.md-driven call) — text lives in its own column instead
// of overlaid on the image.
//
// The headline also gets a page-local type scale via an arbitrary clamp()
// value rather than the CRM's --text-2xl (1.75rem) ceiling: this is a
// marquee/portfolio surface, not dense app chrome, and legitimately needs a
// bigger scale (impeccable: hero ceiling ~6rem/96px; this tops out at
// 5.5rem/88px). No new colors — lime accent dot and buttonVariants reuse
// the app's existing tokens untouched.
export default function LandingHero() {
  return (
    <section className="grid md:min-h-[86vh] md:grid-cols-2">
      <div className="order-2 flex flex-col justify-center gap-6 px-5 py-14 sm:px-8 sm:py-20 md:order-1 md:px-12 md:py-16 lg:px-16">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-lime" />
          <p className="m-0 text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Summer Violin Camp &middot; Two Weeks
          </p>
        </div>
        <h1 className="m-0 max-w-xl text-[clamp(2.75rem,2rem+3.5vw,5.5rem)] leading-[1.04] font-black tracking-tight text-balance text-foreground">
          Hi, I&rsquo;m Elle &mdash; I&rsquo;ll be your violin teacher this summer.
        </h1>
        <p className="m-0 max-w-md text-lg leading-relaxed text-muted-foreground sm:text-xl">
          I&rsquo;ve played the violin since I was five &mdash; twelve years now, with performances along
          the way. I live in New York, and I can&rsquo;t wait to spend these two weeks sharing the
          violin with you.
        </p>
        <div className="mt-2">
          <Link
            to="/login"
            className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-md px-8 text-base font-semibold')}
          >
            Log in
          </Link>
        </div>
      </div>
      <div className="order-1 h-[52vh] min-h-[22rem] md:order-2 md:h-auto">
        <img
          src="/landing/hero-recital.jpg"
          alt="Elle performing violin on stage in a pink gown beside a grand piano at a recital."
          width={904}
          height={1196}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  )
}
