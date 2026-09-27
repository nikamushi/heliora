"""Preflight check for the Google sign-in path (ADR-011).

The Google sign-in flow spans the Supabase Auth service, the API's JWKS
verifier, and the Supabase Postgres that stores the user row. Each layer fails
in a way that looks identical from the browser — a 401 or a dead end on
/auth/callback — so this walks the layers in the order they are consulted and
names the first one that is wrong.

Run it from ``apps/api`` before attempting a real sign-in::

    npm run check:supabase

It reads the same ``.env`` the API reads, makes no writes, and exits non-zero
if any required check fails.
"""

import asyncio
import sys

import httpx
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine

PASS = "PASS"
FAIL = "FAIL"
WARN = "WARN"

results: list[tuple[str, str, str]] = []


def record(status: str, label: str, detail: str = "") -> None:
    results.append((status, label, detail))


def check_environment() -> None:
    """Confirm the settings the verifier dispatches on are present."""
    if settings.SUPABASE_URL:
        record(PASS, "SUPABASE_URL is set")
    else:
        record(FAIL, "SUPABASE_URL is not set", "Set it to https://<ref>.supabase.co")

    if settings.SUPABASE_JWKS_URL:
        record(PASS, "SUPABASE_JWKS_URL is set", settings.SUPABASE_JWKS_URL)
    else:
        record(
            FAIL,
            "SUPABASE_JWKS_URL is not set",
            "Set it to <SUPABASE_URL>/auth/v1/.well-known/jwks.json",
        )

    if settings.SUPABASE_ISSUER:
        record(PASS, "SUPABASE_ISSUER is set", settings.SUPABASE_ISSUER)
    else:
        record(
            FAIL,
            "SUPABASE_ISSUER is not set",
            "Set it to <SUPABASE_URL>/auth/v1, otherwise issuer checks are skipped",
        )

    if settings.SUPABASE_AUDIENCE == "authenticated":
        record(PASS, "SUPABASE_AUDIENCE is 'authenticated'")
    else:
        record(
            WARN,
            f"SUPABASE_AUDIENCE is {settings.SUPABASE_AUDIENCE!r}",
            "Supabase mints these tokens for the 'authenticated' audience",
        )

    host = settings.DATABASE_URL.split("@")[-1].split("/")[0]
    if "supabase" in host or "pooler.supabase" in host:
        record(PASS, "DATABASE_URL points at Supabase", host)
    else:
        record(
            FAIL,
            f"DATABASE_URL does not look like Supabase ({host})",
            "Google tokens resolve through public.users in the Supabase Postgres",
        )


def check_jwks_endpoint() -> None:
    """Confirm the verifier can actually reach and parse the signing keys."""
    if not settings.SUPABASE_JWKS_URL:
        record(FAIL, "JWKS endpoint not reachable", "Skipped: no URL configured")
        return

    try:
        response = httpx.get(settings.SUPABASE_JWKS_URL, timeout=10.0)
        response.raise_for_status()
        keys = response.json().get("keys", [])
    except Exception as exc:
        record(FAIL, "JWKS endpoint not reachable", str(exc))
        return

    if not keys:
        record(FAIL, "JWKS endpoint returned no keys")
        return

    without_kid = [k for k in keys if not k.get("kid")]
    if without_kid:
        record(FAIL, "JWKS keys are missing 'kid'")
        return

    record(
        PASS,
        f"JWKS endpoint serves {len(keys)} key(s)",
        ", ".join(k["kid"] for k in keys),
    )


async def check_database() -> None:
    """Confirm the Supabase Postgres can provision a row for a Google user."""
    try:
        async with engine.connect() as conn:
            has_auth_schema = (
                await conn.execute(
                    text(
                        "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
                        "WHERE table_schema = 'auth' AND table_name = 'users')"
                    )
                )
            ).scalar()

            if has_auth_schema:
                record(PASS, "auth.users exists (this is a Supabase Postgres)")
            else:
                record(
                    FAIL,
                    "auth.users is missing",
                    "The API is pointed at a plain Postgres. Google sign-in "
                    "cannot provision users there. Point DATABASE_URL at the "
                    "Supabase Postgres.",
                )
                return

            triggers = (
                (
                    await conn.execute(
                        text(
                            "SELECT tgname FROM pg_trigger "
                            "WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal"
                        )
                    )
                )
                .scalars()
                .all()
            )

            if "handle_new_user" in triggers:
                record(PASS, "handle_new_user trigger is installed")
            else:
                record(
                    FAIL,
                    "handle_new_user trigger is missing",
                    "Apply supabase/schema.sql to the Supabase Postgres, or "
                    "create the trigger manually. Without it a Google user "
                    "authenticates but has no public.users row.",
                )

            nullable = (
                await conn.execute(
                    text(
                        "SELECT is_nullable FROM information_schema.columns "
                        "WHERE table_schema = 'public' AND table_name = 'users' "
                        "AND column_name = 'password_hash'"
                    )
                )
            ).scalar()

            if nullable is None:
                record(
                    FAIL,
                    "public.users.password_hash is missing",
                    "Apply supabase/schema.sql",
                )
            elif nullable == "YES":
                record(PASS, "public.users.password_hash is nullable")
            else:
                record(
                    FAIL,
                    "public.users.password_hash is NOT NULL",
                    "A Google user has no password, so the insert fails. Apply "
                    "supabase/schema.sql; do not use alembic 001 on Supabase.",
                )
    except Exception as exc:
        # Deliberately broad: a refused connection surfaces from asyncpg as a
        # bare OSError rather than a SQLAlchemyError, and a preflight that
        # tracebacks on an unreachable database is useless. The goal is to name
        # the broken layer, not to diagnose the driver.
        detail = str(exc).splitlines()[0] or type(exc).__name__
        record(FAIL, "Database unreachable", detail)


async def main() -> int:
    check_environment()
    check_jwks_endpoint()
    await check_database()
    await engine.dispose()

    width = max(len(label) for _, label, _ in results)
    print("\nSupabase / Google sign-in preflight\n")
    for status, label, detail in results:
        mark = {PASS: "ok  ", FAIL: "FAIL", WARN: "warn"}[status]
        print(f"  [{mark}] {label.ljust(width)}  {detail}")

    failures = sum(1 for status, _, _ in results if status == FAIL)
    print()
    if failures:
        print(f"{failures} check(s) failed. Fix the FAIL rows above, then retry.\n")
        return 1

    print("All checks passed. A real Google sign-in should now reach /auth/callback.\n")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
