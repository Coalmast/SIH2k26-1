from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, update
import uuid
from datetime import datetime, timezone, timedelta, date

from models.inspection import (
    Inspection, Observation, Violation, CorrectiveAction, ChecklistTemplate,
    InspectionStatus, ObsStatusEnum, ViolationSeverity, ObsSeverity, ViolationStatus, CapaStatus, SourceTypeEnum,
    MediaAttachment, MediaParentType
)
from schemas.inspection import (
    InspectionCreate, ObservationCreate, CAPACreate, CAPAUpdate
)
from models.compliance import ComplianceInstance, InstanceStatus, ComplianceRequirement

class InspectionService:
    @staticmethod
    async def get_inspections(db: AsyncSession, mine_id: uuid.UUID, type_filter: str = None, status_filter: str = None):
        query = select(Inspection).options(selectinload(Inspection.observations))
        
        if mine_id:
            query = query.where(Inspection.mine_id == mine_id)
        if type_filter:
            query = query.where(Inspection.inspection_type == type_filter)
        if status_filter:
            query = query.where(Inspection.status == status_filter)
            
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    def _compute_checklist_progress(inspection: Inspection, template: ChecklistTemplate) -> dict:
        total = len(template.checklist_items) if template else 0
        answered = len({obs.checklist_item_id for obs in inspection.observations
                        if obs.checklist_item_id})
        pct = round((answered / total) * 100, 1) if total > 0 else 0.0
        return {"total": total, "answered": answered, "pct": pct}

    @staticmethod
    async def get_inspection_detail(db: AsyncSession, id: uuid.UUID):
        query = select(Inspection).where(Inspection.id == id).options(
            selectinload(Inspection.observations).selectinload(Observation.violation)
        )
        result = await db.execute(query)
        inspection = result.scalar_one_or_none()
        
        if inspection and inspection.checklist_template_id:
            t_query = select(ChecklistTemplate).where(ChecklistTemplate.id == inspection.checklist_template_id)
            t_res = await db.execute(t_query)
            template = t_res.scalar_one_or_none()
            
            progress = InspectionService._compute_checklist_progress(inspection, template)
            inspection.completion_pct = progress["pct"]
            inspection.checklist_items_total = progress["total"]
            inspection.checklist_items_answered = progress["answered"]
            
        return inspection

    @staticmethod
    async def create_inspection(db: AsyncSession, dto: InspectionCreate, user_id: uuid.UUID):
        inspection = Inspection(
            mine_id=dto.mine_id,
            subsidiary_id=dto.subsidiary_id,
            inspection_type=dto.inspection_type,
            checklist_template_id=dto.checklist_template_id,
            conducted_by=user_id,
            zone=dto.zone,
            started_at=datetime.now(timezone.utc),
            status=InspectionStatus.draft
        )
        db.add(inspection)
        await db.commit()
        await db.refresh(inspection)
        return inspection

    @staticmethod
    async def submit_inspection(db: AsyncSession, id: uuid.UUID):
        inspection = await InspectionService.get_inspection_detail(db, id)
        if inspection:
            t_query = select(ChecklistTemplate).where(ChecklistTemplate.id == inspection.checklist_template_id)
            t_res = await db.execute(t_query)
            template = t_res.scalar_one_or_none()
            
            progress = InspectionService._compute_checklist_progress(inspection, template)
            if progress["pct"] < 80:
                raise ValueError(
                    f"Cannot submit: only {progress['pct']}% of checklist items answered. "
                    f"Minimum required: 80%. Missing: {progress['total'] - progress['answered']} items."
                )

            inspection.status = InspectionStatus.submitted
            inspection.completed_at = datetime.now(timezone.utc)
            inspection.submitted_at = datetime.now(timezone.utc)
            
            # Check for critical violations to auto-create compliance breaches
            # To create a ComplianceInstance we need a requirement_id. 
            # We fetch a generic or first requirement for the mine as a fallback to link the breach.
            # In a full implementation, we'd have a specific "Inspection Breach" requirement mapped.
            req_query = select(ComplianceRequirement).limit(1)
            req_result = await db.execute(req_query)
            generic_req = req_result.scalar_one_or_none()
            
            if generic_req:
                has_critical = any(
                    obs.violation and obs.violation.severity == ViolationSeverity.critical 
                    for obs in inspection.observations
                )
                if has_critical:
                    breach_instance = ComplianceInstance(
                        requirement_id=generic_req.id,
                        mine_id=inspection.mine_id,
                        subsidiary_id=inspection.subsidiary_id,
                        period_start=datetime.now(timezone.utc),
                        period_end=datetime.now(timezone.utc),
                        due_date=datetime.now(timezone.utc),
                        status=InstanceStatus.breached,
                        is_late_submission=True
                    )
                    db.add(breach_instance)
            
            await db.commit()
            await db.refresh(inspection)
        return inspection

    @staticmethod
    async def add_observation(db: AsyncSession, inspection_id: uuid.UUID, dto: ObservationCreate, user_id: uuid.UUID):
        inspection = await InspectionService.get_inspection_detail(db, inspection_id)
        if not inspection:
            return None

        # Change inspection status to IN_PROGRESS if it's currently draft
        if inspection.status == InspectionStatus.draft:
            inspection.status = InspectionStatus.in_progress
            inspection.started_at = datetime.now(timezone.utc)

        observation = Observation(
            inspection_id=inspection_id,
            checklist_item_id=dto.checklist_item_id,
            category=dto.category,
            status=dto.status,
            description=dto.description,
            severity=dto.severity,
            geo_stamp=dto.geo_stamp.model_dump() if dto.geo_stamp else None
        )
        db.add(observation)
        await db.flush() # flush to get observation.id

        await db.execute(
            update(Inspection)
            .where(Inspection.id == inspection_id)
            .values(observation_count=Inspection.observation_count + 1)
        )

        # Auto-promote to violation if severity is high or critical
        if dto.severity in [ObsSeverity.high, ObsSeverity.critical]:
            v_sev = ViolationSeverity.major if dto.severity == ObsSeverity.high else ViolationSeverity.critical
            violation = Violation(
                observation_id=observation.id,
                mine_id=inspection.mine_id,
                subsidiary_id=inspection.subsidiary_id,
                statute_reference=dto.checklist_item_id,
                severity=v_sev,
                status=ViolationStatus.reported,
                reported_by=user_id
            )
            await InspectionService._check_and_update_recurrence(db, violation)
            db.add(violation)
            await db.flush()
            observation.violation_id = violation.id

            await db.execute(
                update(Inspection)
                .where(Inspection.id == inspection_id)
                .values(violation_count=Inspection.violation_count + 1)
            )

        await db.commit()
        await db.refresh(observation)
        return observation

    @staticmethod
    async def get_violations(db: AsyncSession, mine_id: uuid.UUID, severity_filter: str = None, status_filter: str = None):
        query = select(Violation).options(
            selectinload(Violation.capas)
        )
        if mine_id:
            query = query.where(Violation.mine_id == mine_id)
        if severity_filter:
            query = query.where(Violation.severity == severity_filter)
        if status_filter:
            query = query.where(Violation.status == status_filter)
            
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_violation_detail(db: AsyncSession, id: uuid.UUID):
        query = select(Violation).where(Violation.id == id).options(
            selectinload(Violation.capas),
            selectinload(Violation.observation)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def _check_and_update_recurrence(db: AsyncSession, new_violation: Violation):
        cutoff = datetime.now(timezone.utc) - timedelta(days=548)  # 18 months
        result = await db.execute(
            select(func.count(Violation.id)).where(
                Violation.mine_id == new_violation.mine_id,
                Violation.statute_reference == new_violation.statute_reference,
                Violation.reported_at >= cutoff,
                Violation.status != ViolationStatus.dismissed
            )
        )
        count = result.scalar_one()
        new_violation.recurrence_count = count
        if count >= 3:
            new_violation.status = ViolationStatus.systemic_risk

    @staticmethod
    async def assign_capa(db: AsyncSession, violation_id: uuid.UUID, dto: CAPACreate, user_id: uuid.UUID):
        violation = await InspectionService.get_violation_detail(db, violation_id)
        if not violation:
            return None
            
        SLA_DAYS = {
            ViolationSeverity.critical: 1,
            ViolationSeverity.major:    7,
            ViolationSeverity.moderate: 21,
            ViolationSeverity.minor:    30,
        }
        computed_due_date = dto.due_date or (date.today() + timedelta(days=SLA_DAYS.get(violation.severity, 30)))

        capa = CorrectiveAction(
            source_type=SourceTypeEnum.violation,
            source_id=violation_id,
            mine_id=violation.mine_id,
            subsidiary_id=violation.subsidiary_id,
            description=dto.description,
            assigned_to=dto.assigned_to,
            assigned_by=user_id,
            due_date=computed_due_date,
            root_cause=dto.root_cause,
            status=CapaStatus.assigned
        )
        db.add(capa)
        
        # Update violation status
        if violation.status in [ViolationStatus.reported, ViolationStatus.under_review]:
            violation.status = ViolationStatus.capa_assigned
            
        await db.commit()
        await db.refresh(capa)
        return capa

    @staticmethod
    async def get_capa(db: AsyncSession, id: uuid.UUID):
        query = select(CorrectiveAction).where(CorrectiveAction.id == id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_capa(db: AsyncSession, capa_id: uuid.UUID, dto: CAPAUpdate):
        capa = await InspectionService.get_capa(db, capa_id)
        if not capa:
            return None
            
        if dto.status:
            capa.status = dto.status
            # If changing to completed, set completed_at
            if dto.status == CapaStatus.completed and not capa.completed_at:
                capa.completed_at = datetime.now(timezone.utc)
                if capa.source_type == SourceTypeEnum.violation:
                    violation = await InspectionService.get_violation_detail(db, capa.source_id)
                    if violation:
                        violation.status = ViolationStatus.pending_verification
                
        if dto.completion_notes:
            capa.completion_notes = dto.completion_notes
            
        await db.commit()
        await db.refresh(capa)
        return capa
        
    @staticmethod
    async def verify_close_capa(db: AsyncSession, capa_id: uuid.UUID, user_id: uuid.UUID):
        media_count_result = await db.execute(
            select(func.count(MediaAttachment.id)).where(
                MediaAttachment.parent_id == capa_id,
                MediaAttachment.parent_type == MediaParentType.corrective_action
            )
        )
        media_count = media_count_result.scalar_one()
        if media_count == 0:
            raise ValueError("Evidence upload required before closing CAPA.")

        capa = await InspectionService.get_capa(db, capa_id)
        if not capa:
            return None
            
        capa.status = CapaStatus.verified_closed
        capa.verified_by = user_id
        capa.verified_at = datetime.now(timezone.utc)
        
        # Update associated violation
        if capa.source_type == SourceTypeEnum.violation:
            violation = await InspectionService.get_violation_detail(db, capa.source_id)
            if violation:
                # Check if all CAPAs are closed
                all_closed = all(c.status == CapaStatus.verified_closed or c.id == capa_id for c in violation.capas)
                if all_closed:
                    violation.status = ViolationStatus.closed
                    
        # If CAPA source was compliance breach, update compliance instance
        elif capa.source_type == SourceTypeEnum.compliance_breach:
            comp_query = select(ComplianceInstance).where(ComplianceInstance.id == capa.source_id)
            comp_res = await db.execute(comp_query)
            comp_inst = comp_res.scalar_one_or_none()
            if comp_inst and comp_inst.status == InstanceStatus.breached:
                comp_inst.status = InstanceStatus.in_progress
                    
        await db.commit()
        await db.refresh(capa)
        return capa

    @staticmethod
    async def get_templates(db: AsyncSession):
        result = await db.execute(select(ChecklistTemplate))
        return result.scalars().all()
