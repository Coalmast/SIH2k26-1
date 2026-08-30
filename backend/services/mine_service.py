from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from models.mine import Mine, Subsidiary, User, Role, UserRole

class MineService:
    @staticmethod
    async def get_mines(db: AsyncSession, subsidiary_id: Optional[uuid.UUID] = None, status: Optional[str] = None) -> List[Mine]:
        query = select(Mine)
        if subsidiary_id:
            query = query.where(Mine.subsidiary_id == subsidiary_id)
        if status:
            query = query.where(Mine.status == status)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_mine(db: AsyncSession, mine_id: uuid.UUID) -> Optional[Mine]:
        query = select(Mine).where(Mine.id == mine_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_mine(db: AsyncSession, dto) -> Mine:
        mine = Mine(**dto.model_dump())
        db.add(mine)
        await db.commit()
        await db.refresh(mine)
        return mine

    @staticmethod
    async def update_mine(db: AsyncSession, mine_id: uuid.UUID, dto) -> Optional[Mine]:
        mine = await MineService.get_mine(db, mine_id)
        if not mine:
            return None
        
        update_data = dto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(mine, key, value)
            
        await db.commit()
        await db.refresh(mine)
        return mine

    @staticmethod
    async def get_subsidiaries(db: AsyncSession, org_id: Optional[uuid.UUID] = None) -> List[Subsidiary]:
        query = select(Subsidiary)
        if org_id:
            query = query.where(Subsidiary.organization_id == org_id)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_mines_by_subsidiary(db: AsyncSession, sub_id: uuid.UUID) -> List[Mine]:
        return await MineService.get_mines(db, subsidiary_id=sub_id)

    @staticmethod
    async def get_users(db: AsyncSession, mine_id: Optional[uuid.UUID] = None, subsidiary_id: Optional[uuid.UUID] = None, role: Optional[str] = None) -> List[User]:
        query = select(User).options(selectinload(User.roles))
        if mine_id:
            query = query.where(User.mine_id == mine_id)
        if subsidiary_id:
            query = query.where(User.subsidiary_id == subsidiary_id)
        # role filtering could be added with a join on UserRole if needed
        result = await db.execute(query)
        users = result.scalars().all()
        
        if role:
            users = [u for u in users if any(r.name == role for r in u.roles)]
            
        return users

    @staticmethod
    async def get_user(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
        query = select(User).where(User.id == user_id).options(selectinload(User.roles))
        result = await db.execute(query)
        return result.scalar_one_or_none()
        
    @staticmethod
    async def get_user_by_subject(db: AsyncSession, subject: str) -> Optional[User]:
        query = select(User).where(User.keycloak_subject == subject).options(selectinload(User.roles))
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(db: AsyncSession, dto) -> User:
        user = User(**dto.model_dump())
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update_user(db: AsyncSession, user_id: uuid.UUID, dto) -> Optional[User]:
        user = await MineService.get_user(db, user_id)
        if not user:
            return None
        
        update_data = dto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
            
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def assign_role(db: AsyncSession, user_id: uuid.UUID, role_id: uuid.UUID):
        user_role = UserRole(user_id=user_id, role_id=role_id)
        db.add(user_role)
        await db.commit()
        return user_role

    @staticmethod
    async def remove_role(db: AsyncSession, user_id: uuid.UUID, role_id: uuid.UUID):
        query = select(UserRole).where(UserRole.user_id == user_id, UserRole.role_id == role_id)
        result = await db.execute(query)
        user_role = result.scalar_one_or_none()
        if user_role:
            await db.delete(user_role)
            await db.commit()
            return True
        return False
