# EVP Website: Frontend

React SPA for the [Edinburgh VenturePoint website](../README.md).

The root `README.md` is the source of truth for full project documentation; `AGENTS.md` covers developer/agent guidance and known issues.

## Stack

- **React 19 + TypeScript 6 + Vite 8**, React Router 7 (data router), Tailwind CSS 4
- **TanStack React Query + axios** — the API client is **orval-generated** into `src/api/generated.ts` (never edit by hand; regenerate with `npm run codegen`)
- **zod** (client-side email validation), **framer-motion**, **three.js**, **lucide-react**/**react-icons**
- Lint/format: **oxlint + Prettier** (no test suite yet)

## Commands

```sh
npm install
npm run dev        # Vite dev server (no /api proxy — form submissions 404 in standalone dev; use docker compose, or re-add the proxy)
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm run format     # Prettier
npm run codegen    # re-export the backend OpenAPI spec and regenerate src/api/generated.ts (requires uv)
```

## Structure

```
src/
├── api/          # generated.ts — orval-generated API client (do not edit)
├── app/          # App shell: router, layout, providers (QueryClientProvider, theme, scroll)
├── components/   # layout (header/footer), theme, three/ (3D background), ui/ (shared UI)
├── features/     # about, connect, contact, events, home, privacy, startups
└── utils/        # cn(), motion helpers
```

Path alias: `@/` → `src/`. Styling is Tailwind utilities only (no new CSS files, no `@apply`); shared patterns live in `src/components/ui/`.
