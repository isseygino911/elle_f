import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const eyebrow = 'Summer Violin Camp · Two Weeks'
const headline = 'Hi, I’m Elle — I’ll be your violin teacher this summer.'
const subcopy =
  'I’ve played the violin since I was five — twelve years now, with performances along the way. I live in New York, and I can’t wait to spend these two weeks sharing the violin with you.'

// Two distinct per-breakpoint layouts (Stitch "Lumina Precision" reference:
// separate mobile and desktop hero screens, not one design squeezed to fit
// both) rather than one grid reflowing at a breakpoint:
//   - Mobile: the photo is a framed portrait card sitting above the text
//     (matches small-screen reading order: image, then headline, then CTA).
//   - Desktop: the photo becomes a full-bleed background with the text
//     overlaid on a left-to-right scrim, so the photograph and the
//     headline share the same frame instead of splitting into two columns.
// `md:hidden` / `hidden md:block` toggles between them — both render the
// same <img> src so the browser only ever fetches it once.
export default function LandingHero() {
  return (
    <section className="relative">
      {/* Mobile layout */}
      <div className="flex flex-col gap-6 px-5 pt-8 pb-14 md:hidden">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border">
          <img
            src="/landing/hero-recital.jpg"
            alt="Elle performing violin on stage in a pink gown beside a grand piano at a recital."
            width={904}
            height={1196}
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="flex flex-col gap-4">
          <p className="m-0 text-sm font-medium tracking-wide text-primary uppercase">{eyebrow}</p>
          <h1 className="m-0 text-[2.5rem] leading-[1.1] font-black tracking-tight text-balance text-foreground">
            {headline}
          </h1>
          <p className="m-0 max-w-sm text-base leading-relaxed text-muted-foreground">{subcopy}</p>
          <Link
            to="/login"
            className={cn(buttonVariants({ size: 'lg' }), 'h-12 w-full rounded-full text-base font-bold')}
          >
            Log in
          </Link>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="relative hidden min-h-[92vh] items-center overflow-hidden md:flex">
        <div className="absolute inset-0">
          <img
            src="/landing/hero-recital.jpg"
            alt="Elle performing violin on stage in a pink gown beside a grand piano at a recital."
            width={904}
            height={1196}
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-(--content-max-width) px-8 [--content-max-width:72rem] lg:px-16">
          <div className="flex max-w-xl flex-col gap-6">
            <span className="inline-flex w-fit items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold tracking-widest text-primary uppercase">
              {eyebrow}
            </span>
            <h1 className="m-0 text-[clamp(2.75rem,2rem+3.5vw,5.5rem)] leading-[1.04] font-black tracking-tight text-balance text-foreground">
              {headline}
            </h1>
            <p className="m-0 max-w-md text-xl leading-relaxed text-muted-foreground">{subcopy}</p>
            <div className="mt-2 flex flex-wrap gap-4">
              <Link
                to="/login"
                className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-lg px-8 text-base font-bold')}
              >
                Log in
              </Link>
              <a
                href="#letter"
                className="flex h-12 items-center rounded-lg border border-border px-8 text-base font-bold text-foreground transition-colors hover:bg-card"
              >
                Read my letter
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
