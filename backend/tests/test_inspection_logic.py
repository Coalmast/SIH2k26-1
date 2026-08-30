import pytest
from unittest.mock import AsyncMock, MagicMock
import uuid

from models.inspection import (
    Inspection, Observation, Violation, 
    InspectionStatus, ViolationSeverity, ObsSeverity, ViolationStatus, ObsStatusEnum
)
from schemas.inspection import ObservationCreate
from services.inspection_service import InspectionService

@pytest.mark.asyncio
async def test_add_observation_auto_promotes_to_violation():
    """
    Test that adding an observation with HIGH or CRITICAL severity
    automatically creates a Violation record.
    """
    # 1. Setup Mocks
    db = AsyncMock()
    db.add = MagicMock()  # add is synchronous
    
    # Mock get_inspection_detail to return a valid scheduled inspection
    inspection_id = uuid.uuid4()
    mine_id = uuid.uuid4()
    user_id = uuid.uuid4()
    
    mock_inspection = Inspection(
        id=inspection_id, 
        mine_id=mine_id, 
        status=InspectionStatus.draft
    )
    
    # We need to mock InspectionService.get_inspection_detail 
    # but since it's a static method, we can just mock the db query it runs, 
    # or mock the method itself. Let's mock the db execute.
    
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_inspection
    db.execute.return_value = mock_result
    
    # 2. Prepare test data
    dto = ObservationCreate(
        checklist_item_id="CMR-100",
        category="safety",
        status=ObsStatusEnum.non_compliant,
        description="Roof support spacing exceeds 1.5m",
        severity=ObsSeverity.high,
        geo_stamp=None
    )
    
    # 3. Execute
    # We patch get_inspection_detail to avoid mocking deep SQLAlchemy select logic
    with pytest.MonkeyPatch.context() as m:
        m.setattr(InspectionService, "get_inspection_detail", AsyncMock(return_value=mock_inspection))
        
        observation = await InspectionService.add_observation(db, inspection_id, dto, user_id)
        
        # 4. Verify
        # Check that Inspection status was updated to IN_PROGRESS
        assert mock_inspection.status == InspectionStatus.in_progress
        assert mock_inspection.started_at is not None
        
        # Check that db.add was called twice: once for Observation, once for Violation
        assert db.add.call_count == 2
        
        # First call should be Observation
        added_obs = db.add.call_args_list[0][0][0]
        assert isinstance(added_obs, Observation)
        assert added_obs.severity == ObsSeverity.high
        
        # Second call should be Violation
        added_violation = db.add.call_args_list[1][0][0]
        assert isinstance(added_violation, Violation)
        assert added_violation.severity == ViolationSeverity.major
        assert added_violation.status == ViolationStatus.reported
        assert added_violation.mine_id == mine_id
        assert added_violation.reported_by == user_id

@pytest.mark.asyncio
async def test_add_observation_low_severity_no_violation():
    """
    Test that adding an observation with LOW severity
    does NOT create a Violation record.
    """
    db = AsyncMock()
    db.add = MagicMock()  # add is synchronous
    inspection_id = uuid.uuid4()
    user_id = uuid.uuid4()
    
    mock_inspection = Inspection(
        id=inspection_id, 
        mine_id=uuid.uuid4(), 
        status=InspectionStatus.in_progress
    )
    
    dto = ObservationCreate(
        checklist_item_id="CMR-200",
        category="safety",
        status=ObsStatusEnum.observation_only,
        description="Housekeeping could be better",
        severity=ObsSeverity.low,
        geo_stamp=None
    )
    
    with pytest.MonkeyPatch.context() as m:
        m.setattr(InspectionService, "get_inspection_detail", AsyncMock(return_value=mock_inspection))
        
        observation = await InspectionService.add_observation(db, inspection_id, dto, user_id)
        
        # Check that db.add was called exactly ONCE (for Observation only)
        assert db.add.call_count == 1
        
        added_obs = db.add.call_args_list[0][0][0]
        assert isinstance(added_obs, Observation)
        assert added_obs.severity == ObsSeverity.low
