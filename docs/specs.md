# Product Requirements Document — Edinburgh VenturePoint Website

|                  |                                           |
| ---------------- | ----------------------------------------- |
| **Product**      | Edinburgh VenturePoint (EVP) Website      |
| **Status**       | In transition — FastAPI rewrite landed; subscribe page & frontend API wiring pending |
| **Hosting**      | Tardis servers (https://tardisproject.uk) |
| **Last updated** | 2026-09-09                                |

## 1. Overview

The official website for **Edinburgh VenturePoint**, an entrepreneurship society at the
University of Edinburgh. The site presents the society to students, founders, sponsors,
and partners; showcases events and startups; provides contact pathways; and (planned)
lets visitors subscribe to a newsletter.

> **2026-09 rewrite note:** the backend was rewritten from Django to **FastAPI** and
> drastically slimmed down. Member accounts, passwordless OTP authentication, roles,
> the internal startup database, the Django admin panel, and admin update emails were
> **removed**. The site is now fully public; the backend exposes exactly two endpoints
> (contact form + newsletter subscribe). A `/subscribe` page exists as a stub and the
> frontend is not yet wired to the API — these are the next tasks.

## 2. Goals & Objectives

- Present a professional public face for the society to prospective members, sponsors, and partners.
- Promote upcoming and past **events** (talks, hackathons, networking, competitions).
- Showcase member/alumni **startups**.
- Provide clear **contact** channels for enquiries and sponsorship.
- Communicate the society's mission, team, and history (**About**).
- Let visitors **subscribe to the newsletter** (page stubbed; backend endpoint live).

## 3. Target Audience

- University of Edinburgh students interested in entrepreneurship (primary).
- Startup founders and alumni affiliated with the society.
- Sponsors, investors, and partner organisations.
- Guest speakers and event collaborators.

## 4. Scope

### 4.1 In Scope (current pages)

| Page      | Route        | Purpose                                                           |
| --------- | ------------ | ----------------------------------------------------------------- |
| Home      | `/`          | Landing page, hero, highlights, calls to action                   |
| About     | `/about`     | Mission, history, committee/team                                  |
| Startups  | `/startups`  | Showcase of society-affiliated startups and partner organisations |
| Events    | `/events`    | Upcoming and past events                                          |
| Contact   | `/contact`   | Contact form / enquiry details                                    |
| Subscribe | `/subscribe` | Newsletter sign-up (**stub** — implementation pending)            |
| Privacy   | `/privacy`   | Privacy Policy (static legal copy)                                |
| Terms     | `/terms`     | Terms of Service (static legal copy)                              |
| Error     | `*` (404)    | Friendly not-found / error page                                   |

### 4.2 Backend Capabilities

- **FastAPI** app (single module, `backend/app/main.py`), no database. Exactly two
  endpoints, both integrated with **Resend**:
  - `POST /contact-submit` — validates the contact form (`first_name`, `last_name`,
    `email`, `message`), then notifies the members of a hardcoded Resend
    "Contact Handler" segment by BCC using the `contact-form-notification`
    Resend template. Returns `204` on success (including mock mode) and `502`
    with a generic error detail on Resend failures.
  - `POST /newsletter-subscribe` — validates the submission (`email`, `first_name`,
    `last_name`) and creates a Resend contact. Returns `204` on success and `502`
    on failure.
- **Mock mode**: when `RESEND_API_KEY` is unset, submissions are logged and return
  `204` — the site works end-to-end locally without any keys.
- **Auto-generated API docs** at `/docs` on the backend (FastAPI default; not
  currently proxied through Nginx).

### 4.3 Out of Scope / Removed

- **Member accounts and authentication** (removed in the rewrite — no login,
  roles, or sessions).
- **Internal startup database** and its API (removed).
- **Django admin panel** (removed with Django).
- **Admin update emails / member communications** (removed).
- **Rate limiting and edge security headers** (removed with the rewrite; pending
  re-introduction — see AGENTS.md Known Issues).
- Payments, ticketing, or e-commerce.
- Blog/CMS.

## 5. Functional Requirements

1. The site shall render all public pages as a client-side React SPA with a shared layout.
2. Unknown routes shall display a styled 404 error page.
3. The backend shall expose `POST /contact-submit` and `POST /newsletter-subscribe`
   with Pydantic validation, returning `204` on success and `502` on email-service
   failure (and logging instead of sending when no API key is configured).
4. The Contact page form shall submit to `/contact-submit` (**wiring pending** —
   the form UI exists but does not yet call the API).
5. The Subscribe page shall let visitors sign up to the newsletter via
   `/newsletter-subscribe` (**page currently a stub — implementation next**).
6. The frontend shall call the API through a central, runtime-validated (zod)
   client layer with React Query (**pending** — dependencies installed, layer
   not yet built).
7. `robots.txt` and `sitemap.xml` shall be served from `frontend/public/`.

## 6. Non-Functional Requirements

- **Performance**: static assets served via Nginx; frontend built and minified by Vite.
- **SEO**: `robots.txt` and `sitemap.xml` served from `frontend/public/`.
- **Reliability**: fully containerized (Docker Compose); production deploys automated via GitHub Actions (CI test job → matrix build → GHCR → SSH update). Images are tagged `latest` + commit SHA, but tag pinning is not yet wired into the compose files (see AGENTS.md Known Issues).
- **Security**: environment-based secrets (`backend/.env` in dev; a root-level `.env` via compose `env_file` in prod; the only secret is `RESEND_API_KEY`), no committed credentials. **Note:** rate limiting and Nginx security headers were removed in the rewrite and are pending re-introduction (see AGENTS.md Known Issues).
- **Maintainability**: TypeScript + ESLint/Prettier on the frontend; type-hinted Python + Pydantic on the backend. Frontend tests via Vitest + @testing-library/react; **no backend tests yet**.

## 7. Technical Architecture

- **Frontend**: React 19 + Vite 8 + TypeScript 6, React Router 7, Tailwind CSS 4, three.js, framer-motion. Path aliases `@/`. Served by Nginx on port 16017.
- **Backend**: FastAPI + Pydantic (single module), run by uvicorn/the FastAPI CLI. No database — Resend is the only external service.
- **Infra**: Docker Compose orchestration (frontend, backend); images in GHCR at `ghcr.io/rorycondict/evp-website/<service>`; CI/CD on push to `main` (test → build-and-push → deploy) and on PRs (test + build only). GHA layer caching (type=gha) used for faster builds.
- See `AGENTS.md` at the repo root for detailed developer/agent guidance (including known issues from the rewrite).

## 8. Success Metrics

- Uptime on Tardis hosting.
- Event page engagement (visits around announced events).
- Contact/enquiry conversion through the Contact page.
- Newsletter signups via the Subscribe page (once implemented).
- Successful automated deployments.

## 9. Future Considerations

- **Implement the Subscribe page UI** (next task) and **wire the frontend to the API** (contact form + subscribe), including a central API client with zod validation.
- Reconcile the Nginx `/api/` proxy with the backend (path prefix and port — see AGENTS.md Known Issues) as part of the API wiring.
- Re-introduce **rate limiting** (edge and/or app level) for the two POST endpoints.
- Re-introduce **security headers** (HSTS, CSP, etc.) at the Nginx edge.
- Add a **backend test suite** (pytest + FastAPI TestClient) and fix the stale CI backend test step.
- Wire **`IMAGE_TAG` pinning** into the compose files for reliable rollbacks.
- Move the hardcoded Resend segment/template IDs into configuration.
- Event RSVP/ticketing integration; public startup directory — possible future features, currently out of scope.
