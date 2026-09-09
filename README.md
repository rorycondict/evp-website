<div align="center"> 
  <img align="center" width="100" alt="evp-logo" src="https://github.com/user-attachments/assets/d725a3b9-13b0-426a-a8ce-d2a8ef924ed0" />
</div>

<h1 align="center"> 
  Edinburgh VenturePoint Website
</h1>

<h3 align="center"> The official website for Edinburgh VenturePoint, an <br/>entrepreneurship society at the University of Edinburgh.</h3>  

<h2 align="center"> 
  Access the live website at:<br/>
  https://edinburghventurepoint.com
</h2>

<p align="center">
  This project is deployed and hosted on Tardis' servers: https://tardisproject.uk
</p>

<br/>
<br/>

# Prerequisites

* [Docker](https://www.docker.com/) and Docker Desktop installed.
* Make sure the Docker daemon is running before proceeding.

<br/>

# Installation

If you wish to run this project locally for development or review, it is fully containerized with Docker.

1.  Clone the repo
    ```sh
    git clone https://github.com/rorycondict/evp-website
    ```

2.  Navigate to the directory
    ```sh
    cd evp-website
    ```

3.  Set up your environment variables. 
    * Navigate to the backend directory and duplicate the example file:
    ```sh
    cp backend/.env.example backend/.env
    ```
    * Open the new `.env` file and set `RESEND_API_KEY`. Leave the placeholder as-is to run the backend in mock mode (submissions are logged instead of sent).
    
4.  Build and spin up the containers (ensure Docker Desktop is running)
    ```sh
    docker compose up --build
    ```

<br/>

The local development server will be available at: `http://localhost:16017`

> **Note (mid-rewrite):** the backend was recently rewritten from Django to FastAPI and the Docker builds are still being brought up to date — see `AGENTS.md` (Known Issues) for the pending work, or use the standalone dev commands below.

<br/>

# Tech Stack

### Frontend
* **React 19 + TypeScript 6:** UI library and type-safe component-driven interfaces.
* **Vite 8:** Next-generation frontend tooling for rapid development and HMR.
* **Tailwind CSS 4 + Sass:** Utility-first styling with CSS preprocessing.
* **React Router 7:** Client-side routing (data router via `createBrowserRouter`).
* **TanStack React Query + zod:** Installed for the upcoming API wiring (not yet used).
* **framer-motion + three.js:** Animations and 3D graphics.
* **Node.js:** JavaScript runtime environment.

### Backend
* **FastAPI + Pydantic:** Python web framework with request validation (single-module app in `backend/app/main.py`).
* **Python ≥ 3.13:** Backend language (managed with **uv**).
* **Resend:** Email delivery and contact management — the only external service (there is no database).
* **Ruff:** Python linter.

### Infrastructure & Deployment
* **Docker & Docker Compose:** Containerization of the frontend and backend environments.
* **Nginx:** Serves the SPA, handles legacy URL redirects, and proxies API traffic (proxy wiring pending).
* **GitHub Actions (CI/CD):** Automated test → build → push to GHCR → SSH deploy on push to `main`.
* **GHCR:** Images published at `ghcr.io/rorycondict/evp-website/<service>`.

<br/>

# Key Features

* **Public-facing pages:** Home, About, Startups showcase, Events, Contact form, Subscribe (stub), Privacy Policy, and Terms of Service.
* **Contact form endpoint:** `POST /contact-submit` notifies the Resend "Contact Handler" segment of new enquiries.
* **Newsletter subscribe endpoint:** `POST /newsletter-subscribe` creates a Resend contact.
* **Mock mode:** without a `RESEND_API_KEY`, the backend logs submissions instead of sending them.
* **No accounts or authentication:** the site is fully public — member accounts, roles, the internal startup database, and the admin panel were removed in the FastAPI rewrite.
* **Pending:** the Subscribe page UI and the frontend API wiring are the next tasks.

<br/>

# Development

To work on the frontend or backend outside Docker:

**Frontend** (Node ≥ 22):
```sh
cd frontend
npm install
npm run dev        # Vite dev server (proxies /api to http://127.0.0.1:16017)
npm run test       # Vitest (run once)
npm run lint       # ESLint
npm run format     # Prettier
```

**Backend** (Python ≥ 3.13, managed with [uv](https://docs.astral.sh/uv/)):
```sh
cd backend
uv sync               # install deps
uv run fastapi dev    # dev server with reload (serves app.main:app)
uv run ruff check     # lint
```

There is no backend test suite yet.

<br/>

# Architecture

The project is a decoupled SPA + API:

```
Browser → Nginx (port 16017) → React SPA (static files)
                           └── /api/ → FastAPI backend (proxy wiring pending)
```

* **Frontend** (`frontend/`): React 19 SPA built by Vite, served as static files by Nginx. Routes are defined in `src/app/router.tsx`, with thin page wrappers in `src/app/routes/` and feature modules in `src/features/`.
* **Backend** (`backend/`): FastAPI single-module app (`app/main.py`) exposing two POST endpoints (contact form + newsletter subscribe), integrated with Resend. No database, no auth.
* **Infrastructure**: Docker Compose orchestrates the containers. CI/CD builds images, pushes them to GHCR, and deploys via SSH.

See `AGENTS.md` at the repo root for detailed developer/agent guidance (including known issues and pending work), and `docs/specs.md` for the full PRD.
