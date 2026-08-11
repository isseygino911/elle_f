// The accent palettes an organization can wear.
//
// WHY THIS FILE HOLDS THE COLORS AND THE SERVER HOLDS ONLY A NAME
//
// The API stores a slug ('ocean'), never a hex or a gradient string. That
// value reaches CSS custom properties on every member's screen, so letting it
// be arbitrary text would hand a tenant owner a stylesheet-injection surface
// against their own users. Keeping the colors here also means refining a
// gradient is a diff in this file rather than a data migration over stored
// hex. The mirror of these slugs lives in elle_b/src/constants/theme.js.
//
// HOW A PALETTE ACTUALLY REPAINTS THE APP
//
// global.css registers the accent as `@theme inline`, so every `bg-lime` /
// `text-lime` / `ring-lime/50` utility in the codebase compiles to a
// `var(--color-lime)` reference that is resolved at use time, not at build
// time. Overriding those four variables on <html> therefore retints the whole
// app -- sidebar, active nav pill, focus rings, badges -- without touching a
// single component. `accent` below is exactly the token set tokens.css
// defines; 'lime' reproduces its values byte-for-byte so the default theme is
// visually identical to what shipped before this feature.
//
// CONTRAST IS PART OF THE PALETTE, NOT AN AFTERTHOUGHT
//
// `on` is the text/glyph color that sits ON the accent (the active nav icon,
// a filled button label). tokens.css verifies these ratios in comments and so
// does this file: every `on` below clears 4.5:1 against its own accent, which
// is what makes it safe to swap the accent globally. Ratios are computed with
// the WCAG 2.1 relative-luminance formula and noted per palette; the 4.5:1
// floor is enforced, not merely documented, by
// elle_b/test/organization/theme.test.js.
//
// Note that white is NOT a usable glyph color on any of these accents (it
// ranges from 1.40:1 on lime to 3.37:1 on violet), which is why `on` is chosen
// per palette rather than fixed app-wide.

// The sidebar gradient. This is the one place a theme is a gradient rather
// than a flat accent: it fills the whole navigation rail, so the palette is
// visible on every screen rather than only behind the brand mark. Applying a
// gradient to the accent token itself is not possible -- `--color-lime` is
// consumed by `background-color`, `border-color` and `color`, none of which
// accept a gradient - hence a separate variable that only the rail consumes.
//
// WHY THESE GRADIENTS ARE MUCH DARKER THAN A BRAND HEADER'S WOULD BE
//
// They previously painted a ~56px brand card, where a saturated mid-stop read
// as a deliberate brand moment. Stretched over a full-height rail the same
// colors compete with the nav rows sitting on them: the active pill is filled
// with the accent, and hover is `--color-card-dark-hover`, both of which need
// the surface beneath to stay near the app's own dark canvas to separate from
// it. So each gradient below is a *tint*, not a fill -- it starts as a
// hue-shifted near-black at the top and resolves to the rail's own
// `--color-bg-dark` by the bottom -- written as the variable rather than a
// literal, because tokens.css now derives that canvas from the accent too, so
// a hardcoded end stop would leave the foot of the rail sitting 149 degrees of
// hue away from the page it runs into. Top stops sit around 8-13%
// luminance, which keeps every one of them under 1.5:1 against the canvas: the
// tenant's color is legible as a wash without becoming a second surface the
// nav has to fight. Vertical (180deg) rather than the old 135deg diagonal,
// since on a tall narrow rail a diagonal band reads as a rendering artifact.
export const ORGANIZATION_THEMES = [
  {
    slug: 'lime',
    // The palette tokens.css already shipped. Kept first so the default is
    // also the visually-unchanged option.
    accent: {
      base: '#c6e83a',
      hover: '#b4d62c',
      on: '#1a2100', // 11.89:1 on base -- verified in tokens.css
    },
    // Olive-tinted near-black settling into the rail's own canvas.
    gradient: 'linear-gradient(180deg, #171e0b 0%, #11170d 45%, var(--color-bg-dark) 100%)',
  },
  {
    slug: 'violet',
    // The app's existing Accent 2, promoted to a full theme.
    accent: {
      base: '#8b7cf0',
      hover: '#7a69ec',
      on: '#0f172a', // 5.30:1 on base -- verified in tokens.css
    },
    gradient: 'linear-gradient(180deg, #171436 0%, #131228 45%, var(--color-bg-dark) 100%)',
  },
  {
    slug: 'ocean',
    accent: {
      base: '#38bdf8',
      hover: '#0ea5e9',
      on: '#052430', // 7.53:1 on base
    },
    gradient: 'linear-gradient(180deg, #0a2634 0%, #0a1c28 45%, var(--color-bg-dark) 100%)',
  },
  {
    slug: 'coral',
    accent: {
      base: '#fb7185',
      hover: '#f43f5e',
      on: '#2b0710', // 6.84:1 on base -- white would fail here at 2.69:1,
      // which is exactly why `on` is per-palette rather than a single
      // app-wide choice.
    },
    gradient: 'linear-gradient(180deg, #300a17 0%, #200d19 45%, var(--color-bg-dark) 100%)',
  },
  {
    slug: 'amber',
    accent: {
      base: '#fbbf24',
      hover: '#f59e0b',
      on: '#2a1a00', // 10.09:1 on base
    },
    gradient: 'linear-gradient(180deg, #2a1c06 0%, #1c1610 45%, var(--color-bg-dark) 100%)',
  },
  {
    slug: 'forest',
    accent: {
      base: '#34d399',
      hover: '#10b981',
      on: '#04231a', // 8.67:1 on base
    },
    gradient: 'linear-gradient(180deg, #082a20 0%, #091d1c 45%, var(--color-bg-dark) 100%)',
  },
  // ---- Added alongside the sidebar-wash change ----
  //
  // Chosen to widen the *hue* range rather than to lengthen the list: each
  // one below is a hue the first six do not already cover. Gold, crimson and
  // mint were considered and dropped as near-duplicates of amber, coral and
  // forest -- two swatches an owner cannot tell apart is a worse picker than
  // six they can.
  {
    slug: 'rose',
    // Pink proper, not coral's red-orange -- the two read as different
    // choices side by side in the picker.
    accent: {
      base: '#f472b6',
      hover: '#ec4899',
      on: '#2b0417', // 7.00:1 on base
    },
    gradient: 'linear-gradient(180deg, #2e0b20 0%, #1f0d1b 45%, var(--color-bg-dark) 100%)',
  },
  {
    slug: 'cyan',
    // Brighter and greener than ocean, which is a mid blue.
    accent: {
      base: '#22d3ee',
      hover: '#06b6d4',
      on: '#03242b', // 9.00:1 on base
    },
    gradient: 'linear-gradient(180deg, #06272e 0%, #081d26 45%, var(--color-bg-dark) 100%)',
  },
  {
    slug: 'teal',
    // Between cyan and forest: blue-green rather than either.
    accent: {
      base: '#2dd4bf',
      hover: '#14b8a6',
      on: '#032b26', // 8.19:1 on base
    },
    gradient: 'linear-gradient(180deg, #062b28 0%, #081e21 45%, var(--color-bg-dark) 100%)',
  },
  {
    slug: 'indigo',
    // Deep blue-violet -- violet's neighbour but markedly cooler, and the
    // most conservative of the new set.
    accent: {
      base: '#818cf8',
      hover: '#6366f1',
      on: '#0b0f36', // 6.20:1 on base -- the tightest pairing here, still
      // clear of the 4.5:1 floor.
    },
    gradient: 'linear-gradient(180deg, #12173a 0%, #101529 45%, var(--color-bg-dark) 100%)',
  },
  {
    slug: 'plum',
    // Warm purple, where violet and indigo are both cool.
    accent: {
      base: '#c084fc',
      hover: '#a855f7',
      on: '#230733', // 6.91:1 on base
    },
    gradient: 'linear-gradient(180deg, #241035 0%, #1a1029 45%, var(--color-bg-dark) 100%)',
  },
  {
    slug: 'slate',
    // The deliberate no-hue option: an organization that wants the app to
    // stay neutral still has to pick *something*, and forcing them onto a
    // colored accent to get a plain rail is the wrong default. The gradient
    // is a pure lightness ramp, so this reads as "off" rather than as a
    // thirteenth color.
    accent: {
      base: '#94a3b8',
      hover: '#7c8ba1',
      on: '#0b1220', // 7.30:1 on base
    },
    gradient: 'linear-gradient(180deg, #1a2030 0%, #131826 45%, var(--color-bg-dark) 100%)',
  },
]

export const DEFAULT_ORGANIZATION_THEME = 'lime'

// Unknown slugs resolve to the default rather than throwing. A theme the
// server accepted but this build has no palette for (a rollout where the API
// is ahead of the bundle) must degrade to a working app, not a blank one.
export function resolveTheme(slug) {
  return (
    ORGANIZATION_THEMES.find((theme) => theme.slug === slug) ||
    ORGANIZATION_THEMES.find((theme) => theme.slug === DEFAULT_ORGANIZATION_THEME)
  )
}

// Push a palette onto the document root, where the `@theme inline` accent
// variables are resolved from.
//
// Written as inline styles on <html> rather than as six `.theme-*` classes in
// global.css for one reason: a class per palette would duplicate the color
// values into CSS, leaving two lists to keep in step. This keeps the palette
// definitions above as the only place a color is written.
export function applyThemeToDocument(slug) {
  const theme = resolveTheme(slug)
  const root = document.documentElement

  root.style.setProperty('--color-lime', theme.accent.base)
  root.style.setProperty('--color-lime-hover', theme.accent.hover)
  root.style.setProperty('--color-on-lime', theme.accent.on)
  root.style.setProperty('--color-sidebar-gradient', theme.gradient)

  // Lets CSS and tests key off the active palette without re-reading the
  // individual variables.
  root.dataset.orgTheme = theme.slug
}
