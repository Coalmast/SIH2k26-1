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
    async def submit_to_authority(db: AsyncSession, instance_id: uuid.UUID, submission_reference_number: str, notes: Optional[str], actor_id: uuid.UUID) -> ComplianceInstance:
        from services.notification_service import send_statutory_report_email, _resolve_role_user_id
        from models.mine import User
        
        instance = await ComplianceService.get_instance_by_id(db, instance_id)
        if not instance:
            raise ValueError("Instance not found")
            
        if instance.status != InstanceStatus.approved:
            raise ValueError("Instance must be approved before submission to authority")
            
        instance.submitted_to_authority_at = datetime.now(timezone.utc)
        instance.submission_reference_number = submission_reference_number
        instance.submitted_to_authority_by = actor_id
        instance.notes = notes
        instance.status = InstanceStatus.authority_submitted
        
        await db.commit()
        await db.refresh(instance)
        
        # Email mine manager
        manager_id = await _resolve_role_user_id(str(instance.mine_id), "mine_manager")
        if manager_id:
            # We fetch manager email
            user_result = await db.execute(select(User.email).where(User.id == manager_id))
            manager_email = user_result.scalar_one_or_none()
            if manager_email:
                # get some fake PDF url from first evidence or dummy
                pdf_url = instance.evidences[0].document_url if instance.evidences else "https://example.com/report.pdf"
                await send_statutory_report_email(
                    to_email=manager_email,
                    report_name=instance.requirement.title,
                    mine_name="COMET Mine", # Ideally fetch mine name
                    period=f"{instance.period_start} to {instance.period_end}",
                    pdf_signed_url=pdf_url,
                    target_user_id=manager_id
                )
        
        return instance

    @staticmethod
    async def generate_instances_for_period(db: AsyncSession, mine_id: uuid.UUID, year: int, month: int) -> List[ComplianceInstance]:
        from datetime import timedelta
        import calendar
        from models.mine import Mine
        
        # 1. Fetch mine details to filter applicable_mine_types and applicable_states
        mine_result = await db.execute(select(Mine).where(Mine.id == mine_id))
        mine = mine_result.scalar_one_or_none()
        if not mine:
            raise ValueError(f"Mine {mine_id} not found")
            
        # 2. Fetch requirements
        query = select(ComplianceRequirement).where(ComplianceRequirement.is_active == True)
        result = await db.execute(query)
        requirements = result.scalars().all()
        
        generated = []
        
        _, last_day = calendar.monthrange(year, month)
        month_start = date(year, month, 1)
        month_end = date(year, month, last_day)
        
        for req in requirements:
            # Filter by mine_type and state
            if mine.mine_type not in req.applicable_mine_types:
                continue
            if req.applicable_states and mine.state not in req.applicable_states:
                continue

            periods = []
            if req.recurrence.name == "daily":
                for d in range(1, last_day + 1):
                    p_date = date(year, month, d)
                    periods.append((p_date, p_date))
            elif req.recurrence.name == "weekly":
                # Find all weeks that start in this month
                current_date = month_start
                start_of_week = current_date - timedelta(days=current_date.isoweekday() - 1)
                while start_of_week <= month_end:
                    end_of_week = start_of_week + timedelta(days=6)
                    if start_of_week.year == year and start_of_week.month == month:
                        periods.append((start_of_week, end_of_week))
                    start_of_week += timedelta(days=7)
            elif req.recurrence.name == "fortnightly":
                periods.append((date(year, month, 1), date(year, month, 15)))
                if last_day > 15:
                    periods.append((date(year, month, 16), month_end))
            elif req.recurrence.name == "monthly":
                periods.append((month_start, month_end))
            elif req.recurrence.name == "quarterly":
                quarter = (month - 1) // 3 + 1
                q_start_month = 3 * quarter - 2
                q_start = date(year, q_start_month, 1)
                _, q_last_day = calendar.monthrange(year, q_start_month + 2)
                q_end = date(year, q_start_month + 2, q_last_day)
                # Ensure we only generate it once per quarter, say on the first month of the quarter
                if month == q_start_month:
                    periods.append((q_start, q_end))
            elif req.recurrence.name == "half_yearly":
                if month == 1:
                    periods.append((date(year, 1, 1), date(year, 6, 30)))
                elif month == 7:
                    periods.append((date(year, 7, 1), date(year, 12, 31)))
            elif req.recurrence.name == "annual":
                if month == 1:
                    periods.append((date(year, 1, 1), date(year, 12, 31)))
                
            for p_start, p_end in periods:
                due_date = p_end + timedelta(days=req.grace_period_days)
                
                existing_query = select(ComplianceInstance.id).where(
                    ComplianceInstance.mine_id == mine_id,
                    ComplianceInstance.requirement_id == req.id,
                    ComplianceInstance.period_start == p_start
                )
                existing_result = await db.execute(existing_query)
                if existing_result.scalar_one_or_none():
                    continue
                    
                instance = ComplianceInstance(
                    requirement_id=req.id,
                    mine_id=mine_id,
                    period_start=p_start,
                    period_end=p_end,
                    due_date=due_date,
                    status=InstanceStatus.pending
                )
                db.add(instance)
                generated.append(instance)
                
        if generated:
            await db.commit()
        return generated
