# HELIORA

AI-Powered Preventive Health Intelligence Platform.

## Overview

HELIORA is a competition MVP for INSEVENT 2026 (SDG 3) that helps people understand health from lifestyle patterns, estimate non-communicable disease risk, simulate lifestyle changes, and get preventive, evidence-based AI recommendations. It is not medical diagnosis, telemedicine, or a substitute for clinicians.

This repository currently holds product documentation and monorepo scaffolding. Application packages are not scaffolded yet.

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python
- **Database:** PostgreSQL
- **Monorepo:** Turborepo, pnpm, uv

## Getting Started

Application workspaces are not set up yet, so there is no install or run flow for the web or API apps.

Enable the local `commit-msg` hook once per clone:

```bash
git config core.hooksPath .githooks
```

Branch, commit, and PR conventions are in [CONTRIBUTING.md](CONTRIBUTING.md). Tasks and progress live in [docs/TASK.md](docs/TASK.md).

## Documentation

- [PRD](docs/PRD.md)
- [Architecture](docs/Architecture.md)
- [Design](docs/Design.md)
- [Monorepo](docs/Monorepo.md)
- [TASK](docs/TASK.md)
- [CONTRIBUTING](CONTRIBUTING.md)

## Project Structure

```text
heliora/
├── .githooks/          # Local git hooks
├── .github/            # PR template
├── docs/               # PRD, Architecture, Design, Monorepo, TASK
├── CONTRIBUTING.md
├── package.json        # Turborepo scripts
├── pnpm-workspace.yaml
├── pyproject.toml      # uv workspace
└── turbo.json
```

Planned `apps/`, `packages/`, and related layout are described in [docs/Monorepo.md](docs/Monorepo.md).
