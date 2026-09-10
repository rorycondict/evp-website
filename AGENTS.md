# AGENTS.md — Edinburgh VenturePoint Website

Guidance for autonomous code agents working in this repository.

## Project Overview

Official website for **Edinburgh VenturePoint (EVP)**, an entrepreneurship society at the University of Edinburgh.
Live site: https://edinburghventurepoint.com — hosted on Tardis servers (https://tardisproject.uk).

**Current state (2026-09-10): rewrite complete; API wiring landed; frontend code-reviewed.** The backend was rewritten from Django to **FastAPI** (single module at `backend/src/main.py`) and exposes exactly **two endpoints** (`POST /api/contact-submit`, `POST /api/newsletter-subscribe`). On the frontend, the old `/subscribe` stub was replaced by a **`/connect` ("Get Involved") page** hosting the newsletter sign-up (`NewsletterSection`), the contact form (`ContactFormSection`), venture-scout applications, and a share section. Both forms are **wired to the API** through an orval-generated **React Query + axios** client (`src/api/generated.ts`, regenerated with `npm run codegen`), and **Nginx rate limiting** for the two POST endpoints has been restored. A full frontend code review was performed on 2026-09-10 (all findings resolved); a follow-up full-stack review the same day found no new dead code, with lint/build/ruff all green. Remaining issues are recorded under "Known Issues & Discrepancies" below.

## Repository Layout

```
evp-website/
├── backend/                  # FastAPI app (single module)
│   ├── src/
│   │   ├── main.py           # FastAPI app, settings, both endpoints
│   │   └── __init__.py
│   ├── scripts/
│   │   └── export_openapi.py # Exports the OpenAPI spec to backend/openapi.json (codegen input)
│   ├── openapi.json          # Committed OpenAPI spec — input to the frontend orval codegen
│   ├── .env.example          # RESEND_API_KEY only
│   ├── pyproject.toml        # Python deps (managed with uv); [tool.fastapi] entrypoint = src.main:app
│   ├── uv.lock
│   ├── README.md             # Brief backend overview (root README is the source of truth)
│   └── Dockerfile            # python:3.14-slim base; WORKDIR /app; uv sync --no-dev
├── frontend/                 # React 19 + Vite + TypeScript SPA
│   ├── public/               # favicon.png, og-preview.png, robots.txt, sitemap.xml, theme-init.js, icons/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── index.css         # Tailwind 4 theme tokens, custom utilities & keyframes
│   │   ├── api/
│   │   │   └── generated.ts  # orval-generated API client (React Query hooks + axios fetchers) — do not edit by hand
│   │   ├── app/              # App shell: App.tsx, AppLayout.tsx, provider.tsx (QueryClientProvider), router.tsx, routes/
│   │   ├── components/       # layout/ (header, footer, scroll), theme/, three/ (3D background), ui/ (shared UI)
│   │   ├── features/         # about, connect, contact, events, homepage, privacy, startups
│   │   ├── utils/            # cn.ts, motion.ts
│   │   └── assets/
│   ├── .oxlintrc.json        # oxlint config; loads @tanstack/eslint-plugin-query rules via jsPlugins
│   ├── orval.config.ts       # orval codegen config (backend/openapi.json → src/api/generated.ts)
│   ├── package.json          # scripts: dev, build, lint (oxlint), format (prettier), codegen — no test script
│   ├── vite.config.ts        # @/ path alias only — no /api dev proxy (see Known Issues)
│   ├── README.md             # Brief frontend overview (root README is the source of truth)
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
- **Ruff** (linter; a dev dependency via `[dependency-groups]`)
- **Settings** (`Settings` in `main.py`): reads `backend/.env` via pydantic-settings; the only variable is `RESEND_API_KEY`. When unset, the app runs in **mock mode** — submissions are logged (`[MOCK RESEND]`) and return `204`
- **Two endpoints** (mounted under `/api/`):
  - `POST /api/contact-submit` → `204`. Body: `ContactForm {first_name, last_name, email: EmailStr, message}` — all fields length-limited (names ≤ 100, email ≤ 254, message ≤ 10 000). With Resend enabled: fetches the members of the hardcoded "Contact Handler" **segment** (`80b4d0a3-01f3-4ab6-ba24-2ba478ec2ea0`) and BCCs them a notification using the Resend template `contact-form-notification` (variables `SUBMITTER_FIRST_NAME`/`SUBMITTER_LAST_NAME`/`SUBMITTER_EMAIL`/`SUBMITTER_MESSAGE`), from `Edinburgh VenturePoint <noreply@mail.edinburghventurepoint.com>`. Returns `502` with a generic detail on any Resend failure; an empty segment logs the form and returns `204`
  - `POST /api/newsletter-subscribe` → `204`. Body: `NewsletterForm {email: EmailStr, first_name, last_name}` (same limits, no message). Creates a Resend contact (`resend.Contacts.create`); `502` on failure
- FastAPI's auto-generated interactive docs are available at `/docs` on the backend directly (not proxied through Nginx)
- **No auth, no accounts, no roles, no admin panel, no Redis, no tests** — all removed with the rewrite. Rate limiting is enforced at the Nginx edge (see Infrastructure), not in the app itself

### Frontend

- **React 19**, **TypeScript 6**, **Vite 8**, **React Router 7** (data router via `createBrowserRouter`)
- **Tailwind CSS 4** (via `@tailwindcss/vite`), **framer-motion**, **three.js**, **lucide-react**, **react-icons**
- **TanStack React Query + axios** — the API client layer is **orval-generated** from `backend/openapi.json` into `src/api/generated.ts` (React Query hooks + axios fetchers; regenerate with `npm run codegen` after backend changes). A module-level `QueryClient` is provided via `QueryClientProvider` in `src/app/provider.tsx`
- **Lint/format: oxlint + Prettier** (ESLint and Sass are gone; oxlint loads `@tanstack/eslint-plugin-query` rules via `jsPlugins` in `.oxlintrc.json`). **No test framework** — Vitest was removed, `npm run test` does not exist, and CI's test step is commented out (see Known Issues)
- **zod** is used for client-side email validation in the forms
- Path aliases `@/` → `src/`
- **Routes** (defined in `src/app/router.tsx`; thin page wrappers in `src/app/routes/`, feature code in `src/features/`):
  - `/` — Home (landing page, hero, highlights)
  - `/about` — About (mission, history, team)
  - `/startups` — Startups (curated showcase + partners)
  - `/events` — Events (upcoming and past)
  - `/contact` — Contact (offer highlights; links to the form on `/connect`)
  - `/connect` — **Get Involved** (newsletter sign-up `#newsletter`, contact form `#contact`, venture-scout applications `#scout-applications`, share section `#share`). The old `/subscribe` route was removed; the newsletter UI lives in `src/features/connect/components/NewsletterSection.tsx`
  - `/privacy` — Privacy Policy (static legal copy, collapsible sections)
  - `/terms` — Terms of Service (static legal copy)
  - `*` — 404 error page (catch-all loader throws a 404 `Response`)
- **No auth flow, no member dashboard** — the old `src/lib/` Django-era clients were removed; the API layer now lives in the orval-generated `src/api/generated.ts`

### Infrastructure

- Docker Compose: `frontend` (Nginx on port **16017**, repo-root `nginx.conf` mounted read-only) + `backend` (env_file: `backend/.env` in dev, root `.env` in prod). No Redis service anymore. Both compose files override the backend command to run uvicorn on `src.main:app` port 8000 (prod adds `--no-dev` so dev dependencies aren't installed at runtime), so the backend listens on 8000 inside the compose network
- `nginx.conf` (repo root): SPA fallback (`try_files ... /index.html`), legacy URL redirects (`/investing` → `/contact#scout-programme`, `/meet-the-team` → `/about#meet-the-team`, `/partners` → `/contact#network`), and `/api/` proxying to `http://backend:8000` (path prefix and port both match the backend). **Rate limiting is configured**: per-client-IP `limit_req_zone` — both POST endpoints `2r/m` (burst 3, `nodelay`, status `429`) — applied on the two exact endpoint locations. **No security headers** (HSTS, CSP, etc.) in the current config — still pending (see Known Issues)
- Images pushed to GHCR (repo-scoped): `ghcr.io/rorycondict/evp-website/frontend`, `ghcr.io/rorycondict/evp-website/backend`. Both compose files reference `...:${IMAGE_TAG:-latest}`, so the deploy script's `IMAGE_TAG` export pins the exact commit SHA (rollback by re-exporting an older SHA tag)
- CI/CD (`.github/workflows/deploy.yml`): on push to `main` → matrix test (frontend lint + build — the `npm run test` step is **commented out** until a suite exists; backend `uv sync` on Python 3.14) → matrix build-and-push to GHCR (tagged `latest` + commit SHA) → SSH deploy. The deploy script starts the rootless Podman socket, sets `DOCKER_HOST`, logs into GHCR with the `GHCR_DEPLOY_TOKEN` PAT, exports `IMAGE_TAG` (the commit's short SHA, consumed by the compose files' `${IMAGE_TAG:-latest}` image references), runs `docker-compose pull` + `up -d --remove-orphans`, then `docker image prune -f`. On PRs: test + build only (no push/deploy). GHA layer caching (`type=gha`) used for faster builds
- CI uses **Node 24** for frontend (matching the `node:24-alpine` Docker build; `frontend/package.json` no longer declares an `engines` field) and **Python 3.14** for backend
- Deploy secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `GHCR_DEPLOY_TOKEN`

## Common Commands

### Full stack (local dev)

```sh
cp backend/.env.example backend/.env   # first-time setup (set RESEND_API_KEY, or leave it to run in mock mode)
docker compose up --build
```

- Site: http://localhost:16017
- Both images build cleanly, and the dev compose mount (`./backend` → `/app`) now matches the image `WORKDIR`, so the backend `--reload` picks up source edits

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
npm run dev        # Vite dev server (no /api proxy — form submissions 404 in standalone dev; see Known Issues)
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm run format     # Prettier
npm run codegen    # re-export backend/openapi.json + regenerate src/api/generated.ts (requires uv)
```

- **No test script** — there is no frontend test suite (Vitest was removed). CI's `npm run test` step is commented out until a suite is added

## Conventions & Gotchas

- **Run backend commands with `uv run`**: always prefix Python commands with `uv run`. Never invoke `python` or `.venv\Scripts\python.exe` directly — `uv run` resolves the correct venv automatically.
- **Backend code style**: type hints everywhere; linted with **Ruff** — run `uv run ruff check` before committing. The app is a single module (`src/main.py`); when it grows, split into routers under `src/` and keep Pydantic schemas next to them.
- **Env vars**: the backend reads `backend/.env` in dev (pydantic-settings `env_file=".env"`, relative to the backend working directory). In production, `docker-compose.prod.yml` uses `env_file: .env` at the **repo root** on the server. The only variable is `RESEND_API_KEY`. Never commit `.env` (the root `.gitignore` ignores the root-level one; `backend/.gitignore` covers the rest).
- **API error shapes**: FastAPI validation failures return `422` with `{"detail": [...]}` (an array of `{loc, msg, type}` objects); the endpoints' explicit failures return `502` with `{"detail": "<generic message>"}`; Nginx rate limiting returns `429`. Success responses are `204 No Content` (empty body). The orval-generated client types these as `AxiosError<HTTPValidationError>`; the forms surface a specific message for `429` and a generic one otherwise. The backend routes are under `/api/` (`/api/contact-submit`, `/api/newsletter-subscribe`), matching the Nginx proxy; the Vite dev proxy for `/api` is still missing (see Known Issues).
- **Frontend features**: each feature lives in `src/features/<name>/` (components, hooks, API clients); thin route wrappers live in `src/app/routes/` and are registered in `src/app/router.tsx` under `AppLayout`; unknown paths throw a 404 `Response` from the catch-all loader.
- **Styling**: Tailwind utility classes preferred; merge classes with `clsx` + `tailwind-merge` via the `cn()` utility at `src/utils/cn.ts`. Use `cva` (class-variance-authority) for component variants. No new CSS files — extract repeated Tailwind patterns into React components in `src/components/ui/`. No `@apply` in CSS. Route files should contain only composition and data assembly, not inline component definitions.
- **Lint/format before committing**: `npm run lint` (oxlint) and `npm run format` must pass.
- **API client regeneration**: the client in `src/api/generated.ts` is orval-generated — never edit it by hand. After changing backend endpoints, run `npm run codegen` (re-exports `backend/openapi.json` via `uv run scripts/export_openapi.py`, then regenerates) and commit both the spec and the generated file. The generated fetchers use relative `/api/...` URLs (same-origin behind Nginx).

## Known Issues & Discrepancies

Findings from the 2026-09 FastAPI rewrite review (2026-09-09), updated after the 2026-09-10 frontend code review and the 2026-09-10 full-stack review (which verified lint/build/ruff green and no new dead code). The previous Django-era issue list is obsolete — everything accounts/auth/startupdb/admin-related was removed with the rewrite.

### Resolved since the 2026-09-09 review

- **Backend routes are now under `/api/`** — the Nginx `/api/` proxy path mismatch is resolved, and the compose files run uvicorn on port 8000, matching the proxy target.
- **Frontend Dockerfile fixed** — the broken `COPY nginx.conf` is gone; it's now a clean `node:24-alpine` build → `nginx:alpine-slim` runtime (note: it runs as root with no HEALTHCHECK).
- **Compose backend command fixed** — both compose files now run `uv run uvicorn src.main:app` (correct module path).
- **CI backend test step fixed** — the stale `manage.py test` step was removed; backend CI is now `uv sync` on Python 3.14.
- **Subscribe page implemented** — the `/subscribe` stub was replaced by the `/connect` "Get Involved" page (newsletter + contact form + scout applications + share).
- **Frontend API wiring landed (2026-09-10)** — both forms call the API through an orval-generated React Query + axios client (`src/api/generated.ts`, generated from `backend/openapi.json` via `backend/scripts/export_openapi.py` + `frontend/orval.config.ts`; regenerate with `npm run codegen`). Forms show zod email errors, pending/success states, and a specific message for `429`.
- **Nginx rate limiting restored** — per-IP `limit_req` on both POST endpoints (`2r/m` each, burst 3 `nodelay`, `429`); the dead `proxy_set_header` lines in `location /` were removed.
- **CI frontend test step disabled** — the failing `npm run test` step is commented out in `deploy.yml`; CI is green again (still no test suite — see Dead/stale code).
- **Backend Dockerfile fixed (2026-09-10)** — `python:3.14-slim` base, `WORKDIR /app` (matching the dev compose mount, so `--reload` now takes effect), `uv sync --frozen --no-dev`, and a standalone-safe CMD (`uv run --no-dev uvicorn src.main:app --host 0.0.0.0 --port 8000 --proxy-headers`). Image build verified.
- **`IMAGE_TAG` pinning wired (2026-09-10)** — both compose files now use `image: ...:${IMAGE_TAG:-latest}`, so deploys pull the exact commit SHA and rollback-by-tag works.
- **`ruff` moved to a dev dependency** (`[dependency-groups]` in `backend/pyproject.toml`); the production image is built with `--no-dev` and the prod compose command runs `uv run --no-dev`.
- **`backend/README.md` populated** with a brief backend overview (the root README remains the source of truth).
- **Field length limits added (2026-09-10)** — Pydantic `Field` constraints on both forms (names ≤ 100, email ≤ 254, message ≤ 10 000); the OpenAPI spec and orval client were regenerated to match.
- **Minor cleanups (2026-09-10)** — orval config key renamed `petstore` → `evp`; `frontend/Dockerfile` now declares `EXPOSE 16017` (matching the Nginx listener); both forms submit the trimmed, zod-validated email.

### Broken / pending wiring (the next tasks)

- **Vite dev proxy for `/api` is still missing**: the wired forms POST to relative `/api/...` URLs, which work in production (same-origin behind Nginx) but **404 under the standalone Vite dev server**. Re-add a `server.proxy` entry for `/api` → `http://localhost:8000` (or develop via `docker compose up`).

### Security (partially restored; remaining gaps)

- **Rate limiting is restored at the Nginx edge** (per-IP `limit_req` on both POST endpoints, `429`). The FastAPI app itself is still unthrottled — fine inside the compose network, but the backend must not be exposed directly.
- **No security headers**: `nginx.conf` still sets no HSTS, CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`.
- **No CORS configuration** on the FastAPI app — fine while everything is same-origin behind the Nginx proxy, but needs thought if the backend is ever exposed directly.
- **Hardcoded Resend IDs**: the Contact Handler segment ID and the `contact-form-notification` template ID are hardcoded in `src/main.py` — candidates for settings/env vars.
- **PII in logs**: on Resend failures (and in mock mode) the full form (names, email, message) is written to the logs via `logger.error(form)` / `logger.info(...)` — consider logging less or redacting.

### Dead / stale code & tooling

- **GitHub Actions are pinned by major tag** (not commit SHA) — supply-chain hardening opportunity.
- **`resend.api_key` is set at import time and re-assigned inside the contact handler** — harmless but redundant; initialise once.
- **No test suites** — neither frontend (Vitest removed; CI step commented out) nor backend (pytest/TestClient) has any tests.
- **Cosmetic**: `ScoutApplicationsSection.tsx` carries an intentional `TODO: add URL when applications open`.

## Frontend code review findings (2026-09-10) — RESOLVED

A full review of `frontend/src` was performed on 2026-09-10 (build and lint both passed; the findings were dead code, bugs, and accessibility issues the tooling doesn't catch). **All findings were resolved the same day.** The API wiring (excluded from that review as future work) has since landed — see "Resolved" above. Record of the fixes:

### Dead code (removed)

- `WidgetCard`, `PrimaryButton`, `ShimmerTitle`, `Label`, and both duplicate `GlassSection` copies (+ `glass-section-variants.ts`) — deleted
- `riseIn` in `src/utils/motion.ts` — removed
- `digit` size variant in `input-variants.ts` (OTP-auth leftover) — removed
- `marked` npm dependency — removed from `package.json`
- `MemberCard` over-export in `features/about/index.ts` — now internal to `MemberGrid`
- Unreachable 401/403 branches in `Error.tsx` — removed
- Stale comments in `HeaderActions`, `InteractiveLinkButton`, `UnderlinedTitle` — rewritten
- `robots.txt` stale `/evp-dev/` + `/member` disallows — removed
- `PromoCard`'s pointless `{to ? content : <>{content}</>}` ternary — collapsed
- `ui/index.ts` no longer re-exports the feature component `EventsBanner` (layering violation) — it's exported from `features/events` instead, and `EventsBanner` now imports via the `@/` alias

### Bugs (fixed)

- Invalid `text-lg-400` class in both forms' error messages — replaced with a new `--color-error` theme token (`text-error`; red-700 in light mode, red-400 in dark) used for all error feedback
- Both forms are now wrapped in `<form>` elements with `type="submit"` buttons (Enter-key submission works) and validate the email with **zod** (`z.email`), showing an inline error message
- Success no longer permanently locks the forms — inputs re-enable after success and the message clears on the next edit
- `ShareSection`: `WEBSITE_URL` now has the `https://` scheme, the Share button falls back to the clipboard when the Web Share API is unavailable/cancelled, the nested `<p>`-in-`<p>` subtitle is now valid HTML, and the copy-feedback `setTimeout` is cleaned up on unmount
- `index.html` favicon MIME fixed (`type="image/png"`); `sitemap.xml` updated (`/join` removed, `/connect` added)
- `ReserveButton` renders nothing when an `available` event has no `reserveUrl` (no more `href="#"` blank tab)
- `StartupBlock` uses theme tokens (`bg-background-muted`, `text-foreground`, `bg-foreground/10`) instead of hardcoded light-theme colours — dark mode fixed
- `PolicyDropdown` uses the valid `<h2><button>…</button></h2>` accordion pattern
- Heading hierarchy fixed: `LogoAndTitle` renders the site-wide `<h1>` only in the home hero (a `<span>` in the header); Home's EventsSection and `ConnectSection` headings demoted to `<h2>` — one `<h1>` per page
- `AnimatedCheckbox`: unused `label` prop removed; now accepts `id`/`ariaLabel`, and the newsletter consent checkbox has an accessible name
- `generateColumns` uses a seeded PRNG (mulberry32, fixed seed) — the startups grid layout is stable across remounts
- `ColorBends` guards WebGL renderer creation (try/catch + null container check) — WebGL failure degrades to the static fallback background instead of crashing the app
- Header mobile-menu toggle has `aria-expanded`/`aria-controls` and the menu closes on Escape
- `PageMeta` now updates the OG/Twitter meta tags and the canonical link per route (via `useLocation`)

### Vulnerabilities

None were found: there is no `dangerouslySetInnerHTML` anywhere, external links consistently use `rel="noopener noreferrer"`, no secrets live client-side, and the error page's developer details are gated behind `import.meta.env.DEV` (no stack traces in production). The remaining security gaps are infrastructure-level (no security headers; no app-level rate limiting — see above). A follow-up full-stack review on 2026-09-10 re-confirmed: no new dead code (all `ui/` barrel exports are used), lint/build/ruff all green, and no client-side secrets.

## Common Gotchas & Fixes

### Production / CI/CD

- **`docker-compose up -d` fails with `CNI network "evp-website_default" not found`**
  - Cause: Podman on Tardis uses CNI with `cniVersion: 1.0.0` in the conflist, but `docker-compose` v1 expects `0.4.0`.
  - Fix: Edit `~/.config/cni/net.d/<compose-project-name>.conflist` and change `"cniVersion": "1.0.0"` → `"0.4.0"`, then re-run `docker-compose up -d`.
  - The compose project name is typically the directory name — e.g. `evp-website_default.conflist`.

- **SSH deploy works but `docker-compose` fails with `PermissionError(13, 'Permission denied')`**
  - The server uses Podman rootless (no `/var/run/docker.sock`). The deploy script runs `systemctl --user start podman.socket` and sets `DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock` before invoking `docker-compose`.
