const highlights = [
  {
    image: '/landing/gallery-violin-shop.jpg',
    alt: 'Rows of violins hanging on display at the violin shop.',
    title: 'Choosing Your Violin',
    body: "On the first day, we'll pick out your own violin together at the shop — every instrument has its own character and sound.",
  },
  {
    image: '/landing/gallery-camp-group.jpg',
    alt: 'Elle standing with a group of camp students, each holding their violin case.',
    title: 'Music & Games',
    body: "Between lessons, we'll play fun music games and earn small prizes and rewards along the way.",
  },
  {
    image: '/landing/gallery-teaching-student.jpg',
    alt: "Elle helping a young student rest her violin correctly on her shoulder.",
    title: 'Share Your Thoughts',
    body: 'A short survey before each class ends means your thoughts and feelings are always heard.',
  },
]

// Stitch "Lumina Precision" reference has a centered heading + underline bar
// followed by a 3-card grid ("Shaping Future Virtuosos": Private Studio /
// Summer Camps / Masterclasses — three parallel service offerings for a
// multi-service academy). This is one tutor running one two-week camp, so
// the three cards became three real things that actually happen during
// that camp instead of three invented service lines; no per-card "Learn
// More" links either, since there's no separate destination behind them.
export default function LandingHighlights() {
  return (
    <section id="camp" className="bg-[var(--landing-bg-soft)] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-(--content-max-width) px-5 [--content-max-width:64rem] md:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <h2 className="m-0 mb-4 text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] leading-tight font-extrabold tracking-tight text-balance text-foreground">
            What we&rsquo;ll do together
          </h2>
          <div aria-hidden="true" className="mx-auto h-1 w-16 rounded-full bg-lime" />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="flex flex-col gap-4">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="m-0 text-xl font-bold text-foreground">{item.title}</h3>
              <p className="m-0 text-base leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
