# syntax=docker/dockerfile:1.7

FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.13.5 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Workspace manifests are required to resolve the frozen lockfile.
COPY pyproject.toml uv.lock ./
COPY apps/api/pyproject.toml apps/api/pyproject.toml
COPY packages/ml-core/pyproject.toml packages/ml-core/pyproject.toml
COPY ai/pyproject.toml ai/pyproject.toml

RUN uv sync --frozen --package heliora-api --no-dev --no-install-project

COPY apps/api ./apps/api

RUN uv sync --frozen --package heliora-api --no-dev


FROM python:3.12-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 heliora \
    && useradd --system --uid 10001 --gid heliora --home-dir /app heliora

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH=/app/apps/api

WORKDIR /app

COPY --from=builder --chown=heliora:heliora /app/.venv /app/.venv
COPY --from=builder --chown=heliora:heliora /app/apps/api /app/apps/api

USER heliora

WORKDIR /app/apps/api

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import sys, urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=3).status == 200 else 1)"

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
