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

# Firebase Cloud Messaging — sent via Supabase Edge Function or direct HTTP v1 API
FCM_SERVER_KEY        = os.getenv("FCM_SERVER_KEY", "")        # Legacy; kept for fallback
FCM_PROJECT_ID        = os.getenv("FCM_PROJECT_ID", "")        # For HTTP v1
FCM_SERVICE_ACCOUNT   = os.getenv("FCM_SERVICE_ACCOUNT_JSON", "")  # Path or JSON string

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
            await _send_fcm_push(req, alert_id, is_critical_alarm=is_critical)

        if "email" in resolved and req.email_to:
            await _send_resend_email(req, alert_id)

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
# Channel: FCM Push (standard + critical alarm flag for Notifee)
# ---------------------------------------------------------------------------

async def _send_fcm_push(req: NotificationRequest, alert_id: str, is_critical_alarm: bool = False) -> None:
    """
    Sends a Firebase Cloud Messaging push notification.

    For CRITICAL alerts, the payload includes the `comet_alarm` data key.
    The mobile app's Notifee handler checks for this key and triggers a
    full-screen alarm that bypasses DND and plays the siren sound.

    For standard alerts, FCM delivers a normal background notification
    handled by expo-notifications.
    """
    if not FCM_PROJECT_ID:
        logger.warning("[FCM] FCM_PROJECT_ID not configured — skipping push.")
        return

    # Resolve FCM token for the target user from Supabase user metadata.
    fcm_token = await _get_fcm_token(req.target_user_id)
    if not fcm_token:
        logger.warning(f"[FCM] No FCM token for user {req.target_user_id} — skipping push.")
        return

    # FCM HTTP v1 payload
    payload = {
        "message": {
            "token": fcm_token,
            "notification": {
                "title": req.title,
                "body": req.body,
            },
            "data": {
                "alert_id":    alert_id,
                "entity_type": req.entity_type or "",
                "entity_id":   str(req.entity_id) if req.entity_id else "",
                "mine_id":     str(req.mine_id) if req.mine_id else "",
                "priority":    req.priority,
                # ↓ This key is the signal to Notifee on the mobile app.
                # When present and "true", the JS Notifee handler fires a
                # CRITICAL channel notification that:
                #   - bypasses DND / silent mode (Android importance=IMPORTANCE_HIGH)
                #   - plays custom siren audio via Notifee sound config
                #   - shows a full-screen intent on locked screen
                "comet_alarm": "true" if is_critical_alarm else "false",
            },
            "android": {
                # HIGH priority wakes up Doze mode / background restrictions
                "priority": "HIGH",
                # Target the correct channel so Notifee picks it up
                "notification": {
                    "channel_id": "comet_critical" if is_critical_alarm else "comet_standard",
                    "default_vibrate_timings": not is_critical_alarm,
                },
            },
            "apns": {
                "headers": {
                    # apns-priority 10 = immediate delivery (required for Notifee critical alerts)
                    "apns-priority": "10",
                    "apns-push-type": "alert",
                },
                "payload": {
                    "aps": {
                        # interruption-level=critical bypasses Focus / Silent on iOS
                        "interruption-level": "critical" if is_critical_alarm else "active",
                        "sound": {
                            "critical": 1 if is_critical_alarm else 0,
                            "name": "comet_alarm.wav" if is_critical_alarm else "default",
                            "volume": 1.0,
                        } if is_critical_alarm else "default",
                    }
                },
            },
        }
    }

    # Get OAuth2 access token for FCM HTTP v1
    access_token = await _get_fcm_access_token()
    if not access_token:
        logger.error("[FCM] Could not obtain FCM access token.")
        return

    url = f"https://fcm.googleapis.com/v1/projects/{FCM_PROJECT_ID}/messages:send"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            url,
            json=payload,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if resp.status_code != 200:
            logger.error(f"[FCM] Send failed: {resp.status_code} — {resp.text}")
        else:
            logger.info(f"[FCM] Push sent to user {req.target_user_id} | critical_alarm={is_critical_alarm}")


async def _get_fcm_access_token() -> Optional[str]:
    """
    Gets a short-lived Google OAuth2 access token for FCM HTTP v1 API.
    Uses the service account JSON stored in FCM_SERVICE_ACCOUNT_JSON env var.
    """
    try:
        import json
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request as GoogleAuthRequest

        sa_info = json.loads(FCM_SERVICE_ACCOUNT) if FCM_SERVICE_ACCOUNT else None
        if not sa_info:
            logger.warning("[FCM] FCM_SERVICE_ACCOUNT_JSON not set.")
            return None

        credentials = service_account.Credentials.from_service_account_info(
            sa_info,
            scopes=["https://www.googleapis.com/auth/firebase.messaging"],
        )
        credentials.refresh(GoogleAuthRequest())
        return credentials.token
    except Exception as exc:
        logger.error(f"[FCM] Access token error: {exc}")
        return None


async def _get_fcm_token(user_id: Optional[str]) -> Optional[str]:
    """
    Fetches the FCM token stored in the users table for a given user.
    The mobile app registers its Expo push token on login via PATCH /users/me/push-token.
    """
    if not user_id:
        return None
    try:
        async with SessionLocal() as db:
            from models.mine import User  # avoid circular imports
            result = await db.execute(
                select(User.fcm_push_token).where(User.id == user_id)
            )
            row = result.first()
            return row[0] if row else None
    except Exception as exc:
        logger.warning(f"[FCM] Could not fetch token for user {user_id}: {exc}")
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
    return await send_alert(
        NotificationRequest(
            title="🚨 CRITICAL: High CH₄ Level Detected",
            body=f"Methane at {ch4_percent}% in {station_label}. "
                 f"{'EVACUATE IMMEDIATELY — level exceeds 1.5%.' if ch4_percent > 1.5 else 'Alert threshold exceeded. Monitor closely.'}",
            priority="critical",
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
