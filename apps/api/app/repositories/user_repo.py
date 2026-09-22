"""HELIORA API — User repository.

Encapsulates database operations for the User entity.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User


class UserRepository:
    """Data-access repository for users."""

    async def get_by_id(self, session: AsyncSession, user_id: uuid.UUID) -> User | None:
        """Fetch user by primary key ID."""
        result = await session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, session: AsyncSession, email: str) -> User | None:
        """Fetch user by normalized email address."""
        result = await session.execute(
            select(User).where(User.email == email.lower().strip())
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        session: AsyncSession,
        *,
        id: uuid.UUID | None = None,
        email: str,
        password_hash: str | None = None,
        full_name: str,
    ) -> User:
        """Create and persist a new user."""
        user = User(
            email=email.lower().strip(),
            password_hash=password_hash,
            full_name=full_name.strip(),
        )
        if id is not None:
            user.id = id
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


user_repo = UserRepository()
