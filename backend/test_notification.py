import asyncio
import sys
import os

# Ensure backend directory is in the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models.mine  # Ensure users table is loaded
import models.inspection
from services.notification_service import send_alert, NotificationRequest

async def main():
    if len(sys.argv) < 3:
        print("Usage: python test_notification.py <user_id> <priority>")
        print("Example: python test_notification.py 00000000-0000-0000-0000-000000000010 critical")
        return

    user_id = sys.argv[1]
    priority = sys.argv[2] # "critical", "high", "medium", "low"

    req = NotificationRequest(
        title=f"Test {priority.capitalize()} Alert",
        body="This is a test notification generated from the command line.",
        priority=priority,
        target_user_id=user_id,
        entity_type="test",
        mine_id="00000000-0000-0000-0000-000000000004" # Example mine ID
    )

    async with SessionLocal() as db:
        alert_id = await send_alert(req, db=db)
        print(f"Successfully dispatched alert: {alert_id}")
        
if __name__ == "__main__":
    asyncio.run(main())
