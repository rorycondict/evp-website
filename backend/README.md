# EVP Website: Backend

FastAPI backend for the [Edinburgh VenturePoint website](../README.md).

The root `README.md` is the source of truth for full project documentation; `AGENTS.md` covers developer/agent guidance and known issues.

## Overview

- **App**: single module at `src/main.py` (entrypoint `src.main:app`), Python ≥ 3.14, managed with [uv](https://docs.astral.sh/uv/).
- **Endpoints** (both under `/api/`, integrated with [Resend](https://resend.com), no database):
  - `POST /api/contact-submit` - notifies the "Contact Handler" Resend segment of new enquiries.
  - `POST /api/newsletter-subscribe` - creates a Resend contact.
- **Mock mode**: with no `RESEND_API_KEY` set, submissions are logged instead of sent.
- **Config**: copy `.env.example` to `.env` and set `RESEND_API_KEY`.

## Commands

```sh
uv sync               # install deps (dev group included)
uv run fastapi dev    # dev server with reload (serves src.main:app)
uv run ruff check     # lint
```

## OpenAPI / codegen

`scripts/export_openapi.py` dumps the OpenAPI spec to `openapi.json`, which the frontend consumes via orval (`npm run codegen` from `frontend/`). Re-export and commit the spec after changing endpoints.
