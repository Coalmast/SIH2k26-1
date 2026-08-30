import uuid
from datetime import date, datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from models.compliance import ComplianceInstance, ComplianceRequirement, InstanceStatus, Regulation, ComplianceEvidence, EvidenceUploadMethod
from schemas.compliance import ComplianceHealthScore, RequirementCreate
import calendar

class ComplianceService:
    @staticmethod
    async def compute_health_score(db: AsyncSession, mine_id: uuid.UUID) -> ComplianceHealthScore:
        query = select(ComplianceInstance.status, func.count(ComplianceInstance.id)).where(ComplianceInstance.mine_id == mine_id).group_by(ComplianceInstance.status)
        result = await db.execute(query)
        counts = {status: count for status, count in result.all()}
        
        total = sum(counts.values())
        if total == 0:
            return ComplianceHealthScore(score=100, total=0, overdue=0, pending=0, mom_change=0.0)
            
        completed = counts.get(InstanceStatus.approved, 0) + counts.get(InstanceStatus.submitted, 0)
        overdue = counts.get(InstanceStatus.breached, 0)
        pending = counts.get(InstanceStatus.pending, 0) + counts.get(InstanceStatus.in_progress, 0) + counts.get(InstanceStatus.revision_requested, 0)
        
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
            # handle status lowercase string mapping
            status_enum = next((e for e in InstanceStatus if e.value == status.lower()), None)
            if status_enum:
                query = query.where(ComplianceInstance.status == status_enum)
            
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
        if new_status == InstanceStatus.approved:
            instance.verified_at = func.now()
            if actor_id:
                instance.verified_by = actor_id
                
        await db.commit()
        await db.refresh(instance)
        return instance

    @staticmethod
    async def get_regulations(db: AsyncSession) -> List[Regulation]:
        query = select(Regulation)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def create_requirement(db: AsyncSession, dto: RequirementCreate) -> ComplianceRequirement:
        req = ComplianceRequirement(**dto.model_dump())
        db.add(req)
        await db.commit()
        await db.refresh(req)
        return req

    @staticmethod
    async def get_instance_by_id(db: AsyncSession, instance_id: uuid.UUID) -> Optional[ComplianceInstance]:
        query = select(ComplianceInstance).where(ComplianceInstance.id == instance_id).options(
            selectinload(ComplianceInstance.requirement).selectinload(ComplianceRequirement.regulation),
            selectinload(ComplianceInstance.evidences)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def submit_evidence(db: AsyncSession, instance_id: uuid.UUID, file_url: str, file_name: str, file_type: str, file_size_bytes: int, upload_method: EvidenceUploadMethod, user_id: uuid.UUID) -> ComplianceEvidence:
        instance = await ComplianceService.get_instance_by_id(db, instance_id)
        if not instance:
            raise ValueError("Instance not found")
            
        evidence = ComplianceEvidence(
            instance_id=instance_id,
            document_url=file_url,
            file_name=file_name,
            file_type=file_type,
            file_size_bytes=file_size_bytes,
            upload_method=upload_method,
            uploaded_by=user_id,
        )
        db.add(evidence)
        
        # update instance status
        instance.status = InstanceStatus.submitted
        instance.submitted_by = user_id
        instance.submitted_at = datetime.now(timezone.utc)
        
        await db.commit()
        await db.refresh(evidence)
        return evidence

    @staticmethod
    async def approve_instance(db: AsyncSession, instance_id: uuid.UUID, actor_id: uuid.UUID) -> ComplianceInstance:
        return await ComplianceService.transition_status(db, instance_id, InstanceStatus.approved, actor_id)

    @staticmethod
    async def reject_instance(db: AsyncSession, instance_id: uuid.UUID, reason: str, actor_id: uuid.UUID) -> ComplianceInstance:
        instance = await ComplianceService.get_instance_by_id(db, instance_id)
        if not instance:
            raise ValueError("Instance not found")
        instance.status = InstanceStatus.revision_requested
        instance.rejection_reason = reason
        await db.commit()
        await db.refresh(instance)
        return instance

    @staticmethod
    async def generate_instances_for_period(db: AsyncSession, mine_id: uuid.UUID, year: int, month: int) -> List[ComplianceInstance]:
        # For simplicity in this sprint, we'll fetch all requirements and generate missing monthly instances
        query = select(ComplianceRequirement)
        result = await db.execute(query)
        requirements = result.scalars().all()
        
        generated = []
        for req in requirements:
            if req.recurrence.name != "monthly":
                continue
                
            # check if instance already exists
            period_start = date(year, month, 1)
            _, last_day = calendar.monthrange(year, month)
            period_end = date(year, month, last_day)
            
            # Simple assumption: due date is end of month + grace period
            due_date = date(year, month, last_day) 
            
            existing_query = select(ComplianceInstance).where(
                ComplianceInstance.mine_id == mine_id,
                ComplianceInstance.requirement_id == req.id,
                ComplianceInstance.period_start == period_start
            )
            existing_result = await db.execute(existing_query)
            if existing_result.scalar_one_or_none():
                continue
                
            instance = ComplianceInstance(
                requirement_id=req.id,
                mine_id=mine_id,
                period_start=period_start,
                period_end=period_end,
                due_date=due_date,
                status=InstanceStatus.pending
            )
            db.add(instance)
            generated.append(instance)
            
        if generated:
            await db.commit()
        return generated
