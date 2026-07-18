// Elle's real welcome letter (client/bio.txt), presented as a letter rather
// than marketing bullet points — Chinese paragraph immediately followed by
// its English rendering, section by section, matching the letter's own
// structure: greeting -> self-intro -> shop day -> camp activities ->
// closing. No tabs/toggle (none exist in this app's ui/ primitives, and the
// brand voice favors "everything visible" over hiding content).
const letterSections = [
  {
    zh: '亲爱的同学们:\n大家好!',
    en: 'Dear students, hello!',
  },
  {
    zh: '我叫Elle，很高兴能在接下来两周的小提琴夏令营中担任你们的小提琴老师!先来介绍一下我自己:我住在纽约，今年17岁。我从5岁开始学小提琴，到现在已经学了12年，也参加过许多演出。我非常喜欢音乐，也很期待和大家一起分享学习小提琴的乐趣!',
    en: "My name is Elle, and I'm so glad to be your violin teacher for the next two weeks of summer camp! A little about me: I live in New York, and I'm seventeen this year. I started learning violin at five years old — twelve years now — and I've performed in many concerts along the way. I love music, and I can't wait to share the joy of learning violin with all of you!",
  },
  {
    zh: '在我们见面的第一天，我们会一起到小提琴店挑选自己的小提琴。每一把小提琴都有不同的特色和声音:你们可以亲自试试看，挑选一把最适合自己、最喜欢的小提琴。下方会有分组资讯以及和我在琴行见面的时间。',
    en: "On the first day we meet, we'll go together to the violin shop to pick out your own violin. Every violin has its own character and sound — you'll get to try them yourself and choose the one that suits you best and that you love most. Group details and the time to meet me at the shop will be shared separately.",
  },
  {
    zh: '在夏令营期间，我们除了学习小提琴之外，还会玩有趣的音乐游戏、获得小奖品和奖励，并一起度过开心的时光!每堂课结束前，也会有一份简短的小问卷，让大家分享自己的想法和感受:',
    en: "During camp, besides learning violin, we'll also play fun music games, earn small prizes and rewards, and spend happy time together! Before each class ends, there will be a short survey where you can share your own thoughts and feelings.",
  },
  {
    zh: '我非常期待见到大家，认识每一位新朋友，和你们一起学习、一起进步、一起享受音乐!',
    en: "I'm really looking forward to meeting everyone, getting to know each new friend, and learning, growing, and enjoying music together with you!",
  },
]

// Stitch "Lumina Precision" reference layout for this section: a framed
// portrait with corner-bracket accents beside a short intro + a pair of
// stat tiles, followed by the longer-form content below. The two stats are
// real facts pulled straight from her letter (five years old / twelve years
// now) rather than the reference's invented "500+ Students Mentored" —
// this is one tutor with one two-week camp, not a multi-decade studio.
const stats = [
  { value: '12+', label: 'Years Playing' },
  { value: '5', label: 'Age She Started' },
]

export default function LandingBio() {
  return (
    <section id="letter" className="border-y border-border bg-card">
      <div className="mx-auto flex w-full max-w-(--content-max-width) flex-col gap-16 px-5 py-16 [--content-max-width:64rem] sm:py-20 md:px-8">
        {/* About: framed portrait + stat pair, matching the reference's
            corner-bracket + stat-tile treatment. */}
        <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
          <div className="relative mx-auto w-48 sm:w-56 md:mx-0 md:w-full">
            <div
              aria-hidden="true"
              className="absolute -top-4 -left-4 hidden size-16 border-t-2 border-l-2 border-primary/40 md:block"
            />
            <div
              aria-hidden="true"
              className="absolute -right-4 -bottom-4 hidden size-16 border-r-2 border-b-2 border-primary/40 md:block"
            />
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border shadow-md">
              <img
                src="/landing/portrait-headshot.jpg"
                alt="Black-and-white studio portrait of Elle holding her violin."
                width={1179}
                height={2556}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold tracking-widest text-primary uppercase">About me</span>
              <h2 className="m-0 text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] leading-tight font-extrabold tracking-tight text-balance text-foreground">
                A little about me
              </h2>
              <p className="m-0 text-lg leading-relaxed text-muted-foreground">
                I started lessons when I was five, and twelve years (and more recitals than I can count)
                later, I still love this instrument as much as ever. This summer, I&rsquo;m looking
                forward to sharing that with you.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-background px-6 py-5 text-center"
                >
                  <div className="text-3xl font-extrabold text-primary">{stat.value}</div>
                  <div className="mt-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The full letter — unique real content the reference template has
            no equivalent for, so it isn't borrowed from Stitch; it keeps
            running below the About block instead of being cut for layout
            parity. */}
        <div className="flex flex-col gap-8">
          <h3 className="m-0 text-2xl leading-tight font-extrabold tracking-tight text-balance text-foreground">
            A letter to my students
          </h3>
          <div className="flex flex-col gap-7">
            {letterSections.map((section) => (
              <div key={section.en} className="flex flex-col gap-2">
                <p className="m-0 text-lg leading-relaxed whitespace-pre-line text-foreground">
                  {section.zh}
                </p>
                <p className="m-0 text-lg leading-relaxed text-foreground">{section.en}</p>
              </div>
            ))}
          </div>
          <p className="m-0 text-base font-semibold text-foreground">&mdash; Elle</p>
        </div>
      </div>
    </section>
  )
}
