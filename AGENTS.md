# AGENTS.md — Edinburgh VenturePoint Website

Guidance for autonomous code agents working in this repository.

## Project Overview

Official website for **Edinburgh VenturePoint (EVP)**, an entrepreneurship society at the University of Edinburgh.
Live site: https://edinburghventurepoint.com — hosted on Tardis servers (https://tardisproject.uk).

**Current state (2026-09-09): mid-rewrite.** The backend was rewritten from Django to **FastAPI**. Accounts/auth, the member dashboard, the internal startup database, the Django admin, Redis, and all old endpoints were **removed**. The backend now exposes exactly **two endpoints** (`/contact-submit`, `/newsletter-subscribe`). On the frontend, a `/subscribe` route exists as a **stub** and there is **no API wiring yet** — implementing the subscribe page and wiring the frontend to the API are the next planned tasks. This document describes the current state, including known breakages to fix along the way.

## Repository Layout

```
evp-website/
├── backend/                  # FastAPI app (single module)
│   ├── app/
│   │   ├── main.py           # FastAPI app, settings, both endpoints
│   │   └── __init__.py
│   ├── .env.example          # RESEND_API_KEY only
│   ├── pyproject.toml        # Python deps (managed with uv); [tool.fastapi] entrypoint = app.main:app
│   ├── uv.lock
│   └── Dockerfile            # python:3.14 base (currently broken — see Known Issues)
├── frontend/                 # React 19 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── main.tsx
│   │   ├── app/              # App shell: App.tsx, AppLayout.tsx, router.tsx, routes/
│   │   ├── components/       # layout/, theme/, three/ (3D background), ui/ (shared UI)
│   │   ├── features/         # about, contact, events, homepage, privacy, startups, subscribe (empty — stub)
│   │   ├── utils/            # cn.ts, motion.ts
│   │   └── assets/
│   ├── package.json
│   ├── vite.config.ts        # Dev proxy: /api → http://127.0.0.1:16017
│   └── Dockerfile            # node:24-alpine build stage → nginx:alpine (non-root, HEALTHCHECK)
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

- **Python ≥ 3.13** (`pyproject.toml` `requires-python`; the Dockerfile uses a `python:3.14` base; CI sets up 3.13), managed with **uv**
- **FastAPI** (`fastapi[standard] >= 0.141.1`) with **Pydantic** validation and **pydantic-settings** for config — the entire app lives in `backend/app/main.py` (no router split yet)
- **Resend Python SDK** — the only external service. **No database**: both endpoints talk directly to Resend
- **Ruff** (linter; a project dependency)
- **Settings** (`Settings` in `main.py`): reads `backend/.env` via pydantic-settings; the only variable is `RESEND_API_KEY`. When unset, the app runs in **mock mode** — submissions are logged (`[MOCK RESEND]`) and return `204`
- **Two endpoints** (mounted at the root, **not** under `/api/`):
  - `POST /contact-submit` → `204`. Body: `ContactForm {first_name, last_name, email: EmailStr, message}`. With Resend enabled: fetches the members of the hardcoded "Contact Handler" **segment** (`80b4d0a3-01f3-4ab6-ba24-2ba478ec2ea0`) and BCCs them a notification using the Resend template `contact-form-notification` (variables `SUBMITTER_FIRST_NAME`/`SUBMITTER_LAST_NAME`/`SUBMITTER_EMAIL`/`SUBMITTER_MESSAGE`), from `Edinburgh VenturePoint <noreply@mail.edinburghventurepoint.com>`. Returns `502` with a generic detail on any Resend failure; an empty segment logs the form and returns `204`
  - `POST /newsletter-subscribe` → `204`. Body: `NewsletterForm {email: EmailStr, first_name, last_name}`. Creates a Resend contact (`resend.Contacts.create`); `502` on failure
- FastAPI's auto-generated interactive docs are available at `/docs` on the backend directly (not proxied through Nginx)
- **No auth, no accounts, no roles, no admin panel, no rate limiting, no Redis, no tests** — all removed with the rewrite

### Frontend

- **React 19**, **TypeScript 6**, **Vite 8**, **React Router 7** (data router via `createBrowserRouter`)
- **Tailwind CSS 4** (via `@tailwindcss/vite`), **Sass**, **framer-motion**, **three.js**
- **TanStack React Query** and **zod** are installed but **unused** — reserved for the upcoming API wiring. `dompurify` and `marked` are leftover unused dependencies
- Path aliases `@/` → `src/`
- **Routes** (defined in `src/app/router.tsx`; thin page wrappers in `src/app/routes/`, feature code in `src/features/`):
  - `/` — Home (landing page, hero, highlights)
  - `/about` — About (mission, history, team)
  - `/startups` — Startups (curated showcase)
  - `/events` — Events (upcoming and past)
  - `/contact` — Contact form
  - `/privacy` — Privacy Policy (static legal copy, collapsible sections)
  - `/terms` — Terms of Service (static legal copy)
  - `/subscribe` — **stub** (renders only `PageMeta`; `src/features/subscribe/` is empty) — the newsletter sign-up UI is the next task. The header `SubscribeButton` already links here
  - `*` — 404 error page (catch-all loader throws a 404 `Response`)
- **No auth flow, no member dashboard, no API layer** — `src/lib/` was removed along with the Django-era clients

### Infrastructure

- Docker Compose: `frontend` (Nginx on port **16017**, repo-root `nginx.conf` mounted read-only) + `backend` (env_file: `backend/.env` in dev, root `.env` in prod). No Redis service anymore
- `nginx.conf` (repo root): SPA fallback (`try_files ... /index.html`), legacy URL redirects (`/investing` → `/contact#scout-programme`, `/meet-the-team` → `/about#meet-the-team`, `/partners` → `/contact#network`), and an `/api/` proxy to `http://backend:8000` (currently mismatched with the backend — see Known Issues). **No rate limiting and no security headers** in the current config
- Images pushed to GHCR (repo-scoped): `ghcr.io/rorycondict/evp-website/frontend`, `ghcr.io/rorycondict/evp-website/backend`
- CI/CD (`.github/workflows/deploy.yml`): on push to `main` → matrix test (frontend lint+test+build; backend `uv sync` + tests — currently stale, see Known Issues) → matrix build-and-push to GHCR (tagged `latest` + commit SHA) → SSH deploy. The deploy script starts the rootless Podman socket, sets `DOCKER_HOST`, logs into GHCR with the `GHCR_DEPLOY_TOKEN` PAT, exports `IMAGE_TAG` (the commit's short SHA — currently unused by the compose files, see Known Issues), runs `docker-compose pull` + `up -d --remove-orphans`, then `docker image prune -f`. On PRs: test + build only (no push/deploy). GHA layer caching (`type=gha`) used for faster builds
- CI uses **Node 24** for frontend (matching the `node:24-alpine` Docker build; `frontend/package.json` declares `engines: node >= 22`) and **Python 3.13** for backend
- Deploy secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `GHCR_DEPLOY_TOKEN`

## Common Commands

### Full stack (local dev)

```sh
cp backend/.env.example backend/.env   # first-time setup (set RESEND_API_KEY, or leave it to run in mock mode)
docker compose up --build
```

- Site: http://localhost:16017
- **Note:** both Docker builds are currently broken mid-rewrite (see Known Issues) — prefer the standalone commands below until they're fixed

### Backend (standalone)

```sh
cd backend
uv sync               # install deps
uv run fastapi dev    # dev server with reload (serves app.main:app)
uv run ruff check     # lint all Python files
uv run ruff check --fix  # lint + auto-fix
```

- No tests yet — there is no backend test suite to run (the CI `manage.py test` step is stale)

### Frontend (standalone)

```sh
cd frontend
npm install
npm run dev        # Vite dev server (proxies /api to http://127.0.0.1:16017)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run format     # Prettier
npm run test       # Vitest (run once)
npm run test:watch # Vitest (watch mode)
```

## Conventions & Gotchas

- **Run backend commands with `uv run`**: always prefix Python commands with `uv run`. Never invoke `python` or `.venv\Scripts\python.exe` directly — `uv run` resolves the correct venv automatically.
- **Backend code style**: type hints everywhere; linted with **Ruff** — run `uv run ruff check` before committing. The app is a single module (`app/main.py`); when it grows, split into routers under `app/` and keep Pydantic schemas next to them.
- **Env vars**: the backend reads `backend/.env` in dev (pydantic-settings `env_file=".env"`, relative to the backend working directory). In production, `docker-compose.prod.yml` uses `env_file: .env` at the **repo root** on the server. The only variable is `RESEND_API_KEY`. Never commit `.env` (the root `.gitignore` ignores the root-level one; `backend/.gitignore` covers the rest).
- **API error shapes** (for the upcoming wiring): FastAPI validation failures return `422` with `{"detail": [...]}` (an array of `{loc, msg, type}` objects); the endpoints' explicit failures return `502` with `{"detail": "<generic message>"}`. Success responses are `204 No Content` — the frontend client must handle empty bodies. Normalise both error shapes in the future API layer.
- **Frontend features**: each feature lives in `src/features/<name>/` (components, hooks, API clients); thin route wrappers live in `src/app/routes/` and are registered in `src/app/router.tsx` under `AppLayout`; unknown paths throw a 404 `Response` from the catch-all loader.
- **Styling**: Tailwind utility classes preferred; merge classes with `clsx` + `tailwind-merge` via the `cn()` utility at `src/utils/cn.ts`. Use `cva` (class-variance-authority) for component variants. No new CSS files — extract repeated Tailwind patterns into React components in `src/components/ui/`. No `@apply` in CSS. Route files should contain only composition and data assembly, not inline component definitions.
- **Lint/format before committing**: `npm run lint` and `npm run format` must pass.
- **Upcoming API wiring**: when wiring the frontend to the backend, follow the pattern of runtime-validated fetches (React Query + zod are already installed). Decide and apply a consistent URL scheme — the backend routes are currently at the root (`/contact-submit`, `/newsletter-subscribe`) while Nginx and the Vite dev proxy both expect an `/api/` prefix (see Known Issues).

## Known Issues & Discrepancies

Findings from the 2026-09 FastAPI rewrite review (2026-09-09). The previous Django-era issue list is obsolete — everything accounts/auth/startupdb/admin-related was removed with the rewrite.

### Broken / pending wiring (the next tasks)

- **Subscribe page is a stub**: `/subscribe` renders only `PageMeta`; `src/features/subscribe/` is empty. Implementing the newsletter sign-up UI (posting to `/newsletter-subscribe`) is the next task.
- **No frontend API wiring**: the contact form UI exists (`src/features/contact/`) but nothing calls `/contact-submit` — the old `src/lib/` API layer was removed and not yet replaced. React Query + zod are installed for this.
- **Nginx `/api/` proxy mismatches the backend**: `nginx.conf` proxies `/api/` → `http://backend:8000`, but the backend routes are mounted at the root (`/contact-submit`, `/newsletter-subscribe`) and the backend Dockerfile runs on port **80**. Neither the path nor the port currently lines up — reconcile when wiring the API (either mount the routes under `/api/` or adjust the proxy, and fix the port).
- **Backend Dockerfile is broken**: it copies `requirements.txt`, which does not exist (deps are managed by uv/`pyproject.toml`), and runs `fastapi run app/main.py --port 80`. The image build fails as-is.
- **Frontend Dockerfile is broken**: it does `COPY nginx.conf ...` from the build context, but there is no `frontend/nginx.conf` — the only Nginx config is the repo-root `nginx.conf`, which compose mounts over `/etc/nginx/conf.d/default.conf` at runtime. The image build fails as-is (add the file to the context or drop the COPY).
- **Compose backend service is broken**: `command: uv run uvicorn main:app --reload` references the wrong module path (the app is `app.main:app`), the image has no uv/venv (it's a plain pip image), and the dev volume mounts `./backend` to `/app` while the Dockerfile `WORKDIR` is `/code`.

### CI/CD

- **Backend CI test step is stale**: it runs `uv run python manage.py test` with `SECRET_KEY`/`DEBUG` env — there is no `manage.py` (Django is gone). The step fails until replaced with a real FastAPI test command (none exists yet — no backend tests).
- **`IMAGE_TAG` pinning is not wired**: the deploy script exports `IMAGE_TAG` (commit short SHA), but both compose files hardcode `image: ...:latest` — the variable is unused, so deploys always pull `:latest` and rollback-by-tag doesn't work. Wire it in (e.g. `image: ghcr.io/rorycondict/evp-website/${SERVICE}:${IMAGE_TAG:-latest}`) or remove the export.

### Security regressions (removed with the rewrite, pending re-introduction)

- **No rate limiting anywhere**: the old `django-ratelimit` + Nginx `limit_req_zone` layers are gone. The two POST endpoints are currently unthrottled.
- **No security headers**: `nginx.conf` no longer sets HSTS, CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`.
- **No CORS configuration** on the FastAPI app — fine once everything is same-origin behind the Nginx proxy, but needs thought if the backend is ever exposed directly.
- **Hardcoded Resend IDs**: the Contact Handler segment ID and the `contact-form-notification` template ID are hardcoded in `app/main.py` — candidates for settings/env vars.

### Dead / stale code & tooling

- **Unused frontend dependencies**: `dompurify` and `marked` (leftovers from the removed admin-email Markdown rendering); `@tanstack/react-query` and `zod` are installed but unused until the API wiring lands.
- **`backend/README.md` is empty**; the root README is the source of truth.
- **GitHub Actions are pinned by major tag** (not commit SHA) — supply-chain hardening opportunity.
- **`resend.api_key` is set at import time and re-assigned inside the contact handler** — harmless but redundant; initialise once.

## Common Gotchas & Fixes

### Production / CI/CD

- **`docker-compose up -d` fails with `CNI network "evp-website_default" not found`**
  - Cause: Podman on Tardis uses CNI with `cniVersion: 1.0.0` in the conflist, but `docker-compose` v1 expects `0.4.0`.
  - Fix: Edit `~/.config/cni/net.d/<compose-project-name>.conflist` and change `"cniVersion": "1.0.0"` → `"0.4.0"`, then re-run `docker-compose up -d`.
  - The compose project name is typically the directory name — e.g. `evp-website_default.conflist`.

- **SSH deploy works but `docker-compose` fails with `PermissionError(13, 'Permission denied')`**
  - The server uses Podman rootless (no `/var/run/docker.sock`). The deploy script runs `systemctl --user start podman.socket` and sets `DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock` before invoking `docker-compose`.
