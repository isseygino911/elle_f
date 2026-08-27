import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MANUAL_CONTENT, MANUAL_SECTIONS } from './manualContent.js'

// The user manual, readable without an account. A teacher or student arrives
// by invitation knowing nothing about the app, so this has to work before
// login — which is also why it carries its own language toggle rather than
// reading LanguageContext: the app's language setting lives behind the login
// and a visitor here has not chosen one yet.
//
// Deliberately NOT on AuthLayout (same reasoning as StatusPage): there is no
// form here, and the decorative auth panel is the wrong frame for a document
// someone reads at length.

const LANG_KEY = 'arco.manual.lang'

// Content blocks come from manualContent.js as data, never HTML strings, so
// there is no dangerouslySetInnerHTML anywhere in this file.
function Spans({ content }) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return null
  return content.map((part, n) => {
    if (part.code) {
      return (
        <code
          key={n}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {part.t}
        </code>
      )
    }
    if (part.b) return <strong key={n} className="font-semibold text-foreground">{part.t}</strong>
    if (part.i) return <em key={n}>{part.t}</em>
    return <span key={n}>{part.t}</span>
  })
}

function Block({ node }) {
  switch (node.k) {
    case 'h': {
      // The file's own H1 is dropped — the page header already names the role,
      // and a second title inside the body reads as a duplicate.
      if (node.lvl === 1) return null
      const Tag = `h${Math.min(node.lvl, 4)}`
      const size =
        node.lvl === 2
          ? 'mt-10 text-xl font-semibold tracking-tight'
          : node.lvl === 3
            ? 'mt-7 text-base font-semibold'
            : 'mt-5 text-sm font-semibold text-muted-foreground'
      return (
        <Tag className={`${size} scroll-mt-24 text-foreground`}>
          <Spans content={node.c} />
        </Tag>
      )
    }
    case 'p':
      return (
        <p className="mt-3 leading-relaxed text-muted-foreground">
          <Spans content={node.c} />
        </p>
      )
    case 'ul':
      return (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground marker:text-border">
          {node.items.map((it, n) => (
            <li key={n} className="leading-relaxed">
              <Spans content={it} />
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-muted-foreground marker:text-muted-foreground">
          {node.items.map((it, n) => (
            <li key={n} className="leading-relaxed">
              <Spans content={it} />
            </li>
          ))}
        </ol>
      )
    case 'quote':
      return (
        <blockquote className="mt-4 border-l-2 border-primary bg-muted/40 px-4 py-3 [&>p:first-child]:mt-0">
          {node.c.map((child, n) => (
            <Block key={n} node={child} />
          ))}
        </blockquote>
      )
    case 'table':
      // Wide tables scroll inside their own container so the page body never
      // scrolls sideways on a phone.
      return (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {node.head.map((c, n) => (
                  <th
                    key={n}
                    style={{ textAlign: node.align[n] || 'left' }}
                    className="px-3 py-2 font-semibold whitespace-nowrap text-foreground"
                  >
                    <Spans content={c} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {node.rows.map((row, rn) => (
                <tr key={rn} className="border-b border-border last:border-0">
                  {row.map((c, n) => (
                    <td
                      key={n}
                      style={{ textAlign: node.align[n] || 'left' }}
                      className="px-3 py-2 align-top text-muted-foreground"
                    >
                      <Spans content={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'img':
      return (
        <figure className="mt-5">
          <img
            src={node.src}
            alt={node.cap}
            loading="lazy"
            className="w-full rounded-lg border border-border"
          />
          {node.cap && (
            <figcaption className="mt-2 text-xs text-muted-foreground">{node.cap}</figcaption>
          )}
        </figure>
      )
    case 'hr':
      return <hr className="mt-8 border-border" />
    default:
      return null
  }
}

const COPY = {
  en: {
    title: 'User manual',
    lede: 'How Arco works, for each of the four roles. Pick the one that matches your account.',
    back: '← Back to log in',
    onThisPage: 'On this page',
  },
  zh: {
    title: '使用手册',
    lede: 'Arco 的使用说明，按四种身份分别编写。请选择与你的账号相符的一种。',
    back: '← 返回登录',
    onThisPage: '本页内容',
  },
}

export default function ManualPage() {
  const [lang, setLang] = useState(() => {
    // Fall back to the browser's own preference, then English. Wrapped because
    // storage access throws outright in some privacy modes.
    try {
      const saved = localStorage.getItem(LANG_KEY)
      if (saved === 'en' || saved === 'zh') return saved
    } catch {
      /* storage unavailable — use the language check below */
    }
    return typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || '') ? 'zh' : 'en'
  })
  const [section, setSection] = useState('overview')
  const bodyRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      /* a viewer who can't persist the choice still gets it for this visit */
    }
  }, [lang])

  const copy = COPY[lang]
  const blocks = MANUAL_CONTENT[lang][section] || []

  // Section headings for the in-page jump list, keyed by their position in the
  // block list so a heading and its anchor cannot drift apart.
  const headings = useMemo(
    () =>
      blocks
        .map((b, n) => ({ b, n }))
        .filter(({ b }) => b.k === 'h' && b.lvl === 2)
        .map(({ b, n }) => ({
          id: `h-${n}`,
          text: typeof b.c === 'string' ? b.c : b.c.map((p) => p.t).join(''),
        })),
    [blocks],
  )

  function pickSection(key) {
    setSection(key)
    if (bodyRef.current) bodyRef.current.scrollIntoView({ block: 'start' })
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-sm text-muted-foreground">Arco</p>
          <h1 className="mt-1 text-3xl leading-tight font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">{copy.lede}</p>
        </div>
        {/*
          A two-state switch rather than a select: there are exactly two
          languages and both fit on one line, so a dropdown would hide half the
          choice behind a click.
        */}
        <div
          className="flex shrink-0 rounded-md border border-border p-0.5"
          role="group"
          aria-label="Language"
        >
          {[
            ['en', 'English'],
            ['zh', '中文'],
          ].map(([code, label]) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                lang === code
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label={copy.title}>
        {MANUAL_SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => pickSection(s.key)}
            aria-current={section === s.key ? 'page' : undefined}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              section === s.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground'
            }`}
          >
            {s[lang]}
          </button>
        ))}
      </nav>

      <div ref={bodyRef} className="mt-8 grid gap-10 lg:grid-cols-[1fr_13rem] lg:items-start">
        <article className="min-w-0 text-[0.95rem]">
          {blocks.map((node, n) =>
            node.k === 'h' && node.lvl === 2 ? (
              <div key={n} id={`h-${n}`} className="scroll-mt-6">
                <Block node={node} />
              </div>
            ) : (
              <Block key={n} node={node} />
            ),
          )}
        </article>

        {headings.length > 0 && (
          <aside className="hidden lg:block lg:sticky lg:top-6">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {copy.onThisPage}
            </p>
            <ul className="mt-3 space-y-1.5 border-l border-border">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className="-ml-px block border-l border-transparent py-0.5 pl-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      <footer className="mt-14 border-t border-border pt-6">
        <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
          {copy.back}
        </Link>
      </footer>
    </main>
  )
}
