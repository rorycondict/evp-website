FROM python:3.14-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /code

ENV UV_COMPILE_BYTECODE=1

COPY . /code

RUN uv sync --frozen --no-cache

CMD ["fastapi", "run", "app/main.py", "--port", "80", "--proxy-headers"]