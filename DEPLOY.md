# Deploy Instructions — Client (frontend)

This repo (`elle_f`) is the React client only. The API lives in a separate
repo (`elle_b` — `https://github.com/isseygino911/elle_b.git`), which also
holds the shared VPS `Caddyfile` and full deploy docs (`DEPLOY.md` there),
since Caddy config is ops-level, not app-level.

Domain: `elle.isseylab.com`, served by Caddy as a static SPA build (no
Node process for this app in production — nothing here is
containerized/PM2-managed).

## Local development

1. Copy `.env.example` to `.env` in this directory:
   ```
   VITE_API_BASE_URL=http://localhost:4000
   ```
   (assumes the API repo's `npm run dev` is running locally on port 4000.)
2. `npm install`
3. `npm run dev`

## Production build (VPS — requires actual SSH access, not available here)

1. Pull this repo to the VPS: `git pull origin main`.
2. Create `.env.production` (gitignored, not committed) with:
   ```
   VITE_API_BASE_URL=https://api.isseylab.com
   ```
   Vite picks this up automatically for production builds.
3. `npm install`
4. `npm run build` — produces `dist/`, which Caddy serves as static files.
5. Point the `elle.isseylab.com` block in the API repo's `Caddyfile` at this
   repo's absolute `dist/` path on the VPS, then reload Caddy (see the API
   repo's `DEPLOY.md` for the exact command).

Redeploying after a client code change: `git pull origin main`, `npm run
build` again — no Caddy reload needed unless the `dist/` path itself moved.
