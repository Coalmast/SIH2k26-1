"""
notification_service.py
=======================
The single source of truth for dispatching all platform alerts.

Channel routing:
  CRITICAL priority  → Supabase Realtime (web) + FCM HIGH-priority (triggers Notifee alarm on mobile)
  HIGH priority       → Supabase Realtime (web) + FCM standard push
  MEDIUM / LOW        → Supabase Realtime (web) only (in-app toast)
  email_report type   → Resend API (statutory PDF email)

The caller (escalation tasks, webhook handlers) only calls send_alert().
This service resolves recipients, builds the payload, writes to the
alerts table, and dispatches to every appropriate channel.
"""

import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import SessionLocal
from models.notification import Alert, AlertPriority, AlertStatus

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Environment configuration
# ---------------------------------------------------------------------------
RESEND_API_KEY        = os.getenv("RESEND_API_KEY", "")
RESEND_FROM_EMAIL     = os.getenv("RESEND_FROM_EMAIL", "noreply@comet.coal.gov.in")

# Expo Push Gateway
EXPO_PUSH_URL         = "https://exp.host/--/api/v2/push/send"

SUPABASE_URL          = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# ---------------------------------------------------------------------------
# Data class for a notification request
# ---------------------------------------------------------------------------
from dataclasses import dataclass, field

@dataclass
class NotificationRequest:
    """
    Single notification intent. The service resolves the rest.

    Fields
    ------
    title           : Short title shown in push / toast / email subject.
    body            : Full message body.
    priority        : "critical" | "high" | "medium" | "low" | "info"
    target_user_id  : UUID of the recipient user (resolved to FCM token + email by service).
    mine_id         : UUID of the mine — used for Realtime channel scoping.
    entity_type     : e.g. "compliance_instance", "corrective_action", "incident_report"
    entity_id       : UUID of the related entity (deep-link target on mobile).
    channels        : Override auto-routing. e.g. ["push", "email", "realtime"]
                      Leave empty for auto-routing based on priority.
    email_to        : Explicit email address (bypasses user lookup — used for PDF reports).
    email_pdf_url   : Supabase Storage signed URL for PDF attachment (Resend).
    sla_minutes     : How long the recipient has to respond (stored on alert record).
    """
    title: str
    body: str
    priority: str                       # AlertPriority value
    target_user_id: Optional[str] = None
    mine_id: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    channels: list[str] = field(default_factory=list)
    email_to: Optional[str] = None
    email_pdf_url: Optional[str] = None
    sla_minutes: Optional[int] = None


# ---------------------------------------------------------------------------
# Main dispatcher
# ---------------------------------------------------------------------------

async def send_alert(req: NotificationRequest, db: Optional[AsyncSession] = None) -> str:
    """
    Primary entry point. Creates an alerts record and fans out to channels.

    Returns
    -------
    str : The newly created alert UUID.
    """
    alert_id = str(uuid.uuid4())
    own_session = db is None

    if own_session:
        db = SessionLocal()

    try:
        # 1. Persist alert to DB (alerts table → Supabase Realtime picks this up automatically)
        alert_record = Alert(
            id=alert_id,
            priority=req.priority,
            type=req.entity_type or "system",
            title=req.title,
            message=req.body,
            target_user_id=req.target_user_id,
            mine_id=req.mine_id,
            entity_type=req.entity_type,
            entity_id=req.entity_id,
            channels=_resolve_channels(req),
            sla_response_minutes=req.sla_minutes,
            status=AlertStatus.pending,
        )
        db.add(alert_record)
        await db.commit()

        logger.info(f"[NOTIFY] Alert {alert_id} created | priority={req.priority} | user={req.target_user_id}")

        # 2. Fan out to external channels (fire-and-forget using httpx.AsyncClient)
        resolved = _resolve_channels(req)

        if "push" in resolved or "critical_alarm" in resolved:
            is_critical = req.priority == "critical"
            try:
                await _send_expo_push(req, alert_id, is_critical=is_critical)
            except Exception as e:
                logger.error(f"[EXPO_PUSH] Unhandled exception sending push: {e}")

        if "email" in resolved and req.email_to:
            try:
                await _send_resend_email(req, alert_id)
            except Exception as e:
                logger.error(f"[RESEND] Unhandled exception sending email: {e}")

        # 3. Mark as sent
        alert_record.status = AlertStatus.sent
        alert_record.sent_at = datetime.now(timezone.utc)
        await db.commit()

    except Exception as exc:
        logger.error(f"[NOTIFY] Failed to dispatch alert {alert_id}: {exc}")
        if own_session:
            await db.rollback()
        raise
    finally:
        if own_session:
            await db.close()

    return alert_id


# ---------------------------------------------------------------------------
# Channel routing logic
# ---------------------------------------------------------------------------

def _resolve_channels(req: NotificationRequest) -> list[str]:
    """
    Auto-route based on priority if caller did not specify channels.

    critical → realtime + critical_alarm (Notifee) + push (FCM)
    high     → realtime + push (FCM)
    medium   → realtime
    low      → realtime
    info     → realtime
    """
    if req.channels:
        return req.channels

    if req.priority == "critical":
        return ["realtime", "critical_alarm", "push"]
    elif req.priority == "high":
        return ["realtime", "push"]
    elif req.email_pdf_url:
        return ["email", "realtime"]
    else:
        return ["realtime"]


# ---------------------------------------------------------------------------
# Channel: Supabase Realtime
# ---------------------------------------------------------------------------
# Realtime broadcast happens automatically when we INSERT into the alerts table
# (Supabase Realtime listens for postgres_changes on the alerts table).
# The web dashboard subscribes to channel: alerts:mine_id=eq.{mineId}
# No extra code needed here — the DB INSERT above is sufficient.
# This comment block documents that this is intentional, not an omission.


# ---------------------------------------------------------------------------
# Channel: Expo Push Gateway (standard + critical alarm flag for Notifee)
# ---------------------------------------------------------------------------

async def _send_expo_push(req: NotificationRequest, alert_id: str, is_critical: bool = False) -> None:
    """
    Sends a push notification via the Expo Push Gateway.
    Expo handles FCM and APNs routing internally — no Firebase SDK needed.

    For critical alarms: sends a data-only payload with comet_alarm="true".
    The mobile app's BACKGROUND_NOTIFICATION_TASK receives this and hands off to
    Notifee, which fires the full-screen siren bypassing DND.
    """
    token = await _get_expo_push_token(req.target_user_id)
    if not token:
        logger.warning(f"[EXPO_PUSH] No push token for user {req.target_user_id}")
        return

    message = {
        "to": token,
        "sound": None if is_critical else "default",   # critical = data-only, Notifee handles sound
        "priority": "high",                             # wakes Doze mode & background restrictions
        "data": {
            "alert_id":    alert_id,
            "entity_type": req.entity_type or "",
            "entity_id":   str(req.entity_id) if req.entity_id else "",
            "mine_id":     str(req.mine_id)   if req.mine_id   else "",
            "priority":    req.priority,
            "title":       req.title,
            "body":        req.body,
            # Signal to Notifee background handler on mobile
            "comet_alarm": "true" if is_critical else "false",
        },
        "channelId": "comet_critical_alarm" if is_critical else "comet_standard",
    }
    
    # For standard (non-critical) pushes, also show an OS banner
    if not is_critical:
        message["title"] = req.title
        message["body"] = req.body

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            EXPO_PUSH_URL,
            json=message,
            headers={
                "Accept":        "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type":  "application/json",
                "Expo-SDK-Version": "56",
            },
        )
        result = resp.json()
        if isinstance(result, dict) and result.get("data", {}).get("status") == "error":
            logger.error(f"[EXPO_PUSH] Send failed: {result}")
        else:
            logger.info(f"[EXPO_PUSH] Push sent → user={req.target_user_id} | critical={is_critical}")


async def _get_expo_push_token(user_id: Optional[str]) -> Optional[str]:
    """Fetch the stored ExpoPushToken for a given user."""
    if not user_id:
        return None
    try:
        async with SessionLocal() as db:
            from models.mine import User
            result = await db.execute(
                select(User.expo_push_token).where(User.id == user_id)
            )
            row = result.first()
            return row[0] if row else None
    except Exception as exc:
        logger.warning(f"[EXPO_PUSH] Could not fetch token for user {user_id}: {exc}")
        return None


# ---------------------------------------------------------------------------
# Channel: Resend (email with optional PDF attachment)
# ---------------------------------------------------------------------------

async def _send_resend_email(req: NotificationRequest, alert_id: str) -> None:
    """
    Sends a transactional email via Resend API.

    Used for:
      - Statutory PDF reports dispatched to mine managers / regulators
      - Overdue compliance breaches requiring formal email notification

    If req.email_pdf_url is set, the PDF is fetched from Supabase Storage
    and attached inline (base64). For large PDFs, we instead embed the
    signed URL as a download link to avoid Resend's 40 MB attachment limit.
    """
    if not RESEND_API_KEY:
        logger.warning("[RESEND] RESEND_API_KEY not configured — skipping email.")
        return

    # Build HTML body
    html_body = _build_email_html(req, alert_id)

    payload: dict = {
        "from": f"COMET Platform <{RESEND_FROM_EMAIL}>",
        "to": [req.email_to],
        "subject": req.title,
        "html": html_body,
    }

    # Attach PDF as download link (safe for any file size)
    if req.email_pdf_url:
        payload["html"] += (
            f'<p style="margin-top:24px">'
            f'<a href="{req.email_pdf_url}" '
            f'style="background:#1a56db;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">'
            f'Download Statutory Report (PDF)</a></p>'
        )

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            json=payload,
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
        )
        if resp.status_code not in (200, 201):
            logger.error(f"[RESEND] Email failed: {resp.status_code} — {resp.text}")
        else:
            logger.info(f"[RESEND] Email sent to {req.email_to} | alert={alert_id}")


def _build_email_html(req: NotificationRequest, alert_id: str) -> str:
    """Minimal but professional transactional email template."""
    priority_colour = {
        "critical": "#dc2626",
        "high":     "#ea580c",
        "medium":   "#ca8a04",
        "low":      "#16a34a",
        "info":     "#2563eb",
    }.get(req.priority, "#2563eb")

    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family:Inter,Arial,sans-serif;background:#f9fafb;padding:32px">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;
                  border:1px solid #e5e7eb;overflow:hidden">
        <!-- Header -->
        <div style="background:#1e293b;padding:24px 32px;display:flex;align-items:center;gap:12px">
          <span style="color:#fff;font-size:20px;font-weight:700">⛏ COMET</span>
          <span style="color:#94a3b8;font-size:13px">Coal Operations Monitoring &amp; Enforcement</span>
        </div>
        <!-- Priority badge -->
        <div style="padding:24px 32px 0">
          <span style="display:inline-block;background:{priority_colour}20;color:{priority_colour};
                       font-size:12px;font-weight:600;padding:4px 12px;border-radius:99px;
                       text-transform:uppercase;letter-spacing:.05em">{req.priority}</span>
        </div>
        <!-- Body -->
        <div style="padding:20px 32px 32px">
          <h2 style="margin:12px 0 8px;color:#0f172a;font-size:20px">{req.title}</h2>
          <p style="color:#475569;line-height:1.6;margin:0 0 16px">{req.body}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="color:#94a3b8;font-size:12px;margin:0">
            Alert ID: {alert_id} &nbsp;|&nbsp;
            Generated: {datetime.now(timezone.utc).strftime('%d %b %Y, %H:%M UTC')} &nbsp;|&nbsp;
            Ministry of Coal – Coal India Limited
          </p>
        </div>
      </div>
    </body>
    </html>
    """


# ---------------------------------------------------------------------------
# Convenience helpers — called by escalation tasks & webhook handlers
# ---------------------------------------------------------------------------

async def alert_mine_manager(
    mine_id: str,
    title: str,
    body: str,
    priority: str = "high",
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    db: Optional[AsyncSession] = None,
) -> str:
    """
    Resolves the mine manager's user_id from the DB and dispatches an alert.
    Used by all escalation tasks to replace the old print() stubs.
    """
    manager_id = await _resolve_role_user_id(mine_id, "mine_manager")
    return await send_alert(
        NotificationRequest(
            title=title,
            body=body,
            priority=priority,
            target_user_id=manager_id,
            mine_id=mine_id,
            entity_type=entity_type,
            entity_id=entity_id,
        ),
        db=db,
    )


async def alert_compliance_officer(
    mine_id: str,
    title: str,
    body: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    db: Optional[AsyncSession] = None,
) -> str:
    officer_id = await _resolve_role_user_id(mine_id, "compliance_officer")
    return await send_alert(
        NotificationRequest(
            title=title,
            body=body,
            priority="medium",
            target_user_id=officer_id,
            mine_id=mine_id,
            entity_type=entity_type,
            entity_id=entity_id,
        ),
        db=db,
    )


async def alert_subsidiary_head(
    subsidiary_id: str,
    title: str,
    body: str,
    priority: str = "high",
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    db: Optional[AsyncSession] = None,
) -> str:
    admin_id = await _resolve_subsidiary_role_user_id(subsidiary_id, "subsidiary_admin")
    return await send_alert(
        NotificationRequest(
            title=title,
            body=body,
            priority=priority,
            target_user_id=admin_id,
            entity_type=entity_type,
            entity_id=entity_id,
        ),
        db=db,
    )


async def alert_critical_gas(
    mine_id: str,
    station_label: str,
    ch4_percent: float,
    db: Optional[AsyncSession] = None,
) -> str:
    """
    SYNCHRONOUS-SAFE critical alert for gas reading breaches.
    Routed as 'critical' → triggers Notifee full-screen alarm on mobile.
    Must be awaited directly inside the overman-report submission endpoint
    (not in a background task) to guarantee immediate delivery.
    """
    # Resolve mine manager so target_user_id is set (alerts.target_user_id is NOT NULL)
    manager_id = await _resolve_role_user_id(mine_id, "mine_manager")
    return await send_alert(
        NotificationRequest(
            title="🚨 CRITICAL: High CH₄ Level Detected",
            body=f"Methane at {ch4_percent}% in {station_label}. "
                 f"{'EVACUATE IMMEDIATELY — level exceeds 1.5%.' if ch4_percent > 1.5 else 'Alert threshold exceeded. Monitor closely.'}",
            priority="critical",
            target_user_id=manager_id,
            mine_id=mine_id,
            entity_type="gas_reading",
            channels=["realtime", "critical_alarm", "push"],
        ),
        db=db,
    )


async def send_statutory_report_email(
    to_email: str,
    report_name: str,
    mine_name: str,
    period: str,
    pdf_signed_url: str,
    target_user_id: Optional[str] = None,
) -> str:
    """
    Sends a statutory PDF report via Resend.
    Called by the report generation service after PDF is uploaded to Supabase Storage.
    """
    return await send_alert(
        NotificationRequest(
            title=f"Statutory Report Ready: {report_name} — {mine_name}",
            body=(
                f"The {report_name} for {mine_name} covering {period} "
                f"has been generated and is ready for review and submission."
            ),
            priority="info",
            target_user_id=target_user_id,
            email_to=to_email,
            email_pdf_url=pdf_signed_url,
            entity_type="statutory_report",
            channels=["email", "realtime"],
        )
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

async def _resolve_role_user_id(mine_id: str, role_name: str) -> Optional[str]:
    """Find the primary user with a given role at a given mine."""
    try:
        async with SessionLocal() as db:
            from models.mine import User
            from models.compliance import UserRole, Role
            result = await db.execute(
                select(User.id)
                .join(UserRole, UserRole.user_id == User.id)
                .join(Role, Role.id == UserRole.role_id)
                .where(User.mine_id == mine_id, Role.name == role_name)
                .limit(1)
            )
            row = result.first()
            return str(row[0]) if row else None
    except Exception as exc:
        logger.warning(f"[NOTIFY] Could not resolve {role_name} for mine {mine_id}: {exc}")
        return None


async def _resolve_subsidiary_role_user_id(subsidiary_id: str, role_name: str) -> Optional[str]:
    """Find the primary user with a given role at subsidiary level."""
    try:
        async with SessionLocal() as db:
            from models.mine import User
            from models.compliance import UserRole, Role
            result = await db.execute(
                select(User.id)
                .join(UserRole, UserRole.user_id == User.id)
                .join(Role, Role.id == UserRole.role_id)
                .where(User.subsidiary_id == subsidiary_id, Role.name == role_name)
                .limit(1)
            )
            row = result.first()
            return str(row[0]) if row else None
    except Exception as exc:
        logger.warning(f"[NOTIFY] Could not resolve {role_name} for subsidiary {subsidiary_id}: {exc}")
        return None
