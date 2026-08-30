import uuid
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from models.compliance import ComplianceInstance, ComplianceRequirement, InstanceStatus, Regulation
from schemas.compliance import ComplianceHealthScore

class ComplianceService:
    @staticmethod
    async def compute_health_score(db: AsyncSession, mine_id: uuid.UUID) -> ComplianceHealthScore:
        # Simplified health score logic
        query = select(ComplianceInstance.status, func.count(ComplianceInstance.id)).where(ComplianceInstance.mine_id == mine_id).group_by(ComplianceInstance.status)
        result = await db.execute(query)
        counts = {status: count for status, count in result.all()}
        
        total = sum(counts.values())
        if total == 0:
            return ComplianceHealthScore(score=100, total=0, overdue=0, pending=0, mom_change=0.0)
            
        completed = counts.get(InstanceStatus.COMPLETED, 0)
        overdue = counts.get(InstanceStatus.OVERDUE, 0)
        pending = counts.get(InstanceStatus.PENDING, 0) + counts.get(InstanceStatus.IN_PROGRESS, 0)
        
        # Overdue heavily penalizes the score
        score = max(0, int(((completed + pending * 0.5) / total) * 100) - (overdue * 5))
        
        return ComplianceHealthScore(
            score=score,
            total=total,
            overdue=overdue,
            pending=pending,
            mom_change=0.0 # Mocked mom_change for now
        )

    @staticmethod
    async def get_instances(db: AsyncSession, mine_id: Optional[uuid.UUID], month: Optional[str] = None, status: Optional[str] = None) -> List[ComplianceInstance]:
        query = select(ComplianceInstance).options(
            selectinload(ComplianceInstance.requirement).selectinload(ComplianceRequirement.regulation)
        )
        
        if mine_id:
            query = query.where(ComplianceInstance.mine_id == mine_id)
        
        if status and status != 'All':
            query = query.where(ComplianceInstance.status == InstanceStatus[status])
            
        if month:
            # month format: YYYY-MM
            try:
                year, m = map(int, month.split('-'))
                start_date = date(year, m, 1)
                if m == 12:
                    end_date = date(year + 1, 1, 1)
                else:
                    end_date = date(year, m + 1, 1)
                query = query.where(ComplianceInstance.due_date >= start_date, ComplianceInstance.due_date < end_date)
            except ValueError:
                pass # Invalid month format, ignore
                
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def transition_status(db: AsyncSession, instance_id: uuid.UUID, new_status: InstanceStatus, actor_id: Optional[uuid.UUID] = None) -> ComplianceInstance:
        query = select(ComplianceInstance).where(ComplianceInstance.id == instance_id)
        result = await db.execute(query)
        instance = result.scalar_one_or_none()
        
        if not instance:
            raise ValueError("Instance not found")
            
        instance.status = new_status
        if new_status == InstanceStatus.COMPLETED:
            instance.completed_at = func.now()
            
        await db.commit()
        await db.refresh(instance)
        return instance

    @staticmethod
    async def get_regulations(db: AsyncSession) -> List[Regulation]:
        query = select(Regulation)
        result = await db.execute(query)
        return list(result.scalars().all())
