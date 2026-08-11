/*
  The login panel's animated background: three large, heavily blurred color
  fields drifting slowly behind the panel content.

  Every blob is painted from a palette *variable* (--color-lime, --color-violet)
  rather than a literal hex or a canvas/WebGL uniform. That distinction is the
  whole point of the component. applyThemeToDocument() in lib/orgThemes.js
  repaints --color-lime on <html> whenever a tenant palette loads, so a
  variable-driven background restyles itself with no re-render, no resize
  observer, and no JS reading computed styles. A shader would have sampled the
  color once at mount and then quietly shown the wrong palette forever.

  --color-violet is deliberately the middle blob: it is the one accent
  orgThemes never overrides, so every tenant keeps a common thread through the
  composition and no palette collapses into a single flat hue.

  Motion lives in the .aurora-blob class in styles/global.css (transform only,
  so it stays on the compositor) — see that rule for the reduced-motion
  fallback.
*/
export default function AuroraPanel() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="aurora-blob aurora-blob-1"
        style={{ background: 'var(--color-lime)' }}
      />
      <div
        className="aurora-blob aurora-blob-2"
        style={{ background: 'var(--color-violet)' }}
      />
      <div
        className="aurora-blob aurora-blob-3"
        style={{ background: 'var(--color-lime-hover)' }}
      />
    </div>
  )
}
