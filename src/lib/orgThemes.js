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

// The sidebar brand gradient. This is the one place a theme is a gradient
// rather than a flat accent: it paints the rail's brand header behind the
// logo and wordmark, where a soft two-stop wash reads as intentional
// branding. Applying a gradient to the accent token itself is not possible --
// `--color-lime` is consumed by `background-color`, `border-color` and
// `color`, none of which accept a gradient - hence a separate variable that
// only the brand header consumes.
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
    // Lime into a deeper chartreuse: same family, so the wordmark's own lime
    // still reads against it.
    gradient: 'linear-gradient(135deg, #1a2b0a 0%, #2f4a12 55%, #47701c 100%)',
  },
  {
    slug: 'violet',
    // The app's existing Accent 2, promoted to a full theme.
    accent: {
      base: '#8b7cf0',
      hover: '#7a69ec',
      on: '#0f172a', // 5.30:1 on base -- verified in tokens.css
    },
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #372f7a 55%, #5b4bc4 100%)',
  },
  {
    slug: 'ocean',
    accent: {
      base: '#38bdf8',
      hover: '#0ea5e9',
      on: '#052430', // 7.53:1 on base
    },
    gradient: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 55%, #0e7490 100%)',
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
    gradient: 'linear-gradient(135deg, #4c0519 0%, #831843 55%, #be3455 100%)',
  },
  {
    slug: 'amber',
    accent: {
      base: '#fbbf24',
      hover: '#f59e0b',
      on: '#2a1a00', // 10.09:1 on base
    },
    gradient: 'linear-gradient(135deg, #3b2506 0%, #7c4a0a 55%, #b45309 100%)',
  },
  {
    slug: 'forest',
    accent: {
      base: '#34d399',
      hover: '#10b981',
      on: '#04231a', // 8.67:1 on base
    },
    gradient: 'linear-gradient(135deg, #052e23 0%, #065f46 55%, #0f8a63 100%)',
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
  root.style.setProperty('--color-brand-gradient', theme.gradient)

  // Lets CSS and tests key off the active palette without re-reading the
  // individual variables.
  root.dataset.orgTheme = theme.slug
}
