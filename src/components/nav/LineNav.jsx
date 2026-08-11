import { useRef, useCallback, useEffect } from 'react'
import './LineNav.css'

// Cursor-proximity nav effect, adapted from React Bits' LineSidebar.
//
// The reference component owns its own items, its own active index and its
// own markup. None of that survives contact with an application rail: nav
// here is computed per role, labelled through t(), routed by NavLink and
// deep-linkable, so active state belongs to the router and not to a local
// integer. What is actually worth taking from the reference is the *motion
// model*, and that is all this file implements.
//
// So this is a behaviour wrapper, not a nav component. It renders no rows of
// its own — the caller passes its existing markup as children, and this adds
// the pointer tracking on top. That keeps NavLink, the role filtering, the
// tooltips and the keyboard path in exactly one place (AppShell) rather than
// forking them into a second nav implementation that would drift.
//
// The effect is applied to the whole rail: the reference measures against a
// single flat list, but this nav is grouped into sections, so the loop reads
// its rows from the DOM rather than from an items array. That also means a
// section appearing or disappearing with a role change needs no bookkeeping.

// From the reference: a smoothstep so the falloff eases in at the edge of the
// radius instead of arriving with a linear edge you can see travel.
const smoothstep = (p) => p * p * (3 - 2 * p)

// Rows within this many pixels of the cursor respond. Roughly two row heights
// on the 15rem rail, so about five rows are in play at once — enough for the
// column to read as a gradient rather than a single lit row.
const PROXIMITY_RADIUS = 96

// Exponential smoothing time constant, in ms. The reference default is 100.
const SMOOTHING = 90

// Below this delta a row is snapped to its target and considered settled; when
// every row is settled the loop stops rather than idling at 60fps forever.
const SETTLE_EPSILON = 0.0015

export default function LineNav({ collapsed = false, className = '', children }) {
  const rootRef = useRef(null)
  const rowsRef = useRef([])
  const targetsRef = useRef([])
  const currentRef = useRef([])
  const rafRef = useRef(null)
  const lastRef = useRef(0)

  // Read once per pointer session rather than per frame. Not a piece of state:
  // it gates whether the loop runs at all, and re-rendering on it would serve
  // no purpose since the CSS in LineNav.css already neutralises the effect.
  const prefersReducedMotion = useCallback(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // One rAF loop easing every row toward its target, from the reference. The
  // smoothing is frame-rate independent (dt-driven, not a fixed per-frame
  // fraction) so the settle takes the same wall-clock time on a 60Hz and a
  // 120Hz display instead of arriving twice as fast on the latter.
  const runFrame = useCallback(
    (now) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05)
      lastRef.current = now
      const tau = SMOOTHING / 1000
      const k = 1 - Math.exp(-dt / tau)

      let moving = false
      const rows = rowsRef.current

      for (let i = 0; i < rows.length; i++) {
        const el = rows[i]
        if (!el) continue

        const target = targetsRef.current[i] || 0
        const cur = currentRef.current[i] || 0
        const next = cur + (target - cur) * k
        const settled = Math.abs(target - next) < SETTLE_EPSILON
        const value = settled ? target : next

        currentRef.current[i] = value
        // Written straight to the node, deliberately bypassing React. This
        // runs every frame while the pointer moves; routing it through state
        // would re-render the entire rail — eleven NavLinks, their tooltips
        // and the account menu — sixty times a second.
        el.style.setProperty('--effect', value.toFixed(4))

        if (!settled) moving = true
      }

      rafRef.current = moving ? requestAnimationFrame(runFrame) : null
    },
    []
  )

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return
    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(runFrame)
  }, [runFrame])

  // Rows are read from the DOM on each pointer session rather than cached, so
  // a role change, a collapsed toggle or a section filtering itself out needs
  // no invalidation step.
  const readRows = useCallback(() => {
    const root = rootRef.current
    if (!root) return []
    rowsRef.current = Array.from(root.querySelectorAll('[data-line-nav-row]'))
    return rowsRef.current
  }, [])

  const handlePointerMove = useCallback(
    (event) => {
      // A touch tap reports as a pointer event with no meaningful hover, so
      // the effect would fire once on tap and stick until the next tap. It is
      // a cursor affordance; without a cursor there is nothing to afford.
      if (event.pointerType !== 'mouse') return
      if (prefersReducedMotion()) return

      const root = rootRef.current
      if (!root) return

      const rows = readRows()
      if (rows.length === 0) return

      const rootTop = root.getBoundingClientRect().top
      const pointerY = event.clientY - rootTop

      for (let i = 0; i < rows.length; i++) {
        const el = rows[i]
        if (!el) continue
        // offsetTop is relative to the nearest positioned ancestor, which is
        // the root (.line-nav is position: relative). Measured per frame
        // rather than cached because the rail scrolls, and a cached offset
        // would light the wrong row after any scroll.
        const center = el.offsetTop + el.offsetHeight / 2
        const distance = Math.abs(pointerY - center)
        const proximity = Math.max(0, 1 - distance / PROXIMITY_RADIUS)
        targetsRef.current[i] = smoothstep(proximity)
      }

      startLoop()
    },
    [prefersReducedMotion, readRows, startLoop]
  )

  // Eased back to zero rather than cleared outright, so the column relaxes
  // when the cursor leaves instead of every lit row snapping dark at once.
  const handlePointerLeave = useCallback(() => {
    const rows = rowsRef.current
    for (let i = 0; i < rows.length; i++) targetsRef.current[i] = 0
    startLoop()
  }, [startLoop])

  // The collapsed rail withdraws the treatment entirely (see LineNav.css), so
  // any --effect written before the toggle would otherwise stay painted on
  // whichever row the cursor last passed, and be waiting there on expand.
  useEffect(() => {
    if (!collapsed) return
    stopLoop()
    const rows = rowsRef.current
    for (let i = 0; i < rows.length; i++) {
      targetsRef.current[i] = 0
      currentRef.current[i] = 0
      if (rows[i]) rows[i].style.removeProperty('--effect')
    }
  }, [collapsed, stopLoop])

  useEffect(() => stopLoop, [stopLoop])

  return (
    <div
      ref={rootRef}
      className={`line-nav${collapsed ? ' line-nav--collapsed' : ''}${className ? ` ${className}` : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  )
}
