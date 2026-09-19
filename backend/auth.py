from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
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

security = HTTPBearer(auto_error=False)

# The Supabase JWT secret — must match what the local/remote Supabase instance uses.
# Local default: "super-secret-jwt-token-with-at-least-32-characters-long"
# In production: set SUPABASE_JWT_SECRET to the value from your Supabase project settings.
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "super-secret-jwt-token-with-at-least-32-characters-long")

# DEV BYPASS — set DEV_BYPASS_AUTH=true in your environment to skip JWT verification.
# REMOVE or set to false before any real deployment.
DEV_BYPASS_AUTH = os.getenv("DEV_BYPASS_AUTH", "false").lower() == "true"

async def get_current_user(token: Optional[HTTPAuthorizationCredentials] = Depends(security), db: AsyncSession = Depends(get_db)) -> UserContext:
    """Verify Supabase JWT signature and extract user context."""
    # ─── DEV BYPASS ──────────────────────────────────────────────────────────
    # When DEV_BYPASS_AUTH=true, skip JWT verification entirely.
    # Returns a hardcoded mine_manager context for mine 00000000-0000-0000-0000-000000000004.
    if DEV_BYPASS_AUTH:
        return UserContext(
            user_id="00000000-0000-0000-0000-000000000010",
            mine_ids=["00000000-0000-0000-0000-000000000004"],
            subsidiary_id=None,
            role="mine_manager",
            permissions=[],
        )
    # ─────────────────────────────────────────────────────────────────────────
    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization token")
    try:
        # Verify signature + expiry. Supabase sets audience to "authenticated".
        # Temporarily adding more algorithms and logging for debugging
        unverified_header = jwt.get_unverified_header(token.credentials)
        print(f"DEBUG: Token unverified header: {unverified_header}", flush=True)
        
        claims = jwt.decode(
            token.credentials,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256", "RS256", "HS384", "RS384", "HS512", "RS512", "EdDSA"],
            options={"verify_aud": False},  # Supabase omits standard aud in some tokens
        )
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {e}. Header: {jwt.get_unverified_header(token.credentials)}")

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Missing user ID in token")

    # Look up user in DB by UUID
    user_row = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_row.scalar_one_or_none()

    if not user:
        # User authenticated via Supabase Auth but not yet in the `users` table.
        # This should not happen in normal flow — seed_demo.py must be run first.
        raise HTTPException(
            status_code=403,
            detail=f"User {user_id} authenticated but not found in the COMET users table. "
                   "Run `python seed_demo.py` to seed demo users."
        )

    # Look up role from user_roles -> roles
    role_row = await db.execute(
        select(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
        .limit(1)
    )
    role = role_row.scalar_one_or_none()
    role_name = role.value if hasattr(role, "value") else (role if role else "field_officer")

    mine_ids = [str(user.mine_id)] if user.mine_id else []
    
    return UserContext(
        user_id=str(user.id),
        mine_ids=mine_ids,
        subsidiary_id=str(user.subsidiary_id) if user.subsidiary_id else None,
        role=role_name,
        permissions=[]
    )

