# AGENTS.md — Edinburgh VenturePoint Website

Guidance for autonomous code agents working in this repository.

## Project Overview

Official website for **Edinburgh VenturePoint (EVP)**, an entrepreneurship society at the University of Edinburgh.
Live site: https://edinburghventurepoint.com — hosted on Tardis servers (https://tardisproject.uk).

**Current state (2026-09-10): mid-rewrite; frontend code-reviewed.** The backend was rewritten from Django to **FastAPI** (single module at `backend/src/main.py`) and exposes exactly **two endpoints** (`POST /api/contact-submit`, `POST /api/newsletter-subscribe`). On the frontend, the old `/subscribe` stub was replaced by a **`/connect` ("Get Involved") page** hosting the newsletter sign-up (`NewsletterSection`), the contact form (`ContactFormSection`), venture-scout applications, and a share section. The form UIs are complete but **not yet wired to the API** — building the API client layer and wiring both forms is the next planned task. A full frontend code review was performed on 2026-09-10; its findings (dead code, bugs, a11y issues) are recorded in the "Frontend code review findings (2026-09-10)" section below.

## Repository Layout

```
evp-website/
├── backend/                  # FastAPI app (single module)
│   ├── src/
│   │   ├── main.py           # FastAPI app, settings, both endpoints
│   │   └── __init__.py
│   ├── .env.example          # RESEND_API_KEY only
│   ├── pyproject.toml        # Python deps (managed with uv); [tool.fastapi] entrypoint = src.main:app
│   ├── uv.lock
│   └── Dockerfile            # python:3.12-slim base (currently broken — see Known Issues)
├── frontend/                 # React 19 + Vite + TypeScript SPA
│   ├── public/               # favicon.png, og-preview.png, robots.txt, sitemap.xml, theme-init.js, icons/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── index.css         # Tailwind 4 theme tokens, custom utilities & keyframes
│   │   ├── app/              # App shell: App.tsx, AppLayout.tsx, provider.tsx, router.tsx, routes/
│   │   ├── components/       # layout/ (header, footer, scroll), theme/, three/ (3D background), ui/ (shared UI)
│   │   ├── features/         # about, connect, contact, events, homepage, privacy, startups, subscribe
│   │   ├── utils/            # cn.ts, motion.ts
│   │   └── assets/
│   ├── package.json          # scripts: dev, build, lint (oxlint), format (prettier) — no test script
│   ├── vite.config.ts        # @/ path alias only — the old /api dev proxy was removed
│   └── Dockerfile            # node:24-alpine build stage → nginx:alpine-slim (working)
├── docs/                     # Documentation (specs.md PRD)
├── .github/workflows/deploy.yml  # CI/CD: test → build → GHCR → SSH deploy
├── docker-compose.yml        # Local dev orchestration (frontend, backend)
├── docker-compose.prod.yml   # Prod: pulls pre-built GHCR images (env_file: .env at repo root)
├── nginx.conf                # Repo-root Nginx config, mounted into the frontend container
├── evp-website.code-workspace
├── .gitignore                # Ignores the root-level prod `.env`
└── README.md
```

## Tech Stack

### Backend

- **Python ≥ 3.14** (`pyproject.toml` `requires-python`; CI sets up 3.14; the Dockerfile's `python:3.12-slim` base is stale — see Known Issues), managed with **uv**
- **FastAPI** (`fastapi[standard] >= 0.141.1`) with **Pydantic** validation and **pydantic-settings** for config — the entire app lives in `backend/src/main.py` (no router split yet)
- **Resend Python SDK** — the only external service. **No database**: both endpoints talk directly to Resend
- **Ruff** (linter; a project dependency)
- **Settings** (`Settings` in `main.py`): reads `backend/.env` via pydantic-settings; the only variable is `RESEND_API_KEY`. When unset, the app runs in **mock mode** — submissions are logged (`[MOCK RESEND]`) and return `204`
- **Two endpoints** (mounted under `/api/`):
  - `POST /api/contact-submit` → `204`. Body: `ContactForm {first_name, last_name, email: EmailStr, message}`. With Resend enabled: fetches the members of the hardcoded "Contact Handler" **segment** (`80b4d0a3-01f3-4ab6-ba24-2ba478ec2ea0`) and BCCs them a notification using the Resend template `contact-form-notification` (variables `SUBMITTER_FIRST_NAME`/`SUBMITTER_LAST_NAME`/`SUBMITTER_EMAIL`/`SUBMITTER_MESSAGE`), from `Edinburgh VenturePoint <noreply@mail.edinburghventurepoint.com>`. Returns `502` with a generic detail on any Resend failure; an empty segment logs the form and returns `204`
  - `POST /api/newsletter-subscribe` → `204`. Body: `NewsletterForm {email: EmailStr, first_name, last_name}`. Creates a Resend contact (`resend.Contacts.create`); `502` on failure
- FastAPI's auto-generated interactive docs are available at `/docs` on the backend directly (not proxied through Nginx)
- **No auth, no accounts, no roles, no admin panel, no rate limiting, no Redis, no tests** — all removed with the rewrite

### Frontend

- **React 19**, **TypeScript 6**, **Vite 8**, **React Router 7** (data router via `createBrowserRouter`)
- **Tailwind CSS 4** (via `@tailwindcss/vite`), **framer-motion**, **three.js**, **lucide-react**, **react-icons**
- **Lint/format: oxlint + Prettier** (ESLint and Sass are gone). **No test framework** — Vitest was removed and `npm run test` does not exist (this breaks CI — see Known Issues)
- **zod** is installed but **unused** — reserved for the upcoming API wiring. `marked` is a leftover unused dependency (see review findings)
- Path aliases `@/` → `src/`
- **Routes** (defined in `src/app/router.tsx`; thin page wrappers in `src/app/routes/`, feature code in `src/features/`):
  - `/` — Home (landing page, hero, highlights)
  - `/about` — About (mission, history, team)
  - `/startups` — Startups (curated showcase + partners)
  - `/events` — Events (upcoming and past)
  - `/contact` — Contact (offer highlights; links to the form on `/connect`)
  - `/connect` — **Get Involved** (newsletter sign-up `#newsletter`, contact form `#contact`, venture-scout applications `#scout-applications`, share section `#share`). The old `/subscribe` route was removed; the newsletter UI lives in `src/features/subscribe/components/NewsletterSection.tsx`
  - `/privacy` — Privacy Policy (static legal copy, collapsible sections)
  - `/terms` — Terms of Service (static legal copy)
  - `*` — 404 error page (catch-all loader throws a 404 `Response`)
- **No auth flow, no member dashboard, no API layer** — `src/lib/` was removed along with the Django-era clients and not yet replaced

### Infrastructure

- Docker Compose: `frontend` (Nginx on port **16017**, repo-root `nginx.conf` mounted read-only) + `backend` (env_file: `backend/.env` in dev, root `.env` in prod). No Redis service anymore. Both compose files override the backend command to `uv run uvicorn src.main:app --port 8000` (module path now correct), so the backend listens on 8000 inside the compose network
- `nginx.conf` (repo root): SPA fallback (`try_files ... /index.html`), legacy URL redirects (`/investing` → `/contact#scout-programme`, `/meet-the-team` → `/about#meet-the-team`, `/partners` → `/contact#network`), and an `/api/` proxy to `http://backend:8000`. The **path prefix now matches the backend** (routes are mounted under `/api/`) and the port matches the compose command — the old path/port mismatch is resolved. The `location /` block still contains leftover `proxy_set_header` lines that do nothing (no proxy there). **No rate limiting and no security headers** in the current config
- Images pushed to GHCR (repo-scoped): `ghcr.io/rorycondict/evp-website/frontend`, `ghcr.io/rorycondict/evp-website/backend`
- CI/CD (`.github/workflows/deploy.yml`): on push to `main` → matrix test (frontend lint + **test — currently fails, there is no `test` script** + build; backend `uv sync` on Python 3.14) → matrix build-and-push to GHCR (tagged `latest` + commit SHA) → SSH deploy. The deploy script starts the rootless Podman socket, sets `DOCKER_HOST`, logs into GHCR with the `GHCR_DEPLOY_TOKEN` PAT, exports `IMAGE_TAG` (the commit's short SHA — currently unused by the compose files, see Known Issues), runs `docker-compose pull` + `up -d --remove-orphans`, then `docker image prune -f`. On PRs: test + build only (no push/deploy). GHA layer caching (`type=gha`) used for faster builds
- CI uses **Node 24** for frontend (matching the `node:24-alpine` Docker build; `frontend/package.json` no longer declares an `engines` field) and **Python 3.14** for backend
- Deploy secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `GHCR_DEPLOY_TOKEN`

## Common Commands

### Full stack (local dev)

```sh
cp backend/.env.example backend/.env   # first-time setup (set RESEND_API_KEY, or leave it to run in mock mode)
docker compose up --build
```

- Site: http://localhost:16017
- **Note:** the backend Docker build is currently broken mid-rewrite (the frontend image builds fine — see Known Issues) — prefer the standalone commands below until it's fixed

### Backend (standalone)

```sh
cd backend
uv sync               # install deps
uv run fastapi dev    # dev server with reload (serves src.main:app)
uv run ruff check     # lint all Python files
uv run ruff check --fix  # lint + auto-fix
```

- No tests yet — there is no backend test suite to run

### Frontend (standalone)

```sh
cd frontend
npm install
npm run dev        # Vite dev server (no /api proxy — it was removed; re-add when wiring the API)
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm run format     # Prettier
```

- **No test script** — there is no frontend test suite (Vitest was removed). CI's `npm run test` step fails until a suite is added or the step is removed

## Conventions & Gotchas

- **Run backend commands with `uv run`**: always prefix Python commands with `uv run`. Never invoke `python` or `.venv\Scripts\python.exe` directly — `uv run` resolves the correct venv automatically.
- **Backend code style**: type hints everywhere; linted with **Ruff** — run `uv run ruff check` before committing. The app is a single module (`src/main.py`); when it grows, split into routers under `src/` and keep Pydantic schemas next to them.
- **Env vars**: the backend reads `backend/.env` in dev (pydantic-settings `env_file=".env"`, relative to the backend working directory). In production, `docker-compose.prod.yml` uses `env_file: .env` at the **repo root** on the server. The only variable is `RESEND_API_KEY`. Never commit `.env` (the root `.gitignore` ignores the root-level one; `backend/.gitignore` covers the rest).
- **API error shapes** (for the upcoming wiring): FastAPI validation failures return `422` with `{"detail": [...]}` (an array of `{loc, msg, type}` objects); the endpoints' explicit failures return `502` with `{"detail": "<generic message>"}`. Success responses are `204 No Content` — the frontend client must handle empty bodies. Normalise both error shapes in the future API layer. The backend routes are now under `/api/` (`/api/contact-submit`, `/api/newsletter-subscribe`), matching the Nginx proxy; the Vite dev proxy for `/api` was removed and needs re-adding when wiring.
- **Frontend features**: each feature lives in `src/features/<name>/` (components, hooks, API clients); thin route wrappers live in `src/app/routes/` and are registered in `src/app/router.tsx` under `AppLayout`; unknown paths throw a 404 `Response` from the catch-all loader.
- **Styling**: Tailwind utility classes preferred; merge classes with `clsx` + `tailwind-merge` via the `cn()` utility at `src/utils/cn.ts`. Use `cva` (class-variance-authority) for component variants. No new CSS files — extract repeated Tailwind patterns into React components in `src/components/ui/`. No `@apply` in CSS. Route files should contain only composition and data assembly, not inline component definitions.
- **Lint/format before committing**: `npm run lint` (oxlint) and `npm run format` must pass.
- **Upcoming API wiring**: when wiring the frontend to the backend, follow the pattern of runtime-validated fetches (zod is already installed; React Query is not — add it or use plain fetch). The URL scheme is now consistent (`/api/` on both the backend and the Nginx proxy); re-add the Vite dev proxy for `/api` when wiring.

## Known Issues & Discrepancies

Findings from the 2026-09 FastAPI rewrite review (2026-09-09), updated after the 2026-09-10 frontend code review. The previous Django-era issue list is obsolete — everything accounts/auth/startupdb/admin-related was removed with the rewrite.

### Resolved since the 2026-09-09 review

- **Backend routes are now under `/api/`** — the Nginx `/api/` proxy path mismatch is resolved, and the compose files run uvicorn on port 8000, matching the proxy target.
- **Frontend Dockerfile fixed** — the broken `COPY nginx.conf` is gone; it's now a clean `node:24-alpine` build → `nginx:alpine-slim` runtime (note: it runs as root with no HEALTHCHECK).
- **Compose backend command fixed** — both compose files now run `uv run uvicorn src.main:app` (correct module path).
- **CI backend test step fixed** — the stale `manage.py test` step was removed; backend CI is now `uv sync` on Python 3.14.
- **Subscribe page implemented** — the `/subscribe` stub was replaced by the `/connect` "Get Involved" page (newsletter + contact form + scout applications + share).

### Broken / pending wiring (the next tasks)

- **No frontend API wiring**: the contact form and newsletter form UIs are complete (`src/features/contact/components/ContactFormSection.tsx`, `src/features/subscribe/components/NewsletterSection.tsx`) but their `handleSubmit` functions contain TODO placeholders and never call the API — the old `src/lib/` API layer was removed and not yet replaced. zod is installed for this; React Query is not (add it or use plain fetch). The Vite dev proxy for `/api` was also removed and needs re-adding.
- **Backend Dockerfile is broken**: the base image is `python:3.12-slim` but `pyproject.toml` requires **Python ≥ 3.14** (so `uv sync --frozen` fails); the CMD references `app/main.py` (the app is `src/main.py`) and port **80** (compose overrides it to 8000, but standalone use breaks); and `WORKDIR /code` doesn't match the dev compose volume mount at `/app`.
- **Compose dev backend volume mount is ineffective**: `docker-compose.yml` mounts `./backend` to `/app`, but the image's `WORKDIR` is `/code` (where the baked-in code lives) — the `--reload` mount never takes effect. Align the mount with the WORKDIR (or vice versa).
- **Frontend CI test step fails**: CI runs `npm run test`, but `frontend/package.json` has **no test script** (Vitest was removed). Add a test suite or drop the step.

### CI/CD

- **`IMAGE_TAG` pinning is not wired**: the deploy script exports `IMAGE_TAG` (commit short SHA), but both compose files hardcode `image: ...:latest` — the variable is unused, so deploys always pull `:latest` and rollback-by-tag doesn't work. Wire it in (e.g. `image: ghcr.io/rorycondict/evp-website/${SERVICE}:${IMAGE_TAG:-latest}`) or remove the export.

### Security regressions (removed with the rewrite, pending re-introduction)

- **No rate limiting anywhere**: the old `django-ratelimit` + Nginx `limit_req_zone` layers are gone. The two POST endpoints are currently unthrottled.
- **No security headers**: `nginx.conf` no longer sets HSTS, CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`.
- **No CORS configuration** on the FastAPI app — fine once everything is same-origin behind the Nginx proxy, but needs thought if the backend is ever exposed directly.
- **Hardcoded Resend IDs**: the Contact Handler segment ID and the `contact-form-notification` template ID are hardcoded in `src/main.py` — candidates for settings/env vars.

### Dead / stale code & tooling

- **Unused frontend dependencies**: `marked` (leftover from the removed admin-email Markdown rendering); `zod` is installed but unused until the API wiring lands (keep it).
- **`backend/README.md` is empty**; the root README is the source of truth.
- **GitHub Actions are pinned by major tag** (not commit SHA) — supply-chain hardening opportunity.
- **`resend.api_key` is set at import time and re-assigned inside the contact handler** — harmless but redundant; initialise once.
- **`nginx.conf` `location /` block** contains `proxy_set_header` lines that do nothing (no proxy is configured there).

## Frontend code review findings (2026-09-10)

A full review of `frontend/src` was performed on 2026-09-10. Build (`tsc -b && vite build`) and lint (`oxlint`) both pass; the items below are dead code, bugs, and accessibility issues the tooling doesn't catch. The missing API wiring is intentionally excluded (it's the next task).

### Dead code

- `src/components/ui/WidgetCard.tsx` — never used (member-dashboard leftover; its doc comment still references the dashboard)
- `src/components/ui/interactive/PrimaryButton.tsx` — never used (superseded by `Button` + `buttonVariants`)
- `src/components/ui/labels/ShimmerTitle.tsx` — never used (the shimmer effect is inlined in `HomePageHero` and `LogoAndTitle`)
- `src/components/ui/labels/Label.tsx` — never used (`FormField` renders a raw `<label>` with `labelVariants`)
- `src/components/ui/section/GlassSection.tsx` — byte-for-byte duplicate of `section/glass-section/GlassSection.tsx`; **neither copy is used by any page** (both files plus `glass-section-variants.ts` are dead)
- `riseIn` in `src/utils/motion.ts` — unused export
- `digit` size variant in `src/components/ui/interactive/input/input-variants.ts` — OTP-auth leftover, never used
- `marked` npm dependency — never imported
- `MemberCard` is exported from `features/about/index.ts` but only used internally by `MemberYearSection`
- Unreachable branches in `src/app/routes/Error.tsx`: the 401/403 cases (no auth exists anymore)
- Stale comments: `HeaderActions` ("AuthSection"), `InteractiveLinkButton` ("Join EVP" button), `UnderlinedTitle` (doc text copied from `SectionDivider`)
- `public/robots.txt` disallows `/evp-dev/` and `/member` — routes that no longer exist
- `PromoCard` ends with a pointless `{to ? content : <>{content}</>}` ternary

### Bugs

- **Invalid Tailwind class `text-lg-400`** in the error messages of `NewsletterSection.tsx` and `ContactFormSection.tsx` — the class doesn't exist, so error feedback renders unstyled (likely meant a red/error tone)
- **`ShareSection` "Share Website" button is a silent no-op on desktop**: `handleShare` early-returns when `navigator.share` is unavailable, with no clipboard fallback (unlike `ShareButton`, which falls back to `navigator.clipboard`). `WEBSITE_URL` also lacks the `https://` scheme, which some share targets reject
- **`ShareSection` subtitle nests a `<p>` inside a `<p>`** — invalid HTML nesting
- **`index.html` favicon MIME mismatch**: `<link rel="icon" type="image/svg+xml" href="/favicon.png">` declares SVG but serves a PNG
- **`public/sitemap.xml` is stale**: lists `/join` (no such route — a 404 in the sitemap) and misses `/connect`
- **Forms aren't wrapped in `<form>` elements** — no Enter-key submission; submit handlers are mouse-event based (`React.MouseEvent<HTMLButtonElement>`)
- **No client-side email validation** — the forms only check non-empty; invalid emails will get a 422 once wired (validate with zod per conventions)
- **Success state permanently locks both forms** — after a successful submit, all inputs and the submit button are disabled with no reset; the user must reload to submit again
- **`ReserveButton` renders `href="#"` with `target="_blank"`** when an `available` event has no `reserveUrl` — opens a blank duplicate tab
- **`StartupBlock` hardcodes light-theme colours** (`text-gray-800`, `text-black`, `bg-gray-300`, `bg-white/15`) — broken contrast in dark mode
- **`PolicyDropdown` renders an `<h2>` inside a `<button>`** — invalid HTML nesting (button content model is phrasing content)
- **Multiple `<h1>`s per page** — `LogoAndTitle` renders a site-wide `<h1>`, and pages add more (`UnderlinedTitle` defaults to level 1, `ConnectSection` uses `<h1>`, Home's `EventsSection` uses `<h1>`)
- **`AnimatedCheckbox` accepts a `label` prop it never renders**, and the newsletter consent checkbox isn't programmatically associated with its consent text (no `htmlFor`/`id` link)
- **`generateColumns` uses `Math.random()`** — the startups grid order and sizes reshuffle on every route remount (`useMemo` only memoises per mount)
- **`EventsBanner` imports via a relative `../../../components/ui/...` path** instead of the `@/` alias
- **`src/components/ui/index.ts` re-exports a feature component** (`features/events/components/EventsBanner`) — layering violation and circular-import hazard
- **`ColorBends` has no WebGL-failure guard** — `new WebGLRenderer(...)` throws if WebGL is unavailable, and there's no error boundary around `GlobalBackground`, so the whole app falls over to the error page
- **`ShareSection`'s copy-feedback `setTimeout` isn't cleaned up on unmount**
- **Header mobile-menu toggle lacks `aria-expanded`/`aria-controls`** and there's no Escape-key handling or focus management
- **`PageMeta` only updates `<title>` and the description meta** — per-page OG/Twitter/canonical tags remain static across routes

### Vulnerabilities

No frontend vulnerabilities were found: there is no `dangerouslySetInnerHTML` anywhere, external links consistently use `rel="noopener noreferrer"`, no secrets live client-side, and the error page's developer details are gated behind `import.meta.env.DEV` (no stack traces in production). The remaining security gaps are infrastructure-level (no rate limiting, no security headers — see above).

## Common Gotchas & Fixes

### Production / CI/CD

- **`docker-compose up -d` fails with `CNI network "evp-website_default" not found`**
  - Cause: Podman on Tardis uses CNI with `cniVersion: 1.0.0` in the conflist, but `docker-compose` v1 expects `0.4.0`.
  - Fix: Edit `~/.config/cni/net.d/<compose-project-name>.conflist` and change `"cniVersion": "1.0.0"` → `"0.4.0"`, then re-run `docker-compose up -d`.
  - The compose project name is typically the directory name — e.g. `evp-website_default.conflist`.

- **SSH deploy works but `docker-compose` fails with `PermissionError(13, 'Permission denied')`**
  - The server uses Podman rootless (no `/var/run/docker.sock`). The deploy script runs `systemctl --user start podman.socket` and sets `DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock` before invoking `docker-compose`.
