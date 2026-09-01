import pytest
from unittest.mock import AsyncMock, MagicMock
import uuid
from datetime import datetime, timezone, timedelta, date

from models.inspection import (
    Inspection, Observation, Violation, CorrectiveAction, ChecklistTemplate,
    InspectionStatus, ViolationSeverity, ObsSeverity, ViolationStatus, CapaStatus, ObsStatusEnum
)
from schemas.inspection import ObservationCreate, CAPACreate
from services.inspection_service import InspectionService

@pytest.mark.asyncio
async def test_checklist_progress():
    template = ChecklistTemplate(
        checklist_items=[{"id": "item1"}, {"id": "item2"}, {"id": "item3"}]
    )
    
    inspection = Inspection(
        observations=[
            Observation(checklist_item_id="item1"),
            Observation(checklist_item_id="item2"),
            Observation(checklist_item_id="item1") # duplicate shouldn't double count
        ]
    )
    
    progress = InspectionService._compute_checklist_progress(inspection, template)
    assert progress["total"] == 3
    assert progress["answered"] == 2
    assert progress["pct"] == 66.7

@pytest.mark.asyncio
async def test_capa_due_date_defaults():
    db = AsyncMock()
    db.add = MagicMock()
    violation_id = uuid.uuid4()
    user_id = uuid.uuid4()
    
    mock_violation = Violation(
        id=violation_id,
        severity=ViolationSeverity.critical,
        mine_id=uuid.uuid4()
    )
    
    dto = CAPACreate(
        description="Fix the critical issue",
        assigned_to=uuid.uuid4(),
        due_date=None # Should default based on severity
    )
    
    with pytest.MonkeyPatch.context() as m:
        m.setattr(InspectionService, "get_violation_detail", AsyncMock(return_value=mock_violation))
        
        capa = await InspectionService.assign_capa(db, violation_id, dto, user_id)
        
        # Critical severity -> 1 day SLA
        expected_date = date.today() + timedelta(days=1)
        assert capa.due_date == expected_date

@pytest.mark.asyncio
async def test_evidence_required_for_capa_close():
    db = AsyncMock()
    capa_id = uuid.uuid4()
    user_id = uuid.uuid4()
    
    # Mock db.execute to return a count of 0 (no media)
    mock_result = MagicMock()
    mock_result.scalar_one.return_value = 0
    db.execute.return_value = mock_result
    
    with pytest.raises(ValueError) as excinfo:
        await InspectionService.verify_close_capa(db, capa_id, user_id)
        
    assert "Evidence upload required" in str(excinfo.value)
