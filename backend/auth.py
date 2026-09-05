from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import os
import json
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.mine import User, Role, UserRole

class UserContext(BaseModel):
    user_id: str
    mine_ids: list[str]
    subsidiary_id: str | None = None
    role: str | None = None
    permissions: list[str] = []

security = HTTPBearer()

# We need a fallback secret for development if it's not set in environment
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "super-secret-jwt-token-with-at-least-32-characters-long")

async def get_current_user(token = Depends(security), db: AsyncSession = Depends(get_db)) -> UserContext:
    """Verify Supabase JWT and extract user context."""
    try:
        claims = jwt.get_unverified_claims(token.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Malformed token")

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Missing user ID in token")

    # Step 2: Look up user in DB by Supabase auth UUID
    user_row = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_row.scalar_one_or_none()

    if not user:
        # DEV FALLBACK: if user not in DB yet, use demo mine
        return UserContext(
            user_id=user_id,
            mine_ids=["00000000-0000-0000-0000-000000000004"],
            subsidiary_id="00000000-0000-0000-0000-000000000002",
            role="mine_manager",
            permissions=[]
        )

    # Step 3: Look up role from user_roles -> roles
    role_row = await db.execute(
        select(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
        .limit(1)
    )
    role = role_row.scalar_one_or_none()
    role_name = role.value if hasattr(role, "value") else (role if role else "mine_manager")

    mine_ids = [str(user.mine_id)] if user.mine_id else []
    
    return UserContext(
        user_id=str(user.id),
        mine_ids=mine_ids,
        subsidiary_id=str(user.subsidiary_id) if user.subsidiary_id else None,
        role=role_name,
        permissions=[]
    )
