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

## Commit Convention

Every commit must be traceable to a parent task and child task in [`docs/TASK.md`](docs/TASK.md).

### Summary

Format:

```text
<TASK-ID>.<CHILD-TASK-ID>: <imperative action>
```

Example:

```text
SETUP-001.05: configure commit convention
```

Rules:

- Start with the exact parent Task ID and child Task ID from `docs/TASK.md`.
- Describe one logical change.
- Use imperative language.
- Be concise.
- Do not add conventional commit types such as `feat:`, `fix:`, or `chore:`.
- Do not mention the executor.
- Do not mention automation systems in the summary.

### Child Task ID

`docs/TASK.md` is the source of truth for Task IDs and child tasks.

- Parent ID = the heading ID (for example `SETUP-001`).
- Child ID = the **1-based ordinal** of the checklist item under that parent, zero-padded to 2 digits (`.01`, `.02`, …).
- If a parent task has **no** checklist children, use `TASK-ID.00`.

Do not invent, rename, or approximate Task IDs. If the correct ID is unclear, stop and inspect `docs/TASK.md`.

### Description

Commit descriptions must contain only two sections:

```text
Why: <why the change is needed>

How: <how the change was implemented>
```

- **Why** answers: why does this change need to exist? Do not merely restate the summary.
- **How** answers: how was the change implemented?

Do not add `Who`, `When`, or `Where` to commit descriptions. Git already records author, timestamp, and file context.

### Examples

Good:

```text
SETUP-001.02: configure branch strategy

Why: Establish a consistent branching workflow for parallel development.

How: Document trunk-based flow with typed working branches merged to main through pull requests.
```

Bad:

```text
chore: configure branch strategy
SETUP-001: did some repository setup
SETUP-001.01: configured the branch strategy
```

## Multiple Commits and Push Workflow

A branch may contain multiple commits before a Pull Request is created. Each commit should be a meaningful logical checkpoint.

Expected workflow:

```text
Create branch
    ↓
Implement change
    ↓
Commit
    ↓
Push
    ↓
Continue implementation
    ↓
Commit
    ↓
Push
    ↓
Repeat as needed
    ↓
Create Pull Request when ready
```

Do not open a Pull Request merely because a commit was pushed. A Pull Request represents the complete reviewable change on the branch.

## Pull Request Convention

Pull Request titles use the parent Task ID:

```text
<TASK-ID>: <overall change>
```

Example:

```text
SETUP-001: Repository Setup
```

Pull Request descriptions use the full 5W1H structure and explain the complete branch change, not individual commit messages:

```text
What:
<what was changed>

Why:
<why the change was needed>

Who:
<who is involved or affected>

When:
<when the change applies or becomes relevant>

Where:
<where the change applies>

How:
<how the change was implemented>
```

Use the repository PR template at [`.github/pull_request_template.md`](.github/pull_request_template.md).


## CI/CD

Pull Requests must pass the **`CI Gate`** required check. The pipeline runs
path-filtered lint, typecheck, build, and test jobs for web, API, and mobile,
plus CodeQL and dependency review. Deployment and mobile release run only from
`main`/tags after the required secrets are configured.

Full pipeline, secrets, and rollback documentation:
[`docs/CI-CD.md`](docs/CI-CD.md).


## Local Git Hooks

This repository ships a `commit-msg` hook under [`.githooks/`](.githooks/). Enable it once per clone:

```bash
git config core.hooksPath .githooks
```

The hook validates:

- Commit summary format `TASK-ID.CHILD-TASK-ID: <imperative action>`
- Parent and child Task IDs against [`docs/TASK.md`](docs/TASK.md)
- Presence of `Why:` and `How:` section headers (not prose quality)
- Absence of forbidden automation attribution

Merge and revert commits created by Git are skipped.
