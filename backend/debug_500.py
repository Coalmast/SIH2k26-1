import asyncio
import uuid
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from database import SessionLocal
from schemas.inspection import InspectionCreate
from models.inspection import InspectionTypeEnum
from services.inspection_service import InspectionService

async def main():
    async with SessionLocal() as db:
        dto = InspectionCreate(
            mine_id=uuid.UUID("00000000-0000-0000-0000-000000000004"),
            subsidiary_id=None,
            inspection_type=InspectionTypeEnum.environmental_pcb,
            checklist_template_id=uuid.UUID("00000000-0000-0000-0000-000000000020"),
            scheduled_date=datetime.date.today(),
            zone="Demo Pit"
        )
        try:
            insp = await InspectionService.create_inspection(
                db, dto, uuid.UUID("00000000-0000-0000-0000-000000000010")
            )
            print("Success:", insp.id)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
