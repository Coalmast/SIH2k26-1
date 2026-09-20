import asyncio
import sys
import os
import uuid
import argparse

# Ensure backend directory is in the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models.mine  # Ensure users table is loaded
import models.inspection
from services.notification_service import send_alert, NotificationRequest

DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000010"
DEFAULT_MINE_ID = "00000000-0000-0000-0000-000000000004"

# ──────────────────────────────────────────────────────────────────────────────
# Priority Behavior Mapping
# ──────────────────────────────────────────────────────────────────────────────
PRIORITY_CHANNEL_NOTE = {
    "critical": "🚨 Android Panel: Full-screen Notifee Alarm (bypasses DND) + In-App RED Modal Overlay",
    "high":     "⚠️ Android Panel: Standard Push Notification Banner + In-App Toast",
    "medium":   "📋 In-App Realtime Toast & Local DB Sync ONLY (No OS notification shade distraction)",
    "low":      "ℹ️ In-App Realtime Toast & Local DB Sync ONLY (No OS notification shade distraction)",
}

# ──────────────────────────────────────────────────────────────────────────────
# Comprehensive Coal Mining & Safety Compliance Situations
# ──────────────────────────────────────────────────────────────────────────────
SITUATIONS = {
    # ─── CRITICAL ALERTS: Red Screen Modal + Notifee Alarm Panel (DND Bypass) ───
    "gas_leak": {
        "priority": "critical",
        "title": "🚨 CRITICAL: High CH₄ Methane Breach (2.4%)",
        "body": "Methane reading at Seam-3 Ventilation District reached 2.4% (Threshold: 1.5%). Power cut triggered. Evacuate all personnel immediately!",
        "entity_type": "gas_reading",
        "sla_minutes": 15,
    },
    "roof_fall": {
        "priority": "critical",
        "title": "🚨 CRITICAL: Imminent Strata / Roof Fall Risk",
        "body": "Borehole extensometer in Gate Road 4 recorded rapid strata displacement (>12mm/hr). Evacuate all personnel immediately.",
        "entity_type": "incident_report",
        "sla_minutes": 15,
    },
    "water_inrush": {
        "priority": "critical",
        "title": "🚨 CRITICAL: Sudden Water Inrush Warning",
        "body": "Aquifer breach detected in Lower Seam heading. Inundation rate exceeds pumping capacity. Withdraw workforce to higher horizon.",
        "entity_type": "incident_report",
        "sla_minutes": 15,
    },
    "mine_fire": {
        "priority": "critical",
        "title": "🚨 CRITICAL: Mine Fire / CO Spike (68 ppm)",
        "body": "Continuous gas monitoring indicates rapid Carbon Monoxide rise (68 ppm) and Graham's ratio breach in Sealed Panel 2. Evacuate intake return.",
        "entity_type": "gas_reading",
        "sla_minutes": 15,
    },
    "fan_failure": {
        "priority": "critical",
        "title": "🚨 CRITICAL: Main Surface Ventilation Fan Stoppage",
        "body": "Surface Exhaust Fan #1 tripped. Underground negative pressure dropping. Stop all blasting and withdraw personnel to intake shaft.",
        "entity_type": "equipment",
        "sla_minutes": 15,
    },

    # ─── HIGH ALERTS: Android Push Banner + In-App Warning Toast ───
    "capa_overdue": {
        "priority": "high",
        "title": "⚠️ DGMS Statutory CAPA 3+ Days Overdue",
        "body": "Corrective Action #CA-1049 (Belt conveyor pull-cord trip switch replacement) is 3 days overdue. Escalated to Mine Manager.",
        "entity_type": "corrective_action",
        "sla_minutes": 60,
    },
    "safety_violation": {
        "priority": "high",
        "title": "⚠️ Major Safety Violation: Unsupported Face",
        "body": "Inspection logged unsupported coal face spanning 4.2m at Heading 7 without roof bolts. Work halted until props installed.",
        "entity_type": "violation",
        "sla_minutes": 60,
    },
    "env_breach": {
        "priority": "high",
        "title": "⚠️ Environmental Threshold: CAAQMS PM10 Breach",
        "body": "Continuous ambient air quality monitor recorded PM10 at 185 µg/m³ near Overburden Dump #2. Deploy water mist cannons immediately.",
        "entity_type": "env_breach",
        "sla_minutes": 120,
    },
    "haul_road_hazard": {
        "priority": "high",
        "title": "⚠️ Haul Road Hazard: Dumper Proximity Alert",
        "body": "Proximity detection alert on 100T Dumper #D-14 along Haul Road Ramp 3. Loose embankment detected, restrict speed to 15 km/h.",
        "entity_type": "safety_observation",
        "sla_minutes": 120,
    },
    "air_velocity_low": {
        "priority": "high",
        "title": "⚠️ Ventilation Warning: Air Velocity Low",
        "body": "Anemometer reading at Longwall Face 1 dropped to 0.21 m/s (DGMS statutory minimum: 0.30 m/s). Check regulator doors.",
        "entity_type": "compliance_instance",
        "sla_minutes": 120,
    },

    # ─── MEDIUM ALERTS: In-App Toast & WatermelonDB Sync ONLY ───
    "doc_expiring": {
        "priority": "medium",
        "title": "📋 Statutory License Expiring in 7 Days",
        "body": "Contractor Explosive Carrier Van Fitness & PESO permit expires in 7 days. Submit renewal certificate to safety portal.",
        "entity_type": "compliance_instance",
        "sla_minutes": 480,
    },
    "shift_inspection": {
        "priority": "medium",
        "title": "📋 Mandatory Shift Inspection Pending",
        "body": "Second Shift statutory gas and ventilation inspection for District B has not been submitted. Overman sign-off required.",
        "entity_type": "inspection",
        "sla_minutes": 240,
    },
    "sensor_calib": {
        "priority": "medium",
        "title": "📋 Methanometer Calibration Reminder",
        "body": "Periodic zero-drift and span calibration is due tomorrow for 14 handheld multigas detectors in the Lamp Room.",
        "entity_type": "equipment",
        "sla_minutes": 480,
    },
    "attendance_anomaly": {
        "priority": "medium",
        "title": "📋 Ingress / Egress Headcount Discrepancy",
        "body": "RFID shaft tag reader logged 54 entries vs 51 overman tokens in Section 3. Reconcile shift muster before shift ends.",
        "entity_type": "attendance",
        "sla_minutes": 180,
    },

    # ─── LOW ALERTS: In-App Info Toast ───
    "shift_handover": {
        "priority": "low",
        "title": "ℹ️ Shift Handover Log Submitted",
        "body": "Shift A Overman submitted digital handover report. All conveyor belts operating smoothly; 1,450 tonnes hoisted.",
        "entity_type": "shift_log",
        "sla_minutes": None,
    },
    "sync_completed": {
        "priority": "low",
        "title": "ℹ️ Field Data Synchronization Complete",
        "body": "24 offline safety observations, 6 gas logs, and 2 equipment audits synced successfully with COMET central server.",
        "entity_type": "sync",
        "sla_minutes": None,
    },
    "weather_advisory": {
        "priority": "low",
        "title": "ℹ️ Weather Advisory: Sump Pump Readiness",
        "body": "IMD monsoon advisory: Thunderstorms expected over mining lease area. Ensure backup diesel pit dewatering pumps are primed.",
        "entity_type": "advisory",
        "sla_minutes": None,
    },
}

# Generic priority fallbacks when only priority is passed
PRIORITY_DEFAULTS = {
    "critical": {
        "title": "🚨 CRITICAL ALARM: Immediate Evacuation",
        "body": "A critical hazard threshold has been triggered. All personnel must initiate emergency procedures and evacuate immediately.",
        "entity_type": "incident_report",
    },
    "high": {
        "title": "⚠️ High Priority Alert: Action Required",
        "body": "An urgent safety or compliance non-conformance has been reported. Immediate supervisor action is required within SLA.",
        "entity_type": "corrective_action",
    },
    "medium": {
        "title": "📋 Medium Priority Notification",
        "body": "A standard operational or compliance event requires review on the COMET mobile dashboard.",
        "entity_type": "compliance_instance",
    },
    "low": {
        "title": "ℹ️ Routine System Notice",
        "body": "Informational update regarding shift activities, equipment logs, or synchronization status.",
        "entity_type": "system",
    },
}


def print_situations_table():
    print("=" * 82)
    print("  COMET NOTIFICATION MODULE — PRE-CONFIGURED SITUATIONS")
    print("=" * 82)
    print(f"{'Situation Key':<20} | {'Priority':<8} | {'Title'}")
    print("-" * 82)
    for key, data in SITUATIONS.items():
        print(f"{key:<20} | {data['priority']:<8} | {data['title']}")
    print("=" * 82)
    print("\nHow to run:")
    print("  python test_notification.py <situation_key>")
    print("  e.g.: python test_notification.py gas_leak")
    print("        python test_notification.py roof_fall")
    print("        python test_notification.py capa_overdue\n")


def is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(val)
        return True
    except (ValueError, AttributeError):
        return False


def parse_args():
    # Quick flags
    if len(sys.argv) > 1 and sys.argv[1].lower() in ("--list", "-l", "list", "situations"):
        print_situations_table()
        sys.exit(0)

    # If first arg is a situation name:
    # e.g.: python test_notification.py gas_leak [user_id]
    first_arg = sys.argv[1].lower() if len(sys.argv) > 1 else ""
    if first_arg in SITUATIONS:
        sit = SITUATIONS[first_arg]
        user_id = sys.argv[2] if len(sys.argv) > 2 and is_valid_uuid(sys.argv[2]) else DEFAULT_USER_ID
        title = sys.argv[3] if len(sys.argv) > 3 else sit["title"]
        body = sys.argv[4] if len(sys.argv) > 4 else sit["body"]
        return {
            "user_id": user_id,
            "priority": sit["priority"],
            "title": title,
            "body": body,
            "entity_type": sit.get("entity_type", "incident_report"),
            "sla_minutes": sit.get("sla_minutes"),
            "situation": first_arg,
        }

    # If first arg is a priority name:
    # e.g.: python test_notification.py critical [title] [body]
    if first_arg in PRIORITY_DEFAULTS:
        priority = first_arg
        defaults = PRIORITY_DEFAULTS[priority]
        title = sys.argv[2] if len(sys.argv) > 2 else defaults["title"]
        body = sys.argv[3] if len(sys.argv) > 3 else defaults["body"]
        user_id = sys.argv[4] if len(sys.argv) > 4 and is_valid_uuid(sys.argv[4]) else DEFAULT_USER_ID
        return {
            "user_id": user_id,
            "priority": priority,
            "title": title,
            "body": body,
            "entity_type": defaults.get("entity_type", "test"),
            "sla_minutes": 15 if priority == "critical" else 60 if priority == "high" else None,
            "situation": None,
        }

    # If first arg is a UUID:
    # e.g.: python test_notification.py <user_id> <priority_or_situation> [title] [body]
    if is_valid_uuid(first_arg):
        user_id = first_arg
        second_arg = sys.argv[2].lower() if len(sys.argv) > 2 else "critical"
        if second_arg in SITUATIONS:
            sit = SITUATIONS[second_arg]
            return {
                "user_id": user_id,
                "priority": sit["priority"],
                "title": sys.argv[3] if len(sys.argv) > 3 else sit["title"],
                "body": sys.argv[4] if len(sys.argv) > 4 else sit["body"],
                "entity_type": sit.get("entity_type", "incident_report"),
                "sla_minutes": sit.get("sla_minutes"),
                "situation": second_arg,
            }
        elif second_arg in PRIORITY_DEFAULTS:
            priority = second_arg
            defaults = PRIORITY_DEFAULTS[priority]
            return {
                "user_id": user_id,
                "priority": priority,
                "title": sys.argv[3] if len(sys.argv) > 3 else defaults["title"],
                "body": sys.argv[4] if len(sys.argv) > 4 else defaults["body"],
                "entity_type": defaults.get("entity_type", "test"),
                "sla_minutes": 15 if priority == "critical" else 60 if priority == "high" else None,
                "situation": None,
            }

    # Otherwise show help
    print(
        "\n" + "=" * 80 + "\n"
        "  ⛏ COMET NOTIFICATION DISPATCHER & SITUATION TESTER\n"
        + "=" * 80 + "\n\n"
        "USAGE:\n"
        "  1. By Situation Preset (Quickest):\n"
        "     python test_notification.py <situation_key>\n"
        "     Examples:\n"
        "       python test_notification.py gas_leak\n"
        "       python test_notification.py roof_fall\n"
        "       python test_notification.py capa_overdue\n"
        "       python test_notification.py env_breach\n"
        "       python test_notification.py shift_inspection\n\n"
        "  2. By Priority with Custom Title & Body:\n"
        "     python test_notification.py <priority> \"<custom_title>\" \"<custom_body>\"\n"
        "     Examples:\n"
        "       python test_notification.py critical \"Toxic Gas Detected\" \"CO > 80 ppm in panel 4\"\n"
        "       python test_notification.py high \"Conveyor Belt Fault\" \"Belt slippage detected\"\n"
        "       python test_notification.py medium \"Checklist Due\" \"Please submit safety checklist\"\n"
        "       python test_notification.py low \"System Info\" \"Backup completed\"\n\n"
        "  3. By Target User ID (Backward Compatible):\n"
        "     python test_notification.py <user_id> <priority|situation> [title] [body]\n\n"
        "  4. List All Available Situations:\n"
        "     python test_notification.py --list\n"
        + "=" * 80 + "\n"
    )
    sys.exit(1)


async def main():
    cfg = parse_args()

    user_id     = cfg["user_id"]
    priority    = cfg["priority"]
    title       = cfg["title"]
    body        = cfg["body"]
    entity_type = cfg.get("entity_type", "test")
    sla_minutes = cfg.get("sla_minutes")
    situation   = cfg.get("situation")

    print(f"\n📡 [COMET DISPATCHER] Preparing alert...")
    if situation:
        print(f"   Situation   : {situation}")
    print(f"   Priority    : {priority.upper()}")
    print(f"   Target User : {user_id}")
    print(f"   Title       : {title}")
    print(f"   Body        : {body}")
    print(f"   Entity Type : {entity_type}")
    print(f"   Behavior    : {PRIORITY_CHANNEL_NOTE.get(priority, '')}\n")

    req = NotificationRequest(
        title=title,
        body=body,
        priority=priority,
        target_user_id=user_id,
        entity_type=entity_type,
        mine_id=DEFAULT_MINE_ID,
        sla_minutes=sla_minutes,
    )

    async with SessionLocal() as db:
        alert_id = await send_alert(req, db=db)
        print(f"✅ Alert dispatched successfully!")
        print(f"   Alert ID : {alert_id}")

        if priority == "critical":
            print(
                "\n🚨 CRITICAL ALERT FIRED:\n"
                "   1. Android Panel: Full-screen Notifee alarm (bypasses DND, sirens/vibrates).\n"
                "   2. In-App Mobile: Blinking RED Modal (CriticalAlarmModal) overlay on screen.\n"
                "   3. WatermelonDB: Synced into local offline SQLite DB.\n"
                "   4. Realtime: Supabase postgres_changes event pushed to all connected clients."
            )
        elif priority == "high":
            print(
                "\n⚠️ HIGH ALERT FIRED:\n"
                "   1. Android Panel: Standard system notification banner.\n"
                "   2. In-App Mobile: Amber Warning In-App Toast.\n"
                "   3. WatermelonDB: Synced into local offline SQLite DB."
            )
        elif priority in ("medium", "low"):
            print(
                f"\n📋 {priority.upper()} NOTIFICATION FIRED:\n"
                "   1. In-App Mobile: In-app notification toast.\n"
                "   2. WatermelonDB: Synced into local offline SQLite DB.\n"
                "   3. Android Notification Shade: Kept clean (No intrusive OS panel banner)."
            )


if __name__ == "__main__":
    asyncio.run(main())

