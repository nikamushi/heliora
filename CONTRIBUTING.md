# Contributing

## Branch Strategy

This monorepo uses a single long-lived branch. There is **no `develop` branch**. The PM reviews changes in Pull Requests before they enter `main`.

### Long-lived branch: `main`

- Primary repository branch
- Integration branch
- Represents the current accepted state of the project
- Production-ready when the project is in production/release stage
- All development work is merged into `main` through Pull Requests

Do not create or use a `develop` branch.

### Branch types

Use these conventional branch types:

| Type | Use for |
| --- | --- |
| `feature/` | New functionality or feature work |
| `fix/` | Bug fixes |
| `hotfix/` | Urgent fixes |
| `chore/` | Maintenance, setup, configuration, repository housekeeping |
| `refactor/` | Restructuring without changing intended behavior |
| `docs/` | Documentation changes |
| `test/` | Testing-related changes |
| `perf/` | Performance improvements |
| `ci/` | CI/CD changes |
| `build/` | Build system or dependency/tooling changes |
| `revert/` | Reverting a previous change |

Choose the type based on the **nature of the work**, not the Task ID prefix.

### Branch naming

Format:

```text
<type>/<task-id>-<one-line-description>
```

Example:

```text
chore/setup-001-repository-setup
```

#### Task ID

The Task ID **must** come from the corresponding task in [`docs/TASK.md`](docs/TASK.md).

- Normalize the Task ID to lowercase in the branch name (`SETUP-001` → `setup-001`).
- Do not invent, modify, replace, or substitute a different identifier.

#### One-line description

The one-line description **must** come from the corresponding task in `docs/TASK.md`.

- Do not rewrite, paraphrase, improve, invent, summarize differently, or add context (including developer names).
- Only normalize existing wording for branch-name syntax when necessary:
  - lowercase
  - spaces to hyphens
  - remove characters that are invalid or inappropriate in a Git branch name

`docs/TASK.md` is the **source of truth** for Task IDs and task titles. If the Task ID, title, one-line description, or which task the work belongs to is unclear, stop and inspect `docs/TASK.md` before creating the branch. Do not infer a new task name from implementation details when the task already exists there.

#### Developer names

Developer names, usernames, initials, or personal identifiers must **not** appear in branch names.

Bad: `feature/voldy-auth-003-login`  
Good: `feature/auth-003-implement-login`

### Examples

| Task in `docs/TASK.md` | Branch |
| --- | --- |
| `SETUP-001 — Repository Setup` | `chore/setup-001-repository-setup` |
| `AUTH-003 — Implement Login` | `feature/auth-003-implement-login` |
| `BUG-007 — Fix Token Expiration` | `fix/bug-007-fix-token-expiration` |
| `DOCS-002 — Update Architecture Documentation` | `docs/docs-002-update-architecture-documentation` |
| `CI-004 — Configure GitHub Actions` | `ci/ci-004-configure-github-actions` |

### Source and target

All working branches originate from `main` and merge back into `main` through a Pull Request:

```text
main
  → <type>/<task-id>-<one-line-description>
  → Pull Request
  → main
```

This applies to all branch types, including `hotfix/*`.

There is no synchronization with `develop` because `develop` does not exist.

### Pull Request flow

Pull Requests are the integration point for all working branches:

```text
working branch → Pull Request → main
```

Do not bypass the Pull Request workflow for normal development.
