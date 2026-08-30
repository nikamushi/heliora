# Monorepo Architecture

## 1. Monorepo Strategy

Heliora uses a polyglot monorepo.

The repository contains JavaScript/TypeScript applications and Python applications/workflows while keeping their dependency-management responsibilities separate.

The monorepo uses:

- Turborepo for task orchestration
- pnpm for the JavaScript/TypeScript workspace
- uv for the Python workspace

The responsibilities are intentionally separated:

| Tool | Responsibility |
|---|---|
| Turborepo | Task orchestration and task-level caching |
| pnpm | JavaScript/TypeScript workspace and dependency management |
| uv | Python workspace and dependency management |

### Principle

> Turborepo orchestrates; pnpm and uv manage their respective ecosystems.

Turborepo must not be treated as a replacement for either package manager.

---

## 2. Repository Structure

The intended repository structure is:

```text
heliora/
│
├── apps/
│   ├── web/                         # Next.js frontend application
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── ...
│   │
│   └── api/                         # FastAPI backend application
│       ├── app/
│       │   ├── api/                 # API routes/controllers
│       │   ├── core/                # Application configuration/core infrastructure
│       │   ├── models/              # Persistence/domain models
│       │   ├── schemas/             # API request/response schemas
│       │   ├── services/            # Application/business services
│       │   ├── repositories/        # Data-access layer
│       │   └── main.py
│       ├── tests/
│       └── pyproject.toml
│
├── packages/
│   └── ml-core/                     # Shared Python ML package
│       ├── src/
│       │   └── ml_core/
│       │       ├── __init__.py
│       │       ├── schemas.py
│       │       ├── preprocessing.py
│       │       ├── inference.py
│       │       └── ...
│       ├── tests/
│       └── pyproject.toml
│
├── ai/                              # AI/ML experimentation and lifecycle
│   ├── datasets/
│   ├── notebooks/
│   ├── training/
│   ├── evaluation/
│   ├── models/
│   └── pyproject.toml
│
├── docs/                            # Project documentation
│   ├── PRD.md
│   ├── Design.md
│   ├── Architecture.md
│   ├── Monorepo.md
│   ├── Database.md
│   └── TASK.md
│
├── infra/                           # Infrastructure and deployment
│   └── docker/
│
├── scripts/                         # Repository-level automation
│
├── .github/
│   └── workflows/                   # CI/CD
│
├── package.json                     # Root JavaScript workspace
├── pnpm-workspace.yaml              # pnpm workspace definition
├── turbo.json                       # Turborepo configuration
├── pyproject.toml                   # Root uv workspace definition
├── pnpm-lock.yaml
├── uv.lock
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

The structure above represents the intended repository boundaries.

The tree is an architectural reference and should not require every listed file or directory to exist immediately.

---

## 3. Directory Ownership

### `apps/`

Contains independently deployable applications.

```text
apps/
├── web/
└── api/
```

`apps/web` owns the Next.js frontend.

`apps/api` owns the FastAPI backend.

Applications own runtime-specific implementation.

Reusable logic should be extracted into an appropriate package when it has a genuine shared responsibility.

---

### `packages/`

Contains reusable packages.

Packages must have clearly defined responsibilities and must not become general-purpose dumping grounds.

---

### `packages/ml-core/`

`ml-core` is the shared Python ML package.

Its responsibility is to contain logic that must remain identical between training and serving.

Examples:

* ML schemas
* model input/output contracts
* preprocessing
* feature engineering
* reusable inference logic
* model-loading abstractions where appropriate

The intended relationship is:

```text
Training:

raw data
    ↓
ml-core preprocessing
    ↓
features
    ↓
model


Serving:

request
    ↓
ml-core preprocessing
    ↓
features
    ↓
model
    ↓
prediction
```

This boundary exists to prevent training-serving skew.

`ml-core` must NOT contain:

* FastAPI routes
* API controllers
* database repositories
* application-specific business logic
* notebooks
* experiment orchestration
* dataset acquisition workflows
* deployment configuration

---

### `ai/`

Contains AI/ML development workflows.

Responsibilities include:

* experimentation
* model training
* evaluation
* notebooks
* dataset workflows
* model artifacts or model references

`ai/` may depend on `packages/ml-core`.

`ai/` must not duplicate train/serve-critical logic that belongs in `ml-core`.

---

### `docs/`

Contains project-level documentation.

`docs/` is repository-level documentation and is not a Turborepo package.

`Monorepo.md` specifically owns repository structure and workspace conventions.

---

### `infra/`

Contains infrastructure and deployment configuration.

Infrastructure must not contain application business logic.

---

### `scripts/`

Contains repository-level automation and utilities that do not belong to an individual application or package.

---

## 4. Workspace Boundaries

### JavaScript/TypeScript Workspace

The JavaScript/TypeScript workspace is managed by pnpm.

Workspace scope:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

This workspace is intended for JavaScript/TypeScript projects.

`ai/` is not part of the pnpm workspace unless a concrete JavaScript/TypeScript package is introduced there.

---

### Python Workspace

The Python workspace is managed by uv.

Workspace members:

```text
apps/api
packages/ml-core
ai
```

Python dependency relationships are owned by uv.

---

## 5. Tooling Responsibilities

### Turborepo

Responsible for:

* task orchestration
* task dependency ordering
* running tasks across workspace projects
* task-level caching where applicable

Turborepo does not manage Python dependencies.

### pnpm

Responsible for:

* JavaScript/TypeScript dependencies
* JavaScript/TypeScript workspace management

### uv

Responsible for:

* Python dependencies
* Python workspace management
* Python package relationships
* Python environments

---

## 6. Dependency Direction

Dependencies should flow toward reusable packages.

Valid:

```text
apps/api
    ↓
packages/ml-core
```

Valid:

```text
ai
    ↓
packages/ml-core
```

Invalid:

```text
packages/ml-core
    ↓
apps/api
```

Invalid:

```text
packages/ml-core
    ↓
ai
```

Shared packages must not depend upward on their consumers.

### Rule

> Reusable packages may be consumed by applications and workflows, but must not depend on those consumers.

---

## 7. Train/Serve Boundary

The ML architecture follows this ownership model:

```text
ai/
    owns experimentation, training, and evaluation

packages/ml-core/
    owns shared train/serve logic

apps/api/
    owns production model serving through the API
```

Therefore:

```text
ai
 └── uses ml-core

apps/api
 └── uses ml-core

ml-core
 └── does not depend on ai or apps/api
```

Critical preprocessing and feature-transformation logic must not be independently reimplemented in both training and serving.

---

## 8. Application Boundaries

### Web

```text
apps/web
```

Owns:

* user interface
* frontend routing
* frontend components
* frontend state
* browser-facing logic
* frontend-specific utilities

It should consume backend capabilities through the API contract rather than directly accessing backend internals.

### API

```text
apps/api
```

Owns:

* HTTP API
* request handling
* application services
* persistence access
* backend-specific business logic
* model serving integration

### AI

```text
ai
```

Owns:

* experiments
* training
* evaluation
* notebooks
* dataset workflows

### ML Core

```text
packages/ml-core
```

Owns:

* shared ML contracts
* preprocessing
* feature engineering
* reusable inference logic

---

## 9. Repository-Level Rules

The following rules apply to the monorepo:

1. Turborepo is the task orchestrator.
2. pnpm manages JavaScript/TypeScript dependencies.
3. uv manages Python dependencies.
4. `apps/web` owns the Next.js application.
5. `apps/api` owns the FastAPI application.
6. `ai/` owns AI/ML experimentation, training, and evaluation.
7. `packages/ml-core` owns train/serve-identical ML logic.
8. Training and serving must not maintain separate copies of critical preprocessing logic.
9. Shared packages must not depend on applications.
10. `docs/` is repository-level documentation.
11. `infra/` owns infrastructure rather than application business logic.
12. Do not introduce Nx or another monorepo orchestration framework without an explicit architectural decision.
13. Do not create shared packages without a clearly defined reusable responsibility.
14. Python dependency management remains under uv.
15. JavaScript/TypeScript dependency management remains under pnpm.
16. Turborepo should orchestrate project tasks rather than dictate application architecture.
17. Do not use path hacks to connect Python workspace projects.
18. Avoid unnecessary coupling between applications and packages.

---

## 10. Source of Truth

`docs/Monorepo.md` is the source of truth for:

* repository structure
* workspace boundaries
* package ownership
* application ownership
* monorepo tooling responsibilities
* dependency direction
* Python/JavaScript workspace separation
* ML shared-code boundaries

Changes to these boundaries should be treated as architectural changes and should be reflected in this document.

`docs/Architecture.md` remains responsible for broader system architecture and is not replaced by this document.
