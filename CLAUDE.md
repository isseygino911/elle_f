# elle_f — Student CRM client

React 18 + Vite + Tailwind v4. Talks to `elle_b` only.

## Run

```sh
npm run dev       # vite, http://localhost:5173
npm run build
```

Needs `elle_b` running on 4001. API base comes from `VITE_API_BASE_URL`.

## Layout

- `src/pages/` — one per route, wired in `src/App.jsx`
- `src/components/<feature>/` — feature-scoped components
- `src/components/ui/` — shadcn primitives; don't hand-edit, re-generate
- `src/api/client.js` — **every** API call goes through here
- `src/auth/` — `AuthContext.jsx`, `ProtectedRoute.jsx`
- `src/hooks/`, `src/lib/`, `src/constants/`

Import with the `@` alias (`@/components/...`), not deep relative paths.

## API calls

`src/api/client.js` is the single entry point. Add a named export there rather
than calling `fetch` from a component.

`request()` throws on non-2xx, with `error.status` and `error.body` set — so
callers catch, they don't check `response.ok`. Multipart uploads deliberately
bypass `request()` to avoid forcing a JSON `Content-Type`, but still go through
`parseJsonResponse()` so the throw behavior stays identical.

## UI

- Base UI (`@base-ui/react`) + shadcn, `cva` for variants, `cn()` for classes
- Tailwind v4 — config is CSS-first in `src/styles/`, there is no
  `tailwind.config.js`
- Icons: `lucide-react`
- Layout lives in `AppShell.jsx` / `Page.jsx` — use them, don't rebuild page chrome

Layout components document why the current design won. Read those comments
before changing them.

## Don't

- No formatter in this repo. Match surrounding style by hand; never run
  prettier or eslint --fix across files
- Don't add a dependency without asking
- Don't reach into `elle_b` — it's a separate repo and a separate deploy
