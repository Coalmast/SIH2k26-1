> From: https://gemini.google.com/app/d38fd6f64b89c600

# you asked

message time: 2026-08-30 17:43:42

lets discuss about tech stack in depth. what is blockchain level security ?. what i can add / implement to add blackchain level security

---

# gemini response

Your COMET platform has a highly modern, well-thought-out architecture designed for speed and scale. Let's break down your current stack, define what blockchain-level security actually means in an enterprise context, and explore exactly how to implement it to satisfy your regulatory requirements.

## 1. Your Current COMET Tech Stack

Based on your design documents, you have selected a modular, API-first ecosystem:
*   **Frontend & Mobile:** React 19, Vite, TanStack ecosystem, and Tailwind CSS for the web dashboard, alongside React Native (Expo) and WatermelonDB for robust offline-first field synchronization.
*   **Backend Compute:** Python 3.12 and FastAPI manage the heavy lifting, including AI risk scoring, time-series forecasting, Tesseract OCR, and PDF generation.
*   **Data & Auth Layer:** Supabase (PostgreSQL 15+) acts as the core hub, handling relational data, Row-Level Security (RLS) for multi-tenancy, GoTrue authentication, and WebSocket-based real-time alerts. 

You already have a strong security baseline: AES-256 encryption at rest, TLS 1.3 in transit, strict RBAC/RLS isolation, and cryptographic hashing for sensitive PII. 

## 2. What is "Blockchain-Level Security"?

In the context of government compliance and coal mining operations, "blockchain-level security" has nothing to do with cryptocurrency. It refers to shifting a system from **"trust the database administrator"** to **"trust the cryptography."** It provides four core guarantees:
*   **Immutability:** Once a record (like an incident report or inspection) is written, it is mathematically impossible to alter or delete it without leaving a glaring trace.
*   **Tamper-Evidence:** Data is tied together using cryptographic hashes. If a single comma in a historical document is changed, the hash changes, immediately alerting auditors to the tampering.
*   **Decentralized Consensus:** Instead of Coal India Limited (CIL) holding the only copy of the database, regulatory bodies (like DGMS or MoEFCC) hold synchronized, verifiable copies of the ledger.
*   **Zero-Trust Verification:** An external auditor can mathematically prove a document is authentic without needing direct access to your internal PostgreSQL database.

## 3. Implementing Blockchain Security in COMET

Your documents mention anchoring cryptographic hashes of critical records to a Hyperledger Fabric consortium to prove non-tampering to regulators. Here is how you can practically implement this in your stack:

*   **Implement an Append-Only Audit Table:** Before even touching a blockchain, build an immutable audit table in PostgreSQL. Use Postgres triggers to completely block `UPDATE` or `DELETE` commands on this table. Every time a compliance status changes, write a new row.
*   **Hash Anchoring at the FastAPI Layer:** Never store raw operational data (like worker names or proprietary mine plans) on the blockchain. When a statutory document (like Form 3 or Form 4-A) is approved, use your FastAPI worker to generate a strict SHA-256 cryptographic hash of the PDF binary. 
*   **Batch via Merkle Trees:** To avoid overwhelming the blockchain network, do not send an API call for every single observation. Instead, use a "Merkle Tree" to group all the day's hashes into one single "Root Hash," and anchor only that root hash to the blockchain.
*   **Use a Permissioned Consortium (Hyperledger Fabric):** Since this is an Indian government initiative, align with the **National Blockchain Framework (NBF)** (also known as the *Vishvasya* Blockchain-as-a-Service stack by MeitY). Deploy a Hyperledger Fabric network where CIL, DGMS, and the State Pollution Control Boards each operate a peer node.
*   **Build a Regulator Verification Portal:** On your React dashboard, build a "Verify Integrity" feature for regulators. A DGMS inspector can upload a downloaded PDF; your frontend will hash the file locally and query the blockchain smart contract to ensure the hashes match perfectly, proving the document was never altered.

Would you like to explore how to write the FastAPI logic for generating and storing these SHA-256 document hashes before they get batched to the blockchain ledger?

---

# you asked

message time: 2026-08-30 22:25:15

suggest me what should i use in my notification system .
what i want is 
1] email for reports and all
2] mobile notifications through my expo react native app
3]  mobile alert notification [in case of emergencies  the  app should automatically trigger and run an alarm]

---

# gemini response

Based on the architecture outlined in your "TECH_STACK.md" and `Sih2026` documents, your COMET platform requires a robust, multi-channel notification system capable of handling everything from standard summaries to life-saving emergency alerts. 

Here is the recommended stack and approach for each of your specific requirements.

### 1. Email for Reports and Summaries
For delivering statutory PDFs (like Form 3 or Form 4-A) generated by your FastAPI backend, you need a reliable transactional email provider.
*   **Recommended Tool:** Amazon SES (Simple Email Service) or SendGrid. 
*   **Implementation:** Since your backend uses Python 3.12 and FastAPI, you can integrate the `boto3` library (for AWS SES) or the SendGrid Python SDK. 
*   **Workflow:** When a report is generated, trigger a FastAPI Background Task to send the email asynchronously, ensuring your main API thread is not blocked.

### 2. Standard Mobile Notifications (Expo React Native)
For standard workflow alerts—like a CAPA being assigned or a compliance deadline approaching—you should leverage your existing Expo infrastructure.
*   **Recommended Tool:** `expo-notifications` backed by Firebase Cloud Messaging (FCM).
*   **Implementation:** When a user logs in, the mobile app retrieves an Expo Push Token and stores it in your Supabase database. Your FastAPI backend can then send push payloads directly to the Expo Push API, which routes them to Apple (APNs) and Google (FCM).
*   **UX Note:** Standard notifications will appear in the system tray and respect the user's "Do Not Disturb" or silent mode settings.

### 3. Emergency Alarm Notifications
For critical safety events (e.g., fatal incidents or high methane levels), standard push notifications are insufficient because they can be silenced. You need an alarm that actively wakes the device.
*   **Recommended Tool:** **Notifee** (A highly advanced notification library for React Native). Since you are using the Expo Bare workflow, you can easily install native modules like Notifee.
*   **Android Implementation:** Use Notifee's "Full-Screen Intents" and create a notification channel with the `sound` property pointing to a custom, loud siren audio file bundled in your app. You can also bypass "Do Not Disturb" for critical channels.
*   **iOS Implementation:** Apple has a special entitlement called **Critical Alerts**, designed specifically for medical and safety emergencies. Notifee supports this out of the box, allowing your app to play a loud sound even if the iPhone's physical hardware switch is set to mute.

Would you like to explore a FastAPI code snippet demonstrating how to dispatch the specific data payloads required to trigger these emergency mobile alarms?

---

# you asked

message time: 2026-08-31 07:12:21

What if I want the mail service for my prototype?

---

# gemini response

For prototyping, enterprise solutions like Amazon SES or SendGrid can slow you down because they require DNS domain verification, strict sandbox approvals, and warm-up periods. 

For a fast-moving prototype or hackathon project powered by FastAPI and Python, here are the best lightweight email options:

---

### 1. Top Pick: Resend (`resend-py`)
**Resend** offers the best modern developer experience and works seamlessly with Python.

*   **Why for Prototype:** You get an instant testing domain (`onboarding@resend.dev`) to start sending emails immediately to your registered address without needing custom DNS setup.
*   **Free Tier:** Generous free tier (up to 3,000 emails/month, 100 emails/day).
*   **FastAPI / PDF Ready:** Adding generated PDF reports (from WeasyPrint or ReportLab) as base64 attachments takes only 2–3 lines of code.

```python
# Quick Resend integration in FastAPI
import resend
from fastapi import BackgroundTasks

resend.api_key = "re_123456789"

def send_report_email(to_email: str, pdf_bytes: bytes, filename: str):
    resend.Emails.send({
        "from": "COMET Platform <onboarding@resend.dev>",
        "to": to_email,
        "subject": "Statutory Compliance Report - Form 4-A",
        "html": "<p>Please find attached the generated statutory inspection report.</p>",
        "attachments": [
            {
                "filename": filename,
                "content": list(pdf_bytes)  # or base64 string
            }
        ]
    })
```

---

### 2. Zero-SaaS Alternative: Gmail SMTP (`aiosmtplib`)
If you do not want to register for any third-party SaaS and just want to send real emails to your team or judges:

*   **Why for Prototype:** Free, zero third-party dashboards, and takes 5 minutes to set up.
*   **How it works:** Create a standard Google account, enable 2-Step Verification, generate a 16-character **Google App Password**, and use Python's built-in `email.mime` module with `aiosmtplib`.
*   **Limitations:** Hard limit of 500 emails/day (more than enough for demoing).

---

### 3. Best for Live Demos: Mailtrap (Email Sandbox)
If you are presenting to judges or testing offline without wanting to spam real inboxes:

*   **Why for Prototype:** Acts as a "fake" SMTP server. Every email sent by your FastAPI worker lands in a web-based dashboard inbox.
*   **Advantage:** You can inspect email layouts, verify PDF attachments render properly, and show sent emails on screen without deliverability errors or spam filters.

---

### Recommended Prototype Architecture

```
[Trigger / Form Approval] 
       │
       ▼
[FastAPI Endpoint] ──(WeasyPrint / ReportLab)──► Generates Report PDF
       │
       ▼
[FastAPI BackgroundTasks] ──────────────────────► Resend API / Gmail SMTP
                                                        │
                                                        ▼
                                              [User / Officer Inbox]
```

Would you like a complete FastAPI route snippet showing how to generate a sample PDF and attach it to a background email task?

---

# you asked

message time: 2026-08-31 07:14:48

Compare aiosmtplib vs resend

---

# gemini response

Both `aiosmtplib` and Resend are highly capable tools for dispatching statutory reports (like Form 4-A or CCO Returns) from your FastAPI worker. However, they represent two completely different architectural approaches to sending emails. 

Here is a deep-dive comparison to help you choose the right fit for your COMET prototype.

### 1. Architectural Comparison

| Feature | `aiosmtplib` (SMTP Protocol) | Resend (HTTP API) |
| :--- | :--- | :--- |
| **Technology** | Pure Python async SMTP library. | Cloud SaaS platform with a Python SDK. |
| **Protocol** | Raw SMTP (Port 587/465). | REST API (HTTPS). |
| **FastAPI Fit** | Native `async/await` support built on `asyncio`. | Uses standard HTTP (Must run in `BackgroundTasks`). |
| **Dependency** | Requires a 3rd-party SMTP server (Gmail, SES). | Fully managed infrastructure. |
| **Setup Speed** | Medium (Requires managing MIME and SMTP configs). | Instant (Requires just an API key). |

---

### 2. Deep Dive: `aiosmtplib`
This is an open-source library that implements the SMTP protocol asynchronously. 

*   **Pros:**
    *   **Vendor Agnostic:** You can switch your email provider (from Gmail to AWS SES to Mailtrap) just by changing the SMTP host and port environment variables.
    *   **Native Async:** Because it is built for `asyncio`, it integrates flawlessly with FastAPI's `async def` endpoints, preventing event loop blocking during high-throughput operations.
    *   **Zero SaaS:** Demonstrates a self-reliant architecture to hackathon judges without relying on an external API wrapper.
*   **Cons for Prototyping:**
    *   **Boilerplate Code:** Attaching generated PDFs from WeasyPrint requires manually constructing `email.mime.multipart.MIMEMultipart` objects, setting correct MIME types, and handling base64 encoding.
    *   **Server Required:** You still need a mail server. For a prototype, you usually have to generate a Gmail App Password, which can occasionally trigger security blocks.

---

### 3. Deep Dive: Resend
Resend is a modern transactional email service designed specifically for developers, offering a robust Python SDK (`resend-py`).

*   **Pros:**
    *   **Developer Experience:** The API is incredibly clean. You do not need to build complex MIME objects; you simply pass a Python dictionary.
    *   **Instant Prototyping:** Resend provides a testing domain right out of the box (e.g., `onboarding@resend.dev`), allowing you to send test emails to yourself immediately without verifying DNS records.
    *   **Beautiful Templates:** Native support for React-email if you want to make your compliance alerts look highly professional.
*   **Cons for Prototyping:**
    *   **Synchronous SDK:** The Python SDK uses synchronous HTTP requests under the hood. You **must** offload it to FastAPI's `BackgroundTasks` to avoid blocking your async server.
    *   **Sandbox Limits:** Until you verify a domain, you can only send emails to the specific email address you used to register for Resend.

---

### 4. Handling PDF Attachments (The COMET Requirement)
Because your platform must auto-generate and email statutory documents like the Monthly Safety Committee Report, attachment handling is a critical factor.

**With `aiosmtplib`**, attaching a PDF requires manual MIME construction:
```python
# Requires importing MIMEBase, encoders, MIMEMultipart
part = MIMEBase('application', 'octet-stream')
part.set_payload(pdf_bytes)
encoders.encode_base64(part)
part.add_header('Content-Disposition', 'attachment; filename="form_3.pdf"')
msg.attach(part)
await aiosmtplib.send(msg, hostname="smtp.gmail.com", ...)
```

**With Resend**, the SDK abstracts the complexity away:
```python
# Pass bytes directly to the payload dictionary
attachments = [{"filename": "form_3.pdf", "content": list(pdf_bytes)}]
resend.Emails.send({"attachments": attachments, "to": "...", ...})
```

---

### Final Recommendation

*   **Choose Resend** if your priority is **speed of development for the hackathon**. It allows you to skip SMTP configuration and eliminates the headache of manually writing MIME wrappers for your PDF attachments. 
*   **Choose `aiosmtplib` (with Gmail/Mailtrap)** if you strictly want to avoid adding third-party SaaS dependencies to your project, or if you want to ensure your FastAPI endpoints remain 100% natively async.

Would you like to see how to properly wrap the Resend SDK call inside a FastAPI `BackgroundTask` so it doesn't block your server's event loop when an inspection gets submitted?

---

# you asked

message time: 2026-08-31 07:18:59

Suppose my complete app is ready to deploy in market
Compare AWS vs gcp for the deployment

---

# gemini response

Deploying the COMET platform for Coal India Limited (CIL) means you are dealing with strict government compliance, heavy AI/ML compute, and complex data architecture. Because you are targeting the Indian public sector, the deployment landscape is governed by data sovereignty just as much as technical capability.

Here is a direct comparison between AWS and GCP tailored to your specific architecture (FastAPI, React 19, Supabase, and Kubernetes).

### 1. Government Compliance & Data Sovereignty
*   **MeitY Empanelment:** Both AWS and GCP are fully empanelled by the Ministry of Electronics and Information Technology (MeitY) for public sector workloads under the MeghRaj initiative.
*   **Disaster Recovery (DR):** The DPDP Act 2023 requires strict data localization. AWS has a slight edge here with two highly mature Indian regions (Mumbai and Hyderabad), making active-active Disaster Recovery entirely within India seamless. GCP operates out of Mumbai and Delhi.
*   **Gov-Tech Footprint:** AWS has a historically larger footprint in Indian public sector projects, meaning IT auditors (like CERT-In) are highly familiar with AWS compliance architectures.

### 2. Deploying the COMET Tech Stack
*   **Compute (FastAPI & AI Workers):** You are containerizing your Python backend using Docker and Kubernetes. GCP’s Google Kubernetes Engine (GKE) is the undisputed industry leader. It is significantly more developer-friendly, upgrades smoother, and scales faster than AWS Elastic Kubernetes Service (EKS).
*   **The Supabase Layer:** Supabase is the heart of your platform. If you use Supabase's managed Enterprise tier, note that it runs natively on AWS. If you choose to *self-host* Supabase to maintain absolute data control, GCP’s GKE combined with persistent disks offers a slightly cleaner operational experience for small DevOps teams.
*   **AI/ML Compute:** Your XGBoost, scikit-learn, and time-series forecasting models require efficient compute. GCP’s Vertex AI provides a highly intuitive developer experience for Python teams. AWS SageMaker is exceptionally powerful but carries a steeper enterprise learning curve.

### 3. Direct Comparison

| Feature | AWS | GCP |
| :--- | :--- | :--- |
| **Intra-India DR** | Mumbai & Hyderabad (Best for strict RBI/Govt DR) | Mumbai & Delhi |
| **Kubernetes (K8s)** | EKS (Highly configurable, steeper learning curve) | GKE (Best-in-class, highly automated) |
| **AI/ML Tooling** | SageMaker (Feature-dense, complex) | Vertex AI (Intuitive, excellent Python ecosystem) |
| **Govt Familiarity** | Deeply entrenched in Indian enterprise/government | Growing, but trails AWS in public sector share |
| **Cost Efficiency** | Higher baseline cost, better discounts at massive scale | Cheaper floor, excellent for initial market scaling |

### 4. Final Recommendation
**Choose AWS** if passing stringent government procurement audits, ensuring seamless multi-region DR within India, and leveraging a vast ecosystem of certified public sector partners are your primary goals. 

**Choose GCP** if your engineering team is small, you prioritize a flawless Kubernetes (GKE) experience for your FastAPI microservices, and you want the easiest path to scaling your AI risk models.

How are you planning to deploy the Supabase layer for this production launch—are you opting for Supabase's managed enterprise cloud, or are you preparing to self-host the entire Postgres/Auth/Storage stack directly on your chosen cloud provider?

---

# you asked

message time: 2026-08-31 07:24:29

Ok let's talk again about Blockchain level security 
What exactly the ps needs ?

---

# gemini response

Based on the official Ministry of Coal / Coal India Limited (CIL) Problem Statement and your system's PRD, the requirement for **"Blockchain-based audit trails"** stems from a specific governance challenge in Indian mining operations: **preventing data tampering, eliminating backdated records, and creating shared trust with external regulators**.

---

### The Real Problem the PS is Solving

In traditional coal mining governance:
* **Post-Incident Tampering:** When a mine hazard, gas leak, or fatal incident occurs, paper registers and centralized database entries can be retroactively altered, delayed, or deleted to evade statutory liability under the *Mines Act 1952* or *Coal Mines Regulations (CMR) 2017*.
* **Regulatory Mistrust:** External regulatory authorities (DGMS, MoEFCC, State Pollution Control Boards) currently have to request paper returns or rely on CIL's internal reports without independent proof that records were not manipulated after generation.
* **Dispute Resolution:** In legal or statutory inquiries, proving that a specific safety observation, CAPA approval, or inspection checklist existed at an exact second in time is difficult with standard editable database rows.

---

### What the Problem Statement Specifically Needs

To satisfy the PS requirements for a **"secure digital audit trail for transparent and paperless governance,"** your architecture addresses four key capabilities:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       1. Operational Action Occurs                          │
│  (Form 4-A Generated / Safety Violation Closed / Sensor Threshold Breached) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    2. FastAPI Compute & Hashing Layer                       │
│    • Generate canonical SHA-256 Hash of PDF / JSON record                   │
│    • Write immutable write-only row in Supabase PostgreSQL                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   3. Permissioned Blockchain Anchoring                      │
│    • Anchor { record_id, timestamp, sha256_hash, geo_stamp, signer }        │
│    • Distributed across CIL, DGMS, and MoEFCC peer nodes                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     4. Independent Regulator Portal                         │
│  Regulator uploads statutory PDF ──► Frontend computes hash ──► Matches on  │
│  chain (100% mathematical proof of non-tampering)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Tamper-Evident Immutability (Non-Repudiation)
* **What is required:** Once a compliance action is recorded (e.g., an inspector logs a critical methane reading or a Mine Manager approves a CAPA closure), it must be mathematically impossible to modify or erase.
* **Implementation:** An append-only audit ledger where even a Database Administrator (DBA) with `root`/`service_role` access cannot edit history without invalidating the cryptographic hash chain.

#### 2. Consortium Multi-Agency Trust
* **What is required:** The PS explicitly involves multiple distinct entities: **Coal India Limited (operator)** and **Regulatory Bodies (DGMS, MoEFCC, SPCB)**.
* **Implementation:** A permissioned consortium network (e.g., **Hyperledger Fabric** or India's **National Blockchain Framework - Vishvasya** by MeitY) where:
  * CIL operates peer nodes to record mine data.
  * DGMS and MoEFCC operate validating peer nodes to hold verifiable ledger copies without needing direct access to CIL's operational database.

#### 3. Off-Chain Data / On-Chain Cryptographic Anchoring
* **What is required:** The PS does **not** expect raw operational data, heavy media attachments (photos/video evidence), or gigabytes of time-series sensor data to be stored directly inside a blockchain.
* **Implementation:**
  * **Off-Chain (Supabase PostgreSQL / Storage):** Stores the actual structured tables, inspection notes, photos, and generated PDF reports.
  * **On-Chain (Blockchain Ledger):** Stores only the **cryptographic fingerprint**:
    $$\text{Payload} = \{\text{Record ID}, \text{Timestamp}, \text{GeoStamp}, \text{Actor Role}, \text{SHA-256 Hash}\}$$

#### 4. Regulator One-Click Verification
* **What is required:** Regulators need a way to verify statutory submissions independently.
* **Implementation:** A read-only verification utility in the Regulator Portal. When a DGMS officer opens a statutory Form 4-A (Accident Notice) or Annual Return (Form 3), the portal recalculates the SHA-256 hash of the document locally and compares it with the hash anchored on the blockchain ledger.
  * If hashes match: **"Verified Authentic & Unaltered"** (Green badge).
  * If a single character was altered: **"Hash Mismatch / Integrity Compromised"** (Red alert).

---

### Summary of What Critical Records Must Be Anchored

| Entity / Action | Regulation Ref | What is Anchored On-Chain |
| :--- | :--- | :--- |
| **Accident Notices (Form 4-A)** | CMR 2017 Reg 79 | SHA-256 hash of final PDF + incident timestamp + location |
| **Annual Safety Returns (Form 3)** | CMR 2017 Reg 4 | Digital signature hash of Mine Manager + corporate sign-off |
| **CAPA Violation Closure** | DGMS Standard | Verification evidence hash + approving safety officer ID |
| **Environmental EC Breaches** | EP Act 1986 | Sensor breach timestamp + raw station telemetry hash |

---

### How to Highlight This in Your Presentation / Demo

To impress the evaluators:
1. **Show the Problem:** Demonstrate how a normal database record can be updated by an admin.
2. **Show the Solution:** Demonstrate submitting an inspection, anchoring its SHA-256 hash to the audit ledger, and then using the **Regulator Portal's "Verify Integrity"** feature to mathematically prove that the statutory PDF has not been altered since submission.

---

# you asked

message time: 2026-09-07 07:16:38

Let's discuss about our main engine the anamoly detection 
Ai risk scoring 
Time series forecasting 
Report generation module which uses llm to generate reports summaries and content

And list all the other features we can have

---

# gemini response

## 1. Predictive Risk Scoring & Time-Series Forecasting

* **Mine Risk Scoring Model (0–100):** A supervised tabular model (XGBoost/LightGBM) running in FastAPI evaluates violation frequency, incident severity, inspection coverage, and CAPA closure delays to compute composite risk scores per mine site. Scores output explainable contributing factor weights (SHAP values) directly into `mine_risk_scores`.
* **Statutory Breach Forecasting:** Time-series models (Facebook Prophet / NeuralProphet) monitor task completion velocity against statutory deadlines, predicting compliance lapses days before they occur.
* **Environmental Trend Forecasting:** Evaluates multi-day meteorological and air-quality trends ($PM_{10}$, $PM_{2.5}$) to predict seasonal threshold breaches, allowing environmental officers to enact dust-suppression protocols proactively.

---

## 2. Operational Anomaly Detection Engine

* **Multi-Variate Telemetry Monitoring:** Statistical control limits combined with unsupervised models (Isolation Forest / PyTorch autoencoders) track shift-wise coal extraction and CAAQMS/sensor feeds ($CH_4$, $CO$, effluent $pH$).
* **Plan Variance & Safety Triaging:** Ingested production logs are checked against approved mining plans to spot illegal extraction variances. If gas thresholds breach safety limits (e.g., $CH_4 > 1.5\%$), Supabase Webhooks fire instantly to trigger emergency alarm payloads.
* **Systemic Hazard Clustering:** Unsupervised clustering (DBSCAN / K-Means) groups spatial coordinates, violation categories, and narrative embeddings to surface repeating root-cause hazards across colliery clusters.

---

## 3. LLM-Powered Statutory Report Generation

* **Contextual Narrative Drafting:** An LLM pipeline (Claude API / local Llama 3 via RAG) ingests structured shift data, incident reports, and sensor logs to auto-draft complex statutory text—such as Form 4-A Accident Notices, Monthly Safety Committee minutes, and EC Half-Yearly Compliance Reports.
* **Statute Citation Grounding:** Queries pass through a vector store (pgvector/OpenSearch) loaded with the *Mines Act 1952* and *CMR 2017* to automatically append exact statutory citations and mandatory formats.
* **PDF Rendering & Anchoring:** FastAPI compiles the structured draft into standardized PDFs using WeasyPrint, computes a canonical SHA-256 hash, and anchors the digest to the blockchain ledger for instant tamper verification.

---

## 4. High-Impact Enterprise Feature Roadmap

* **UAV/Drone Spatial AI:** Ingests drone-captured GeoTIFFs to compute 3D stockpile volumes and verify green-belt afforestation against Mine Closure Plans.
* **Edge-AI Video Analytics:** Processes RTSP CCTV streams using YOLOv8 for automated PPE compliance (helmets, vests) and active HEMM exclusion zone intrusion alerts.
* **Dual-Route OCR Ingestion:** Employs PyMuPDF for digital PDFs alongside heavy vision models (Unlimited-OCR / PaddleOCR) for degraded paper registers, backed by a human-in-the-loop review queue.
* **Multilingual Voice Interface:** Voice-driven field reporting and grievance intake powered by the Government of India's Bhashini API (with Whisper fallback) supporting Hindi, Odia, Bengali, and Marathi.
* **Dynamic Contractor Trust Scoring:** Real-time compliance scorecards tracking contractor safety incidents, statutory adherence, and automated license expiry blacklists.
* **Worker Fatigue & Attendance Analytics:** Correlates biometric attendance and consecutive night shifts to dynamically flag fatigue risks before machinery assignment.
* **Regulator Zero-Trust Portal:** A dedicated, read-only interface allowing DGMS and MoEFCC officials to audit compliance and verify document authenticity without accessing internal databases.

---

Which specific machine learning pipeline would you like to design first: the **XGBoost Risk Scoring Engine** or the **Prophet Anomaly & Forecasting Service**?

---

# you asked

message time: 2026-09-09 20:03:56

just describe in depth about the core services mentioned in the problem statement Problem Statement ID	
26024
Problem Statement Title	
AI-Based Smart Governance and Compliance Monitoring System for Coal Mines
Description	
Background:

The Indian coal mining sector involves large-scale operations spread across multiple subsidiaries, mine sites, contractors, regulatory bodies, and field offices. Governance-related activities such as statutory compliance monitoring, inspection tracking, safety observations, production reporting, environmental monitoring, worker attendance, contract management, grievance handling, and regulatory reporting are often managed through fragmented systems, manual documentation, spreadsheets, and delayed reporting mechanisms.

This leads to challenges such as data inconsistency, delayed decision-making, limited transparency, compliance gaps, duplication of records, weak monitoring of field-level activities, and difficulty in obtaining real-time operational insights. With increasing focus on transparency, accountability, sustainability, and digital governance, there is a need for an integrated smart governance platform specifically designed for the coal mining ecosystem.

Defining the Problem:

Develop a centralized AI-enabled governance and compliance monitoring platform for coal mining operations that can digitally integrate mine-level activities, statutory compliance, inspections, contractor management, and operational reporting.

The proposed solution should:

• Digitally track statutory compliance requirements related to safety, environment, production, and labour regulations.
• Enable real-time monitoring of inspections, observations, violations, and corrective actions.
• Use AI/analytics to identify high-risk areas, recurring compliance failures, and operational anomalies.
• Provide geo-tagged and time-stamped field reporting through mobile applications.
• Integrate dashboards for mine officials, corporate management, and regulatory authorities.
• Generate automated alerts, reminders, compliance reports, and escalation mechanisms.
• Minimize manual paperwork and improve transparency, accountability, and decision-making.
• Be scalable for deployment across multiple mines and subsidiaries.
• Participants may use AI/ML, mobile applications, GIS mapping, OCR/document digitization, workflow automation, blockchain-based audit trails, or multilingual conversational interfaces as part of the solution.

The proposed system is expected to:

• Improve governance efficiency and transparency in coal mining operations.
• Reduce delays and errors in compliance management and reporting.
• Enable data-driven monitoring and faster administrative decision-making.
• Strengthen accountability and real-time tracking of field activities.
• Support digital transformation and paperless governance in the mining sector.
• Create a scalable indigenous e-governance framework for Indian coal mines. Expected Solution:

The proposed solution should be a centralized AI-enabled smart governance platform for coal mines that integrates compliance monitoring, inspection management, operational reporting, contractor management, and field activity tracking into a single digital ecosystem. The system should provide real-time visibility, automated workflows, and data-driven insights through web and mobile applications to improve transparency, accountability, and decision-making across multiple mining sites and subsidiaries.

• Centralized dashboard for mine officials, corporate management, and regulatory authorities with real-time compliance and operational monitoring.
• AI/analytics engine to detect compliance risks, operational anomalies, recurring violations, and generate predictive alerts.
• Geo-tagged mobile application for field inspections, safety observations, attendance, and incident reporting with offline support.
• Automated workflow system for alerts, reminders, escalations, digital approvals, and statutory report generation.
• GIS mapping, OCR-based document digitization, and secure digital audit trails for transparent and paperless governance.
Organization	Ministry of Coal
Department	Coal India Limited
Category	Software
Theme	Smart Automation

---

# gemini response

Based on the explicit requirements outlined in the Ministry of Coal's Problem Statement (ID 26024) and your system documentation, the platform is built upon four foundational core services designed to eliminate manual silos and enforce real-time accountability.

### 1. Compliance Tracking & Inspection Engine
The system replaces disjointed spreadsheets with a centralized, mobile-accessible statutory monitoring module. 
*   **Statutory Compliance Tracker:** It maintains a digital calendar of all requirements mapped to the *Mines Act 1952*, environmental limits, and labor laws, generating automated tasks for mine officials.
*   **Real-time Inspections & CAPA:** Field inspectors capture geo-tagged and time-stamped safety observations directly on-site. If a violation is logged, it instantly triggers a Corrective and Preventive Action (CAPA) workflow, tracking the issue from assignment through verification and closure.

### 2. AI-Driven Risk & Anomaly Detection
To transition from reactive reporting to proactive governance, the analytics layer continuously monitors operational data for irregularities.
*   **Predictive Risk Scoring:** An AI engine evaluates violation history, inspection frequency, and incident severity to compute a dynamic risk score for each individual mine site. 
*   **Operational Anomaly Detection:** Time-series telemetry (such as shift-wise coal production and air quality) is compared against approved mining plans. Sudden variances or pollution spikes automatically trigger proactive warnings.
*   **Pattern Recognition:** Unsupervised clustering models group recurring compliance failures to highlight systemic hazards across multiple subsidiaries.

### 3. Automated Workflows & Escalation System
Delayed administrative decision-making is mitigated through stateful, automated task routing.
*   **Escalation Matrix:** If a compliance task or safety violation breaches its designated deadline (e.g., 48 hours), the system dispatches multi-channel alerts (Push, SMS, Email) and escalates the issue up the chain of command from the Mine Manager to Corporate Executives.
*   **Statutory Report Generation:** The platform automatically compiles field observations and sensor readings into standardized statutory reports, severely minimizing manual administrative paperwork.

### 4. Field Operations & Digital Trust Layer
To ensure complete transparency and data integrity across remote sites, the platform integrates critical technological enablers.
*   **Offline-First Mobile Architecture:** Field reporting operates seamlessly in disconnected mine environments, queuing geo-tagged observations locally and securely synchronizing once network connectivity returns. 
*   **Paperless Governance Enablers:** This is supported by OCR for digitizing legacy contractor licenses, GIS mapping for visualizing hazard boundaries, and blockchain-anchored audit trails to guarantee that statutory records are tamper-proof.

Which specific core service should we focus on mapping out the API Low-Level Design (LLD) endpoints for next?

---

# you asked

message time: 2026-09-09 20:11:16

lets talk about the implementation  of the 1 module

---

# gemini response

Implementing **Module 1: Compliance Tracking & Inspection Engine** requires bridging offline field data collection with strict statutory enforcement workflows under the *Mines Act 1952* and *CMR 2017*. Here is the architectural Low-Level Design (LLD) for bringing this core module to life.

### 1. Database Schema & State Management
*   **Domain Entities:** Supabase PostgreSQL handles the core domain, including tables for `compliance_requirements`, `compliance_instances`, `inspections`, `observations`, `violations`, and `corrective_actions`.
*   **State Machines:** The module operates on strict status enumerations. For example, `instance_status` moves exclusively through pending, in_progress, submitted, approved, or breached.
*   **Tenant Isolation:** Row-Level Security (RLS) policies natively scope all operational tables by `mine_id` to guarantee cross-subsidiary data isolation.

### 2. Backend Workflows & Escalation Logic
*   **Task Generation:** The system correlates the master regulation library with specific mine configurations to automatically generate comprehensive statutory task calendars.
*   **Background Escalation:** A `pg_cron` job polls the database every 15 minutes. If a compliance instance or CAPA surpasses its due date, it triggers a FastAPI background task to initiate an escalation ladder.
*   **Event-Driven Triggers:** When a new `violation` is logged, a Supabase Webhook instantly fires an HTTP POST to FastAPI's `/internal/webhook` router. This notifies assigned safety officers and triggers AI risk score recomputations asynchronously.

### 3. Offline-First Mobile Inspection Protocol
*   **Field Capture:** Field inspectors use the React Native app to complete configurable checklists. They capture geo-tagged and time-stamped observations alongside photo or video evidence directly on-site.
*   **Local Storage:** All field data is saved instantly to the local WatermelonDB database to guarantee uninterrupted operation in zero-connectivity mine environments.
*   **Sync Resolution:** Upon reconnection, the mobile app pushes data to FastAPI's `/api/v1/sync` endpoint. The server uses an append-only conflict resolution strategy to prevent any submitted inspection records from being overwritten or lost.

### 4. Web Dashboard Operations
*   **Real-Time Oversight:** The React 19 web dashboard utilizes Supabase Realtime WebSocket subscriptions. This displays a live feed of incoming safety alerts immediately without requiring client-side polling.
*   **Evidence Approval:** When compliance evidence is submitted, managers utilize an inline side-by-side OCR review panel. This allows them to manually verify low-confidence extracted fields before formally approving the compliance instance.

Which specific part of Module 1 should we design the exact API request/response payloads for next: the offline sync push endpoint, or the CAPA escalation webhook?

---

# you asked

message time: 2026-09-13 12:05:53

lets talk about the implementation  of the 2 module

---

# gemini response

Implementing **Module 2: AI-Driven Risk & Anomaly Detection** transitions the COMET platform from passive record-keeping to proactive hazard mitigation by running continuous machine learning inferences inside the Python 3.12 FastAPI worker layer.

### 1. Database Schema & Persistence

The AI engine persists composite scores and detected anomalies into dedicated PostgreSQL tables in Supabase:

*   **`mine_risk_scores`**: Stores point-in-time composite risk indices (0–100) alongside explainability payloads.
    ```sql
    CREATE TABLE mine_risk_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mine_id UUID NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
        score NUMERIC(5, 2) NOT NULL CHECK (score BETWEEN 0 AND 100),
        contributing_factors JSONB NOT NULL, -- e.g., {"capa_delays": 0.35, "methane_spikes": 0.40}
        model_version VARCHAR(50) NOT NULL,
        calculated_at TIMESTAMPTZ DEFAULT now()
    );
    ```
*   **`anomaly_flags`**: Records statistical and machine-learning outliers across environmental sensors and shift production.
    ```sql
    CREATE TABLE anomaly_flags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mine_id UUID NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
        entity_type VARCHAR(50) NOT NULL, -- 'environment_readings' or 'production_readings'
        entity_id UUID NOT NULL,
        metric_name VARCHAR(50) NOT NULL, -- 'ch4_concentration', 'pm10', 'coal_extracted_mt'
        observed_value DOUBLE PRECISION NOT NULL,
        expected_range NUMRANGE NOT NULL,
        severity VARCHAR(20) NOT NULL, -- 'warning', 'critical'
        is_acknowledged BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
    );
    ```

---

### 2. Core Machine Learning Pipelines

```
 ┌────────────────────────┐      ┌─────────────────────────┐
 │ Operational Telemetry  │      │ Violations & CAPA Data  │
 │ (Sensors / Production) │      │ (Inspections / Audits)  │
 └───────────┬────────────┘      └────────────┬────────────┘
             │                                │
             ▼                                ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  Isolation Forest Engine │    │  XGBoost Tabular Scorer  │
│ • Sensor drift & leaks   │    │ • 0–100 Composite score  │
│ • Production anomalies   │    │ • SHAP feature weights   │
└────────────┬─────────────┘    └─────────────┬────────────┘
             │                                │
             └────────────────┬───────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  Supabase Alerts & Flags  │
                │ • Push to alerts table    │
                │ • Supabase Realtime toast │
                │ • Mobile Notifee alarm    │
                └───────────────────────────┘
```

#### A. Tabular Mine Risk Scoring (XGBoost)
*   **Feature Extraction:** FastAPI queries the database using SQLAlchemy 2.0 Async (via service-role key to aggregate cross-table data):
    *   *Violation Frequency:* Total violations logged over rolling 30-day and 90-day windows, weighted by severity ($\text{Critical} \times 5 + \text{Major} \times 2 + \text{Minor} \times 1$).
    *   *CAPA Slippage Rate:* Ratio of overdue corrective actions vs. closed corrective actions.
    *   *Inspection Deficit:* Scheduled statutory inspections vs. completed geo-tagged inspections.
    *   *Near-Miss Velocity:* Frequency of Form 4-A / incident reports logged in the previous quarter.
*   **Inference & Explainability:** The XGBoost model calculates a normalized risk score ($0.00$ to $100.00$). TreeSHAP calculates the local feature contributions, packaging the top negative drivers into `contributing_factors` JSONB so the frontend `RiskScoreGauge` renders readable tooltips for Mine Managers.

#### B. Telemetry & Sensor Anomaly Detection (Isolation Forest)
*   **Feature Vectors:** Multi-variate input vectors combine real-time sensor metrics: $[CH_4, CO, PM_{10}, PM_{2.5}, \text{ambient\_temp}, \text{ventilation\_flow}]$.
*   **Model Execution:** An `IsolationForest` model (from `scikit-learn`) identifies points with an anomaly score $s < -0.65$.
*   **Threshold Fallbacks:** Hard statutory bounds run concurrently (e.g., $CH_4 > 1.5\%$ pursuant to *Coal Mines Regulations 2017*). If either the model or hard threshold breaches, an anomaly row is generated immediately.

#### C. Compliance Deadline Forecasting (Prophet)
*   **Forecasting Task Burndown:** Time-series task completion velocity is fit onto Facebook Prophet models.
*   **Breach Alerts:** If the projected trajectory indicates a scheduled annual or statutory return (e.g., Form 3) will breach its statutory due date with $>80\%$ confidence, the engine triggers a preemptive notification before the deadline lapses.

---

### 3. Execution Lifecycle & Triggers

| Trigger Source | Mechanism | Target Handler | Latency SLA |
| :--- | :--- | :--- | :--- |
| **Scheduled Rescore** | `pg_cron` (runs every 6 hours) | `POST /api/v1/ai/risk-score/batch` | $< 2\text{s}$ per mine |
| **Violation Created** | Supabase Webhook on `violations` INSERT | `handle_violation_created` | Async background task |
| **Sensor Breach** | Supabase Webhook on `environment_readings` | `handle_env_breach` | $< 500\text{ms}$ |
| **Manual Assessment** | Dashboard API call (`GET /api/v1/ai/risk-score/{mine_id}`) | Inline FastAPI worker inference | $< 1\text{s}$ (Redis cached) |

---

### 4. Downstream Dispatch Integration

When an anomaly or elevated risk score is computed:
1.  **Database Write:** FastAPI inserts a record into `mine_risk_scores` or `anomaly_flags`.
2.  **Notification Creation:** If `score > 75` or anomaly severity is `critical`, FastAPI inserts an alert record into the `alerts` table with `priority = 'critical'` and `channels = ['in_app', 'push', 'sms']`.
3.  **UI & Device Execution:** 
    *   Supabase Realtime pushes a WebSocket notification directly to the React 19 web dashboard.
    *   The background worker triggers Firebase Cloud Messaging (FCM), causing the field officer's mobile app to fire a native siren alarm via Notifee, bypassing device silent switches.

Would you like to examine the exact Python code for the XGBoost scoring router or the FastAPI endpoint that processes incoming sensor telemetry?

---

# you asked

message time: 2026-09-13 12:24:47

lets talk about the implementation  of the 3 module

---

# gemini response

**Module 3: Automated Workflows & Escalation System** eliminates administrative lag by orchestrating automated task routing, time-based SLA monitoring, and event-driven multi-channel alerting across the mining hierarchy.

### 1. Database Schema & State Tracking

The engine relies on two PostgreSQL tables in Supabase to track workflow state machines and system-wide alerts:

```sql
-- Tracks active escalation lifecycles across entities
CREATE TABLE escalation_workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id UUID NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'compliance_instance', 'corrective_action'
    entity_id UUID NOT NULL,
    current_level INT DEFAULT 1, -- 1: Mine Manager, 2: Subsidiary Admin, 3: Corporate/Regulator
    breached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    next_escalation_at TIMESTAMPTZ NOT NULL,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Core notification ledger
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id UUID REFERENCES mines(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL, -- 'info', 'medium', 'high', 'critical'
    channels TEXT[] NOT NULL,       -- ARRAY['in_app', 'push', 'email', 'sms']
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 2. Automated SLA Scanning via `pg_cron`

Rather than maintaining persistent Node.js or Python timer processes, the scheduler runs inside Supabase using the native `pg_cron` extension:

* **Cadence:** A cron worker executes every 15 minutes to evaluate overdue records (`status NOT IN ('approved', 'verified_closed') AND due_date < now()`).
* **State Progression:** When an unresolved task breaches its SLA window (e.g., 48 hours), the procedure increments `current_level` from 1 to 2, calculates `next_escalation_at`, and inserts an actionable alert record.
* **Regulator Flagging:** If an escalation reaches Level 3 (e.g., overdue $> 7\text{ days}$), the procedure updates the target entity with `is_regulator_visible = true`, exposing the violation on the read-only Regulator Portal.

---

### 3. Event-Driven Dispatch Architecture

```
[pg_cron SLA Breach / Sensor Anomaly]
                 │
                 ▼
     INSERT into `alerts` table
                 │
                 ▼
     Supabase Database Webhook (POST)
                 │
                 ▼
 FastAPI `/internal/webhook/notify`
                 │
  ┌──────────────┼──────────────┬──────────────┐
  ▼              ▼              ▼              ▼
Supabase      Resend API    Expo / FCM      Notifee
Realtime     (Email/PDF)   (Standard Push) (Critical Siren)
(Web Toast)                
```

1. **Trigger:** An anomaly occurs (e.g., sensor threshold breach or cron-detected escalation), inserting a row into `alerts`.
2. **Webhook Handoff:** Supabase Webhooks emit an asynchronous HTTP POST payload to FastAPI's internal endpoint `/internal/webhook/notify`.
3. **Channel Routing:** FastAPI delegates tasks to asynchronous workers (`BackgroundTasks`) to prevent thread blocking:
   * **Web Dashboard:** Handled natively via **Supabase Realtime**; the React 19 frontend receives the database `INSERT` event over WebSockets and renders an instant toast notification.
   * **Email Reports:** Dispatched via **Resend**; compiles statutory PDFs and sends attachments to corporate executives.
   * **Standard Field Push:** Dispatched via **`expo-notifications`** (FCM); delivers background badge updates and banners to field staff.
   * **Emergency Alarm:** Dispatched when `priority = 'critical'` (e.g., $CH_4 > 1.5\%$ or fatal incident); sends a high-priority FCM data payload consumed by **Notifee** to trigger a native full-screen siren that bypasses device silent mode.

---

### 4. Statutory Escalation Ladder Matrix

| Threshold | Target Role | Channels | Action / Outcome |
| :--- | :--- | :--- | :--- |
| **$T - 7\text{ days}$** | Assigned Safety / Field Officer | Push (FCM) | Reminder badge in app to complete inspection/report. |
| **$T - 3\text{ days}$** | Mine Manager | Push + Email | Urgent warning of pending statutory due date. |
| **$T + 0\text{ hrs}$ (Breach)** | Mine Manager & Safety Officer | In-App + Push + Email | `status` moves to `breached`; starts escalation timer. |
| **$T + 48\text{ hrs}$ (Level 2)** | Subsidiary Admin | In-App + Email Digest | Escalation event logged with attached AI risk score. |
| **$T + 7\text{ days}$ (Level 3)** | Corporate Head & DGMS Regulator | In-App + SMS + Portal | `is_regulator_visible = true`; flagged for statutory inquiry. |
| **Immediate ($CH_4 > 1.5\%$)** | All Mine Staff & Rescue Team | Notifee Alarm + SMS | Full-screen phone takeover and emergency evacuation siren. |

---

Would you like to examine the implementation of **Module 4: Field Operations & Digital Trust Layer** (offline-first sync protocol, OCR, and blockchain verification), or dive into the FastAPI webhook handler code?

---

# you asked

message time: 2026-09-13 12:25:35

lets talk about the implementation  of the 4 module

---

# gemini response

**Module 4: Field Operations & Digital Trust Layer** bridges disconnected underground mine environments with an immutable regulatory audit trail. It combines an offline-first synchronization engine, spatial geo-validation, automated OCR document ingestion, and blockchain hash anchoring.

---

### 1. Offline-First Synchronization Protocol (WatermelonDB + FastAPI)

The mobile field app operates offline for up to 72 hours using SQLite-backed WatermelonDB, synchronizing through delta endpoints on connectivity restore:

```
[Mobile WatermelonDB (Local SQLite)]
         │
         ├── 1. POST /api/v1/sync/pull?last_pulled_at={ts} ──► Fetch incremental delta
         │
         ├── 2. POST /api/v1/sync/push ─────────────────────► Push batch mutations
         │
         └── 3. Decoupled Media Upload ─────────────────────► Direct to Supabase Storage
```

* **Delta Synchronization:** 
  * `/sync/pull`: FastAPI queries modified records with `WHERE mine_id = :mine_id AND updated_at > :last_pulled_at` via SQLAlchemy Async.
  * `/sync/push`: Incoming records carry client-generated UUIDs to ensure idempotent retries.
* **Decoupled Media Upload:** Field photos and audio notes are stored locally as raw files with `sync_status = 'pending_upload'`. Once back online, the app requests a 15-minute presigned upload URL from FastAPI and transfers binaries directly to Supabase Storage (`compliance-evidence/` or `inspections/`) without congesting the JSON sync thread.
* **Conflict Arbitration Matrix:**
  * *Inspections & Observations:* Append-only; local records are never discarded on collision.
  * *Attendance Records:* Server authoritative; server validates timestamps and location against shifts.
  * *Incidents:* Both versions are preserved, creating a review task in the Mine Manager's conflict queue.

---

### 2. Spatial Integrity & Geo-Fencing (PostGIS)

Every inspection, observation, and attendance tap captures a `geo_stamp` JSONB payload containing coordinates: $\{\text{lat}, \text{lng}, \text{accuracy}\}$.

* **Server-Side Boundary Validation:** During `/sync/push`, FastAPI invokes PostGIS via GeoAlchemy2 to test if points intersect the colliery polygon:
  ```python
  is_within = await db.scalar(
      select(func.ST_Contains(
          func.ST_GeomFromGeoJSON(mine.boundary_geojson),
          func.ST_SetSRID(func.ST_MakePoint(stamp.lng, stamp.lat), 4326)
      ))
  )
  ```
* **Drift Fault-Tolerance:** Because deep-shaft and opencast highwall environments distort satellite signals, records with `is_within = false` are **flagged** (`location_mismatch = true`) rather than rejected outright, allowing Mine Managers to manually review fringe entries.

---

### 3. Dual-Route OCR Document Digitization Pipeline

To digitize physical registers without costly manual data entry, uploads are processed via a two-tier pipeline:

```
                       [Document Uploaded]
                               │
            Is it a natively digital PDF?
               ├── YES ──► Route 1: Light Parse (PyMuPDF)
               └── NO  ──► Route 2: Heavy Vision Model (Unlimited-OCR / PaddleOCR)
                               │
                     Confidence Score Check
               ├── ≥ 0.85 ──► Auto-apply to target table
               └── < 0.85 ──► Route to Human-in-the-Loop Review Queue
```

* **Route 1 (Light Parse):** Digital contractor certificates pass through PyMuPDF, extracting raw text and tables in milliseconds to conserve compute.
* **Route 2 (Deep Vision):** Degraded legacy registers (such as Form 4-B accident logs) route to baidu/Unlimited-OCR using Reference Sliding Window Attention (R-SWA) to process multi-page tables across page breaks without context loss.
* **Confidence Gating:** If `overall_confidence < 0.85`, the extracted payload is routed to `/ocr/review/:itemId`. The web UI renders an `OCRSideBySide` component with interactive bounding-box overlays, allowing safety clerks to verify fields before committing data to PostgreSQL.

---

### 4. Cryptographic Audit Trail & Blockchain Verification

Trust between Coal India Limited (operator) and regulatory agencies (DGMS, MoEFCC) is established through an immutable ledger architecture:

```
[Statutory Record Finalized] ──► Generate SHA-256 Digest ──► Anchor to Blockchain
                                                                    │
                                                            [Regulator Portal]
                                                                    │
                                                        Client-Side Recalculation
                                                                    │
                                                    Matches Ledger? ──► Green Stamp
```

* **Write-Only PostgreSQL Audit Table:** All database mutations write an audit log row. PostgreSQL database triggers explicitly reject `UPDATE` and `DELETE` queries on this ledger, preventing DBA tampering.
* **Document Hash Anchoring:** When statutory PDFs (e.g., Form 3 Annual Returns or Form 4-A Accident Notices) receive digital sign-off, FastAPI computes a strict cryptographic hash of the compiled binary:
  $$\text{Hash} = \text{SHA-256}(\text{PDF\_Bytes})$$
  The digest is batched into a Merkle root and anchored to the Hyperledger Fabric consortium (or India's National Blockchain Framework - *Vishvasya*) alongside timestamp, mine ID, and signer identity.
* **Regulator Zero-Trust Verification:** Regulators access the read-only Regulator Portal. When auditing a statutory return, the portal recomputes the SHA-256 digest directly within the inspector's browser and cross-references the on-chain ledger:
  * **Identical Hash:** Renders a green *"Tamper-Proof Verified"* certificate.
  * **Hash Divergence:** Renders an immediate red *"Integrity Compromised"* alert.

---

Would you like to review the WatermelonDB synchronization schema definition for the mobile field app or see the FastAPI implementation of the `/sync/push` endpoint?





A unified notification architecture for your stack uses **local Supabase as the event hub and database** while **FastAPI acts as the compute and dispatch engine**, orchestrating delivery across Resend, Expo Push, and native device alarms.

---

### Real-Time Continuous Connection (Web & Mobile)

To provide continuous, real-time alert delivery without client-side polling or separate WebSocket servers, use Supabase's native PostgreSQL Write-Ahead Log (WAL) replication engine:

* **Vite React Web App (Active Surface):** The web dashboard initializes the Supabase JavaScript client and opens a persistent WebSocket connection via **Supabase Realtime**. It subscribes to database mutation events on the centralized `alerts` table. By filtering subscriptions on `mine_id` or user role, incoming database writes immediately trigger toast alerts and badge counter updates on screen in sub-500ms latency.


* **Expo Mobile App (Foreground Mode):** While open, the React Native app uses the same Supabase Realtime WebSocket subscription to render in-app notifications and refresh local WatermelonDB notification stores without latency.


* **Expo Mobile App (Background / Closed Mode):** When minimized or terminated, native OS background execution takes over via Firebase Cloud Messaging (FCM) and Apple Push Notification service (APNs), which are triggered by FastAPI.



---

### 1. Automated Report Emails via Resend

Statutory report delivery (e.g., DGMS Form 4-A or Annual Safety Returns) runs entirely through an asynchronous background worker:

* **Trigger Event:** A statutory report is approved by a Mine Manager or scheduled by a database cron job (`pg_cron`), mutating an instance status to approved.


* **Event Propagation:** A local Supabase Database Webhook fires an HTTP POST payload to FastAPI's internal webhook handler.


* **Document Compilation:** FastAPI's worker invokes the PDF generation engine (WeasyPrint or ReportLab) to compile the live statutory data, tables, and inspection signatures into a compliant PDF binary.


* **Storage & Presigning:** The generated PDF is saved directly into a private Supabase Storage bucket (`statutory-reports/`).


* **Async Dispatch (Resend):** FastAPI delegates the delivery to a `BackgroundTask`. The task passes the recipient address, dynamic HTML template, and PDF binary attachment directly to the Resend API. This guarantees your API endpoints never block while waiting for network handshakes.



---

### 2. Role-Differentiated Mobile Notifications

To ensure Field Officers, Safety Officers, and Mine Managers receive notifications specific to their operational scope, user targeting is decoupled at the database and backend level:

* **Push Token & Role Registry:** Upon login, the Expo application requests notification permissions, captures the hardware Expo Push Token, and writes it to a device registry table in local Supabase alongside the user's role (from the Supabase Auth JWT).


* **Role-Based Alert Generation:** When an event occurs (e.g., an inspection observation is flagged as a violation), FastAPI evaluates the role-access matrix:


* *Field Inspectors / Safety Officers:* Receive granular alerts detailing the exact hazard, geo-coordinates, and CAPA checklist assignment.


* *Mine Managers:* Receive consolidated compliance impact alerts, statutory deadline countdowns, and sign-off requests.


* *Corporate / Regulators:* Receive summary alerts only when tasks breach critical escalation SLAs.




* **Targeted Batching:** FastAPI queries the target user IDs, retrieves their corresponding active push tokens from the device table, and batches requests to the Expo Push Gateway, which routes them through Google FCM and Apple APNs.



---

### 3. Emergency Alert Siren (Hardware Alarm Takeover)

Emergency events (e.g., toxic gas spikes where $CH_4 > 1.5\%$ or catastrophic roof falls) require waking locked, silent devices and bypassing user mute settings:

* **Emergency Breach Detection:** Incoming sensor telemetry or an urgent field hazard report creates a high-priority entry in `alerts` where priority is marked as critical.


* **Silent / High-Priority Data Payload:** FastAPI dispatches a high-priority push directly to FCM/APNs containing **pure data only** (no notification display block). This bypasses the default operating system tray banner and forces the device OS to wake the app's native background handler immediately.


* **Hardware Execution with Notifee:** The React Native app (utilizing the Expo Bare workflow) processes the incoming payload via **Notifee**:


* *Android Implementation:* Notifee triggers a "Full-Screen Intent" notification attached to a high-importance notification channel configured with Do Not Disturb (DND) bypass and loops a loud, custom siren audio file bundled in the app package. The screen turns on and immediately surfaces a full-screen emergency takeover modal.


* *iOS Implementation:* Configured using Apple’s **Critical Alerts** entitlement, enabling the siren to play at maximum volume even if the physical mute switch is toggled on.




* **Mandatory Acknowledgment:** The alarm sound loops continuously until the officer physically acknowledges the alert via an interactive button on the screen, logging an audit trail back to Supabase.



---

### Notification Flow Summary

| Notification Type | Trigger Point | Transport Layer | Client Target & Execution |
| --- | --- | --- | --- |
| **Real-time Dashboard Toast**<br> | Data mutation in `alerts`<br> | Supabase Realtime (WebSockets)

 | Vite React dashboard auto-renders incoming slide-down notification toast.

 |
| **Statutory PDF Report**<br> | Report sign-off / `pg_cron` schedule

 | FastAPI `BackgroundTask` $\rightarrow$ Resend API

 | Transactional email delivered to corporate/regulator inboxes with PDF attachment.

 |
| **Standard Mobile Push**<br> | CAPA assigned / task due

 | FastAPI $\rightarrow$ Expo Push / FCM

 | Standard OS banner/badge; formatted specifically for the user's role.

 |
| **Emergency Siren Alarm**<br> | Hazard breach / gas leak

 | High-priority FCM Data Payload $\rightarrow$ Notifee

 | Bypasses silent mode/DND; sounds native siren and launches full-screen alert.

 |