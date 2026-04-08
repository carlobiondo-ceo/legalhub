# CLAUDE.md — AudienceServ Legal Hub

## Project Overview

**Product Name:** AudienceServ Legal Hub
**Company:** Audience Serv GmbH — International Email Marketing
**Purpose:** A centralized internal web platform to manage all legal complaints, opt-in disputes, cease & desist cases, and due diligence workflows. The platform replaces fragmented spreadsheets and manual email tracking with a structured, AI-assisted case management system.

**Primary Users:**
- `Carlo (Patrón)` — Legal Director / Platform Owner
- `Hue` — Legal Expert / Case Handler (primary day-to-day user)
- `Sales Representatives` — Read-only access for due diligence approvals
- `Mr. Stolzenheim` — External Legal Counsel (receives preset-format case communications)

**External Contacts (not platform users):**
- `Bernhard` — External Opt-In Document owner; contacted via the SixPG abuse portal (https://abs.sixpg.de/public/newabuse)

---

## Core Architecture

### Two-Section Model

The platform is split into **two independent but linked modules**:

| Module | Purpose |
|---|---|
| **Legal Cases** | Formal complaints, lawyer letters, cease & desist, litigation threats, regulatory inquiries |
| **Opt-In Requests** | Internal requests to retrieve and verify opt-in proof for a specific email address |

Each module has its own list view, filters, status pipeline, and per-record detail page. Records in both modules can be linked (an opt-in request can be spawned from a legal case and linked back to it).

---

## Module 1 — Legal Cases

### Case Record Fields

Each legal case contains the following structured data:

**Identity**
- `Case ID` — Auto-generated (e.g., `LEGAL-2026-0042`)
- `Case Title` — Auto-populated from inbound email subject line, or manually entered
- `Complainant Email` — The email address at the center of the complaint (auto-populated from inbound email sender)
- `Complainant Name` — If known
- `Complainant Country` — For jurisdiction tracking
- `Complainant Lawyer / Law Firm` — Name, firm, email, phone
- `Date Received` — Auto-populated from inbound email timestamp, or manually entered
- `Source Email Subject` — Original subject line of the inbound email (stored verbatim)
- `Source Gmail Thread ID` — Link back to the original Gmail thread so the full email is always one click away
- `Source` — Where it came from: `Email (Auto-detected)`, `Email (Manual)`, `Lawyer Letter`, `Regulatory Body`, `Galaxy Platform`, `Other`

**Classification**
- `Case Type` — Dropdown: `Spam Complaint`, `Cease & Desist`, `GDPR Request`, `Data Erasure Request`, `Litigation Threat`, `Regulatory Inquiry`, `Other`
- `Source` — Where it came from: `Email`, `Lawyer Letter`, `Regulatory Body`, `Galaxy Platform`, `Other`
- `Jurisdiction` — Country/region of applicable law
- `Risk Level` — AUTO-CALCULATED from Due Diligence score: `🟢 Low`, `🟡 Medium`, `🟠 High`, `🔴 Critical`

**Status Pipeline**
- `Status` — One of:
  - `New` — Just received, not yet assigned
  - `In Review` — Being assessed internally
  - `Opt-In Requested` — Waiting for Bernhard's opt-in document
  - `Opt-In Received` — Document received, ready for review
  - `With Lawyer (Stolzenheim)` — Escalated to external counsel
  - `Response Sent` — Reply dispatched to complainant/lawyer
  - `Awaiting Reply` — Ball is in complainant's court
  - `Resolved – No Action` — Closed, no further action required
  - `Resolved – Settlement` — Closed with agreement
  - `Escalated – Urgent` — Requires immediate attention
  - `Delayed` — No progress, blocked
  - `Archived`

**Deadlines**
- `Response Deadline` — Hard deadline (legal/regulatory)
- `Internal Review Deadline` — Softer internal target
- `Follow-Up Date` — Next action reminder
- `Deadline Status` — Auto-flag: `On Track`, `Due Soon (< 3 days)`, `Overdue`

**Assignment**
- `Assigned To` — Internal owner
- `Escalated To Lawyer?` — Boolean toggle
- `Date Escalated` — When it was sent to Stolzenheim

---

### Per-Case Document Folder

Each case has a dedicated document folder with the following sections/tabs:

| Folder Section | Contents |
|---|---|
| **Opt-In Proof** | Opt-in document, screenshot, timestamp, IP address, click/open event export from Galaxy |
| **Correspondence** | Lawyer letters, cease & desist docs, regulatory notices |
| **Internal Notes** | Team comments, internal memos, Galaxy query results |
| **Sent Responses** | Copies of all responses sent to complainants or lawyers |
| **Due Diligence** | AI-generated due diligence report (see Module 3) |
| **Other** | Miscellaneous attachments |

All documents are versioned. Every upload records: uploader name, upload date/time, file name, and file size.

---

### Galaxy Integration Helper

A structured form within the case allows the team to paste or fill in data retrieved from Galaxy (the internal email platform). Fields include:

- Send Date
- IP Address at sign-up
- Opt-In Method (double opt-in / single opt-in)
- Confirmation Email Sent? (Y/N)
- List Source / Partner
- Open Events (list with timestamps)
- Click Events (list with timestamps)
- Unsubscribe Event (if any)

This data auto-populates the opt-in section of the due diligence report.

---

### Communication Center (per case)

Two preset communication actions are available on every case page:

**1. Contact Mr. Stolzenheim (External Lawyer)**

Clicking this opens a pre-filled email draft with:
- Subject line: `[LEGAL-XXXX] – Case Referral: [Complainant Email] – [Case Type]`
- Body template pre-populated with case ID, complainant details, case type, summary of issue, documents attached, and urgency flag
- Attachments auto-suggested from the case folder
- Sends via Gmail integration; copy is logged in the case timeline

**2. Request Opt-In Document (SixPG Portal)**

Bernhard is not a platform user. Opt-in requests are submitted externally via the SixPG abuse portal at `https://abs.sixpg.de/public/newabuse`.

Clicking this button gives the user two options:

- **Auto-Submit (preferred):** The platform auto-fills and submits the SixPG portal form using the complainant email address and case details from the current record. A confirmation of the submission is logged in the case timeline.
- **Open Pre-filled Form:** Opens the SixPG portal in a new tab with the complainant email pre-populated in the URL query string (e.g., `?email=complainant@example.com&caseId=LEGAL-2026-0042`) so the user can review and submit manually.

In both cases:
- Case status auto-updates to `Opt-In Requested` when the request is submitted
- Once the opt-in document is uploaded to the case folder, status updates to `Opt-In Received`
- The request submission (method, timestamp, submitted by) is logged in the case activity timeline

Both communication actions are logged in the case's activity timeline with timestamp and sender.

---

### Gmail Thread Import & AI Summary

Each case has a **Communications tab** that pulls all Gmail threads related to the complainant's email address (or the lawyer's email) directly from the Gmail API.

- Threads are displayed chronologically with sender, date, and subject
- An **"AI Summarize Thread"** button generates a structured summary:
  - Key claims made by the complainant or their lawyer
  - Key responses made by Audience Serv
  - Outstanding demands or open questions
  - Recommended next step
- Summaries are saved to the case and can be regenerated
- New emails auto-sync on case open (or via a manual refresh button)
- Full thread is always available beneath the summary for review

This is particularly useful for high-volume cases (e.g., `kimblaesing@gmx.de`) where multiple threads exist across weeks or months.

---

### Case Creation — Three Paths

Legal cases can be created in three ways. All three result in the same fully editable case record.

| Path | Trigger | Who |
|---|---|---|
| **Auto (Email)** | Gmail webhook detects incoming email on monitored label | System — no action needed |
| **From Gmail** | "Create Case from this Email" button on any Gmail thread | Hue |
| **Manual** | "＋ New Case" button in the platform, fills all fields by hand | Hue or Carlo |

The **manual path** is fully independent of email. It covers cases that arrive via lawyer letter (physical post), phone call, regulatory portal, internal sales flag, or any other channel. The form pre-fills only the Case ID and Date; all other fields are entered manually. This is a first-class feature, not a fallback.

---

### Email-to-Case Automation

The platform also monitors a dedicated Gmail label (e.g., `Legal/Incoming`) or inbox and **automatically creates a draft case** when a new complaint email arrives.

**How it works:**

1. An email arrives at the monitored address (e.g., `legal@audienceserv.com` or a Gmail label applied manually/via filter)
2. The platform's Gmail webhook detects the new message within seconds
3. A draft Legal Case is auto-created with:
   - `Case Title` ← email subject line
   - `Complainant Email` ← sender address
   - `Date Received` ← email timestamp
   - `Source Email Subject` ← original subject (stored verbatim)
   - `Source Gmail Thread ID` ← links back to the full thread
   - `Status` ← `New`
   - `Source` ← `Email (Auto-detected)`
4. The original email is attached to the **Correspondence** folder tab of the case automatically
5. Hue receives an in-platform notification (and optional email alert) to review and complete the case fields (jurisdiction, case type, assignment, deadlines)
6. Hue reviews the auto-draft, fills in the missing fields, and changes status to `In Review` to activate the case

**Key benefit:** No manual data entry for the most common case creation flow. The email itself becomes the case record. Hue only needs to classify and assign — the rest is pre-populated.

**Fallback — manual case creation:** If an email arrives outside the monitored label, Hue can open any Gmail thread and click **"Create Case from this Email"** — a button injected into Gmail via a browser extension or bookmarklet that calls the platform API and creates the case from the thread directly.

---

### Case Activity Timeline

Every case has a chronological activity log that records:
- Document uploads (who, what, when)
- Status changes (from → to, who changed it, when)
- Emails sent via Communication Center
- Gmail threads imported
- Due diligence reports generated or updated
- Comments and notes added by team members
- Deadline changes

---

## Module 2 — Opt-In Requests

This module tracks standalone opt-in verification requests that are not (yet) tied to a formal legal case. These are typically internal checks triggered by sales, account managers, or legal when a complaint is anticipated but not yet received.

### Opt-In Request Record Fields

- `Request ID` — Auto-generated (e.g., `OPT-2026-0018`)
- `Email Address` — The email being checked
- `Requested By` — Internal team member
- `Date Requested`
- `Reason` — Free text (e.g., "Pre-empt potential GDPR complaint", "Sales team flag")
- `SixPG Request Submitted?` — Boolean; toggled automatically when the opt-in request is sent via the SixPG portal
- `SixPG Submission Timestamp` — Date/time the portal request was submitted
- `Status`:
  - `Pending` — Request sent, awaiting response
  - `Received` — Opt-in document returned
  - `Verified` — Opt-in confirmed valid
  - `Issue Found` — Problem with opt-in (gap in proof, missing record)
  - `Linked to Case` — Escalated into a formal Legal Case
- `Galaxy Data` — Same structured fields as in Module 1
- `Opt-In Document` — Upload field
- `Notes`
- `Link to Legal Case` — Optional FK to a Legal Case record

---

## Module 3 — Due Diligence

### Overview

The Due Diligence module is the AI-powered core of the platform. It supports two distinct DD workflows:

1. **Outbound DD** — Audience Serv proactively generates a due diligence report based on case data (Galaxy opt-in, Gmail threads, documents). The AI agent, trained on Audience Serv's historical DD library, drafts the full report.
2. **Inbound DD** — A client or partner sends a DD questionnaire or document (PDF, DOCX, etc.). The AI agent reads the uploaded document, fills in the answers based on case data and the company knowledge base, and generates a completed response document ready for review and sending.

Both workflows feed into the same approval pipeline and risk scoring framework.

---

### Inbound DD — Client Questionnaire Mode

**Trigger:** A client or legal counterpart sends a due diligence questionnaire (commonly a PDF or Word document with questions, checkboxes, or fill-in fields).

**Workflow:**

1. User uploads the client's DD questionnaire to the case folder (under the "Due Diligence" tab)
2. The AI Agent parses the document and extracts all questions, fields, and checkboxes
3. The Agent cross-references:
   - The case's Galaxy opt-in data
   - Uploaded opt-in documents and correspondence
   - The Gmail thread summary
   - The company knowledge base (trained on Audience Serv's historical DD answers)
4. The Agent generates a **Filled Response Document** — same structure as the client's original document, with Audience Serv's answers inserted
5. The filled document is presented side-by-side with the original for review
6. Legal Expert and Carlo review, edit inline, and approve
7. Final approved version is exported as PDF or DOCX for sending to the client
8. The original + response are versioned and saved to the case folder

**Supported Input Formats:** PDF, DOCX, XLSX (questionnaire tables)
**Output Format:** DOCX (editable) + PDF (final send)

---

### Redlines — Automatic Dangerous Clause Detection

Every inbound client document (DD questionnaire, contract draft, settlement proposal, or any uploaded correspondence) is automatically scanned by the AI agent for **red flag clauses** — terms that would be unacceptable or high-risk for Audience Serv.

#### How Redlines Work

When a document is uploaded to any case folder section, the system offers a **"Scan for Redlines"** button. The AI agent reviews the full document and flags problematic language with colour-coded highlights directly in the document viewer:

| Colour | Severity | Meaning |
|---|---|---|
| 🔴 Red | Critical | Clause is a dealbreaker — must be rejected or renegotiated before any agreement |
| 🟠 Orange | High | Clause creates significant exposure — needs senior review and likely revision |
| 🟡 Yellow | Medium | Clause is suboptimal — flag for negotiation but not a blocker |
| 🟢 Green | Acceptable | Standard clause, no action needed |

Each flagged clause includes:
- **What it says** — quoted excerpt from the document
- **Why it's flagged** — plain-language explanation of the risk
- **Risk Score** — Severity × Likelihood score using the standard risk matrix
- **Suggested counter-language** — AI-drafted alternative wording that protects Audience Serv
- **Recommended action** — Accept / Negotiate / Reject / Escalate to Stolzenheim

#### Pre-Configured Redline Triggers (Hard Rules)

The following clause types are always flagged 🔴 Critical and cannot be overridden without Carlo's explicit approval:

| Trigger | Example | Risk |
|---|---|---|
| Fixed fee per legal case / complaint | "Audience Serv shall pay a flat fee of €X per complaint received" | Unlimited, uncontrollable cost exposure proportional to complaint volume |
| Unlimited / uncapped liability | "Liability shall not be limited in any way" | Catastrophic financial exposure |
| Blanket admission of wrongdoing | "Audience Serv acknowledges that all complaints are valid" | Legal and reputational devastation |
| Automatic renewal with no exit clause | "This agreement auto-renews indefinitely" | Indefinite lock-in |
| Jurisdiction in an unfavourable court | "All disputes shall be governed by [adversarial jurisdiction]" | Extremely disadvantageous legal forum |
| Retroactive claims | "Claims may be made for events occurring prior to this agreement" | Exposure to historical liability |
| Unilateral amendment rights for the other party | "The complainant may amend these terms at any time" | Loss of contractual certainty |
| Personal liability for officers/directors | "Carlo Biondo shall be personally liable…" | Personal legal and financial risk |
| Joint and several liability | "Audience Serv is jointly liable for partner actions" | Liability for third-party conduct |
| Data processing without DPA | "Data may be shared freely with third parties" | GDPR violation risk |

#### Redline Review Panel

After scanning, the platform shows:
- Total flags by severity (🔴 X · 🟠 X · 🟡 X)
- Flagged clauses listed in order of severity
- Each clause with: location in doc, excerpt, risk explanation, suggested counter-language
- Action buttons: **Accept as-is** / **Insert counter-language** / **Mark for negotiation** / **Escalate to Stolzenheim**
- One-click **"Generate Redline Response Letter"** — AI drafts a formal reply to the client identifying rejected / negotiated clauses in legal language, ready for Stolzenheim review

All redline actions are logged in the case activity timeline.

---

### Outbound DD Workflow

1. A team member initiates a Due Diligence from within a Legal Case or Opt-In Request
2. The AI Agent reads all available case data: Galaxy opt-in fields, uploaded documents, Gmail thread summary, case type, jurisdiction
3. The Agent generates a structured Due Diligence Report (see format below)
4. The report is saved to the case folder under the "Due Diligence" tab
5. The report is flagged for review by: Legal Expert → Carlo (Patrón) → Sales Representative (if relevant)
6. Reviewers can comment inline, approve, or request revision
7. Final approved report is locked and versioned

### Due Diligence Report Format

```
## Due Diligence Report

Case ID: [AUTO]
Date: [AUTO]
Generated By: AI Agent v[X]
Reviewed By: [NAME]
Approved By: [NAME]
Status: Draft / Under Review / Approved / Rejected

---

### 1. Case Summary
[Auto-filled from case fields + Gmail summary]

### 2. Opt-In Verification
- Opt-In Method: [Double / Single / Unknown]
- Timestamp: [Date/Time]
- IP Address: [IP]
- Confirmation Email: [Yes / No / Not Available]
- List Source: [Partner name]
- Open/Click History: [Summary]
- Assessment: [VALID / QUESTIONABLE / INVALID / INSUFFICIENT EVIDENCE]

### 3. Legal Risk Assessment

#### Severity: [1–5] — [Label]
[Rationale]

#### Likelihood: [1–5] — [Label]
[Rationale]

#### Risk Score: [Score] — [🟢 LOW / 🟡 MEDIUM / 🟠 HIGH / 🔴 CRITICAL]

| Risk Factor | Severity | Likelihood | Score | Level |
|---|---|---|---|---|
| Opt-in validity gap | X | X | X | COLOR |
| Regulatory jurisdiction risk | X | X | X | COLOR |
| Volume of prior complaints | X | X | X | COLOR |
| Legal counsel involvement | X | X | X | COLOR |

#### Overall Risk Level: [COLOR]

### 4. Contributing Risk Factors
[Bullet list of factors increasing risk]

### 5. Mitigating Factors
[Bullet list of factors decreasing risk]

### 6. Recommended Actions
| Action | Owner | Deadline | Priority |
|---|---|---|---|
| [Action] | [Name] | [Date] | High / Med / Low |

### 7. Escalation Recommendation
[ ] No escalation required
[ ] Brief senior counsel (Stolzenheim)
[ ] Immediate outside counsel engagement
[ ] Board/executive notification

### 8. Residual Risk After Mitigation
[Expected risk level if recommended actions are taken]

### 9. Notes for Sales Representative
[Plain language summary for non-legal reviewers — is this case safe to continue sending? What is the exposure?]
```

### Due Diligence Approval Flow

| Step | Actor | Action |
|---|---|---|
| 1 | AI Agent | Generates report draft |
| 2 | Legal Expert | Reviews, edits, annotates |
| 3 | Carlo (Patrón) | Final legal approval |
| 4 | Sales Rep | Reads summary, confirms commercial awareness |
| 5 | System | Locks report, stores versioned copy |

---

## Module 4 — Dashboard

The dashboard is the first screen users see on login. It provides a real-time overview of all active legal matters.

### KPI Cards (top of dashboard)

| Card | Metric |
|---|---|
| 🔴 Urgent | Cases with `Escalated – Urgent` status or overdue deadlines |
| 🟠 Open | All active cases not yet resolved |
| 🟡 In Progress | Cases in `In Review`, `Opt-In Requested`, `With Lawyer` |
| 🟢 Resolved | Cases closed this month / all time (toggle) |
| ⏰ Delayed | Cases with no activity in > 7 days |
| ⚖️ With Lawyer | Cases currently with Stolzenheim |
| 📋 Pending Opt-Ins | Open opt-in requests awaiting Bernhard |
| 🔍 Due Diligences Pending Approval | Reports awaiting review/approval |

### Deadline Alert Panel

A scrollable panel showing all cases with deadlines in the next 14 days, sorted by urgency:
- Overdue (red)
- Due today (orange)
- Due in 1–3 days (yellow)
- Due in 4–14 days (green)

### Case Volume Chart

A bar or line chart showing:
- Cases opened per month (last 12 months)
- Cases resolved per month
- Cases escalated to lawyer per month

### Risk Distribution Chart

A donut chart showing the current distribution of open cases by Risk Level (🔴🟠🟡🟢).

### Recent Activity Feed

A live feed of the last 20 platform actions across all cases (uploads, status changes, emails sent, reports generated).

---

## Module 5 — Search & Filters

Global search across all records:
- By complainant email
- By case ID
- By lawyer name or law firm
- By keyword in notes or documents

Advanced filters on list views:
- Status (multi-select)
- Case type (multi-select)
- Assigned to
- Deadline range
- Risk level
- Country/jurisdiction
- Date created range

---

## Tech Stack Recommendation

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes (or Express if preferred) |
| Database | PostgreSQL via Prisma ORM |
| File Storage | AWS S3 (or local storage for MVP) |
| Authentication | NextAuth.js with Google OAuth (so team logs in with their Google Workspace accounts) |
| Gmail Integration | Gmail API via Google OAuth — read threads, search by email address |
| Email Sending | Gmail API (send as the authenticated user) |
| AI / LLM | Anthropic Claude API (claude-sonnet-4-6) — for Gmail thread summaries, due diligence generation |
| Hosting | Vercel (frontend + API) or a private VPS |
| Search | PostgreSQL full-text search (or Meilisearch for scale) |

---

## Data Model (Simplified)

```
User
  id, name, email, role (admin | legal | sales | readonly)

LegalCase
  id, caseId (LEGAL-YYYY-NNNN), title, complainantEmail, complainantName
  complainantCountry, lawyerName, lawyerFirm, lawyerEmail
  caseType, source, jurisdiction, status, riskLevel
  responseDeadline, internalDeadline, followUpDate
  assignedToId (FK → User), escalatedToLawyer, dateEscalated
  linkedOptInRequestId (FK → OptInRequest, nullable)
  createdAt, updatedAt

OptInRequest
  id, requestId (OPT-YYYY-NNNN), emailAddress, requestedById (FK → User)
  reason, status, sixpgSubmitted (boolean), sixpgSubmittedAt (timestamp)
  galaxyData (JSON), linkedCaseId (FK → LegalCase, nullable)
  createdAt, updatedAt

CaseDocument
  id, caseId (FK), optInRequestId (FK, nullable), section (enum)
  fileName, fileUrl, fileSize, uploadedById (FK), uploadedAt, version

GmailThread
  id, caseId (FK), gmailThreadId, subject, participants
  lastMessageAt, aiSummary, aiSummaryGeneratedAt

DueDiligence
  id, caseId (FK), optInRequestId (FK, nullable)
  status (draft | under_review | approved | rejected)
  reportJson (full structured report), riskScore, riskLevel
  generatedAt, reviewedById, approvedById, approvedAt, version

ActivityLog
  id, caseId (FK), actorId (FK → User), action, details (JSON)
  createdAt

CommunicationLog
  id, caseId (FK), type (stolzenheim | bernhard | other)
  subject, body, sentById, sentAt, gmailMessageId
```

---

## User Roles & Permissions

| Feature | Admin (Carlo) | Hue (Legal Expert) | Sales Rep | Read-Only |
|---|---|---|---|---|
| View all cases | ✅ | ✅ | ✅ | ✅ |
| Create / edit cases | ✅ | ✅ | ❌ | ❌ |
| Upload documents | ✅ | ✅ | ❌ | ❌ |
| Contact Stolzenheim | ✅ | ✅ | ❌ | ❌ |
| Request opt-in (Bernhard) | ✅ | ✅ | ❌ | ❌ |
| Generate due diligence | ✅ | ✅ | ❌ | ❌ |
| Approve due diligence | ✅ | ✅ | ❌ | ❌ |
| View due diligence summary | ✅ | ✅ | ✅ | ✅ |
| View dashboard | ✅ | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Delete records | ✅ | ❌ | ❌ | ❌ |

---

## Additional Platform Features (Recommended)

Beyond the core requirements, the following features are recommended:

**1. Deadline Notification System**
Automated email/Slack reminders to the assigned user when a deadline is approaching (3 days before, 1 day before, on the day). Configurable per case.

**2. Case Duplication Detector**
Before a new case is created, the system checks if the complainant email already exists in the system and warns the user. Prevents duplicate tracking.

**3. Bulk Opt-In Import**
A CSV import tool so the team can upload a batch of opt-in records from Galaxy in one step rather than entering them one by one.

**3b. Historical Case Import from Excel**
All existing legal cases live in Excel. A one-time (and repeatable) import tool allows the team to upload the historical Excel file and map columns to case fields. The importer:
- Previews the mapping before committing (so Hue can verify columns match)
- Skips duplicate records (matched by complainant email + date received)
- Flags rows with missing required fields for manual review
- Imports all historical cases as `Archived` status by default, with a bulk-edit option to change status if needed
- Supported formats: `.xlsx`, `.xls`, `.csv`

**4. Export to PDF**
Each case detail page and due diligence report can be exported to a formatted PDF (for sending to external lawyers or regulators).

**5. Case Merge**
If duplicate cases are found, they can be merged into a single master record with all documents and timeline preserved.

**6. Partner/List Source Registry**
A reference table of all known email list sources/partners with their standard opt-in method, so the Galaxy data section can auto-suggest the opt-in type based on the list source.

**7. Statistical Reports**
Monthly export-ready reports showing: total cases by type, resolution rate, average time to close, cases by jurisdiction, cases by risk level, lawyer escalation rate.

**8. Case Notes with @Mentions**
Team members can leave notes on a case and @mention a colleague to alert them. Notifications sent via email.

**9. Audit Log (Immutable)**
A separate, tamper-proof audit trail of every database write, update, and deletion — for regulatory compliance and internal accountability.

**10. GDPR Compliance Tracker**
For cases involving GDPR data erasure or access requests, a dedicated sub-section tracks the 30-day response deadline, what data was found, what was erased, and when the response was sent.

---

## Development Phases

> **Note on timeline:** This platform is built with Claude Code using Next.js 14, shadcn/ui blocks, and Prisma — all high-velocity tools where Claude Code handles the bulk of implementation. Estimated real-world timeline is **1–2 weeks** for full functionality, not months. The phases below are logical build order, not calendar weeks.

### Phase 1 — MVP (Days 1–2)
- Two-module data model (Legal Cases + Opt-In Requests)
- Case CRUD (create, read, update, delete)
- Document upload (S3)
- Status pipeline with overdue flagging
- Basic dashboard KPI cards
- Google OAuth login
- Historical case import from Excel (`.xlsx` / `.csv`)

### Phase 2 — Email & Communications (Days 3–4)
- Gmail webhook: auto-create case from inbound email
- Email-to-case field mapping (subject → title, sender → complainant email, timestamp → date received, thread ID stored)
- Gmail thread import + AI summary per case
- Preset email drafts: Stolzenheim referral + SixPG portal submission
- Humanizer layer on all AI-generated email drafts
- Communication log per case

### Phase 3 — Due Diligence AI (Days 5–7)
- Galaxy data form per case
- Outbound DD report generation via Claude API
- Inbound DD: client questionnaire upload + AI answer-fill
- Filled response document export (DOCX + PDF)
- Redline scanner: automatic dangerous clause detection
- Pre-configured hard redline rules (`config/redline-rules.ts`)
- Redline review panel + counter-language suggestions
- Redline response letter generation
- DD approval workflow (Hue → Carlo → Sales)
- Risk scoring and level assignment

### Phase 4 — Polish (Days 8–10)
- Full dashboard with Recharts (volume chart, risk distribution donut, deadline panel, activity feed)
- Advanced search and filters
- Deadline reminder notifications (email)
- PDF export per case
- Statistical reports
- Bulk opt-in import from Galaxy CSV
- Immutable audit log

---

## Key People Reference

| Person | Role | Communication Method |
|---|---|---|
| Mr. Stolzenheim | External Legal Counsel | Preset email via Gmail (see Communication Center) |
| Bernhard | External Opt-In Owner | SixPG abuse portal — https://abs.sixpg.de/public/newabuse (auto-submit or manual; NOT a platform user) |
| Carlo (Patrón) | Legal Director | Platform Admin; approves due diligences |
| Hue | Legal Expert / Case Handler | Primary day-to-day platform user |
| Sales Representatives | Commercial Team | Read-only; reviews due diligence summaries for approval |

---

## UI/UX Design System

The platform must match Audience Serv's existing internal tool aesthetic, as seen in the `frontend-guideline.png` reference screenshot. The design follows a **dark sidebar + white content** SaaS dashboard pattern — clean, data-forward, and minimal.

### Layout Pattern

- **Left sidebar**: Fixed, ~240px wide, dark charcoal background, white navigation labels, collapsible on mobile
- **Top bar**: Thin, white/light, company name or breadcrumb on the left, user avatar + actions on the right
- **Main content area**: White background, generous padding, section title at top (`Dashboard`, `Legal Cases`, etc.)
- **No decorative elements**: No gradients, no shadows on content cards, no heavy borders — flat and clean

### Design Tokens

| Role | Value | Usage |
|---|---|---|
| Sidebar Background | `#1E1E2E` | Left navigation panel |
| Sidebar Text | `#E2E8F0` | Nav labels (inactive) |
| Sidebar Active | `#FFFFFF` | Active nav item |
| Sidebar Hover | `#2D2D42` | Nav item hover state |
| Content Background | `#FFFFFF` | Main area background |
| Page Background | `#F4F6F8` | Body / outer wrapper |
| Primary Action | `#22C55E` | Primary buttons, active states, chart accent |
| Danger / Urgent | `#EF4444` | Urgent flags, overdue deadlines |
| Warning | `#F59E0B` | Due soon, medium risk |
| Info / Blue | `#3B82F6` | In progress, informational |
| Text Primary | `#111827` | Headings, main body |
| Text Muted | `#6B7280` | Labels, subtitles, secondary info |
| Border | `#E5E7EB` | Card borders, table dividers |
| Card Background | `#FFFFFF` | Stat cards, panels |

### Typography

| Role | Font | Weight |
|---|---|---|
| All UI text | Inter | 300, 400, 500, 600, 700 |

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body { font-family: 'Inter', sans-serif; }
```

Mood: clean, modern, data-forward, internal SaaS tool. No serif fonts. No decorative typography.

### Component & Interaction Rules

- Use `shadcn/ui` blocks as scaffolding — start with `npx shadcn@latest add dashboard-01` and build from there. Never build dashboards or login pages from scratch.
- All clickable elements must have `cursor-pointer`
- Hover states: smooth `transition-colors duration-200` — no layout-shifting scale transforms
- Loading states: skeleton screens or spinner for any operation > 300ms; disable buttons during async calls
- Form submissions: always show loading → success/error state — never leave the UI frozen
- Status badges (case pipeline): use colour-coded `Badge` components, not emoji
- Navigation: fixed dark sidebar with `padding-left` compensation on content; breadcrumbs for case detail depth (e.g., `Cases > LEGAL-2026-0042`)
- Browser back button must work predictably across all case/module navigation
- No emoji used as icons anywhere — use Lucide or Heroicons SVG icons exclusively
- Text contrast minimum 4.5:1 in light mode content area; sidebar text minimum 4.5:1 on dark background
- Fully responsive at 375px / 768px / 1024px / 1440px — sidebar collapses to hamburger on mobile
- Respect `prefers-reduced-motion` for all animations
- All form inputs must have associated `<label>` elements
- Focus states must be visible for keyboard navigation (WCAG AA)
- Charts: use Recharts (already in the tech stack); match the multi-series area/line chart style seen in the reference — green primary series, muted secondary series, clean gridlines

### Pre-Delivery Checklist (enforce on every PR)

- [ ] Sidebar is dark charcoal (`#1E1E2E`), content area is white — no inversions
- [ ] No emojis used as icons — Lucide or Heroicons only
- [ ] `cursor-pointer` on every clickable / interactive element
- [ ] Hover states provide visual feedback with smooth transitions (150–300ms)
- [ ] Loading → success/error feedback on every form and async action
- [ ] Content area text contrast ≥ 4.5:1
- [ ] Sidebar text contrast ≥ 4.5:1 on dark background
- [ ] Borders visible (`border-gray-200` minimum in content; none needed in sidebar)
- [ ] No content hidden behind fixed sidebar
- [ ] Responsive: sidebar collapses at < 768px
- [ ] No horizontal scroll on mobile
- [ ] Focus states visible for keyboard navigation

---

## Email Drafting — Humanizer Requirement

All emails generated by the platform (preset draft for Stolzenheim, opt-in request communication, due diligence cover notes, redline response letters) **must pass through the Humanizer layer** before being presented to Hue for review.

### Why

AI-generated email drafts sound templated and robotic. Hue sends these to lawyers, external partners, and regulatory bodies. They must read as written by a real legal professional — natural, direct, and authoritative.

### Implementation

In `lib/ai.ts`, the email generation pipeline must run in two steps:

```
Step 1 — Draft: Claude generates the structured email content using case data
Step 2 — Humanize: A second Claude call applies the Humanizer prompt to the draft output
```

The Humanizer pass must:
- Remove AI vocabulary words (pivotal, underscore, highlight, ensure, foster, leverage, etc.)
- Replace em dashes with commas or restructured sentences
- Eliminate rule-of-three structures and negative parallelisms ("It is not just X, it is Y")
- Remove sycophantic openers ("Certainly!", "Of course!", "I hope this helps")
- Replace vague attributions ("experts suggest") with specific case references
- Use direct sentence construction — prefer "is / are / has" over elaborate copula substitutes
- Vary sentence length naturally — avoid uniform mid-length sentences
- Remove bolded headers inside email body text
- Ensure the tone is formal but human: direct, confident, not corporate-speak

### Email Types Subject to Humanizer

| Email Type | Trigger | Recipient |
|---|---|---|
| Case Referral to Stolzenheim | "Contact Stolzenheim" button | Mr. Stolzenheim (external lawyer) |
| Opt-In Portal Notification | SixPG submission confirmation log | Internal timeline note |
| Due Diligence Cover Note | DD report approval and send | Client / Partner |
| Redline Response Letter | "Generate Redline Response Letter" | Client / Partner |
| Gmail Thread Reply Draft | AI-suggested reply from thread summary | Complainant / Lawyer |

All generated drafts are presented in the platform's email editor for Hue to review, edit, and approve before sending. The Humanizer output is never sent automatically.

---

## Notes for Claude Code Session

- Use `shadcn/ui` for all UI components for consistency and speed
- Use `Prisma` with PostgreSQL; migrations should be committed
- All AI calls (Gmail summaries, due diligence generation) go through a single `lib/ai.ts` service layer — never call the Anthropic API directly from components
- Gmail API scope required: `gmail.readonly` (for reading threads) and `gmail.send` (for sending via Communication Center)
- For the SixPG opt-in portal integration (`https://abs.sixpg.de/public/newabuse`): inspect the form fields on that page and implement a server-side POST to auto-submit from the platform. If the form uses CSRF tokens or requires a browser session, fall back to opening the URL with query params pre-filled in a new tab. Bernhard is NOT a platform user and must never appear in the User table or role assignments.
- For email-to-case automation: use the Gmail API `watch()` method with a Pub/Sub topic to receive push notifications when new emails arrive on the monitored label. On receipt, parse the message (sender, subject, timestamp, threadId) and call `POST /api/cases` to auto-create a draft case. Store `gmailThreadId` on the case record so the full thread is always retrievable.
- For historical Excel import: use `xlsx` (SheetJS) on the server to parse uploaded `.xlsx`/`.csv` files. Present a column-mapping UI before insert. Use `prisma.legalCase.createMany()` with `skipDuplicates: true`. All imported historical records default to `status: "Archived"`.
- The `Source Email Subject` field is plain text — store verbatim, do not truncate. The `Source Gmail Thread ID` field stores the Gmail `threadId` string and is used to open the thread directly via `https://mail.google.com/mail/u/0/#all/{threadId}`.
- Environment variables needed: `ANTHROPIC_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`
- The due diligence AI agent will be trained separately by Carlo on historical documents — the platform should expose an endpoint to inject a system prompt / knowledge base per the agent's design
- For inbound DD (client questionnaire parsing), use Claude's document reading capability via the Anthropic API — pass the uploaded PDF/DOCX as base64 content in the API call alongside the case data context
- For redline scanning, implement a dedicated `lib/redlines.ts` service that: (a) extracts text from uploaded documents, (b) runs the AI redline detection prompt, (c) returns structured JSON with flagged clauses, severity, and suggested counter-language
- Hard redline rules (the pre-configured triggers) should be stored in a config file (`config/redline-rules.ts`) so Carlo can add/remove triggers without a code deploy
- Document parsing dependencies: `pdf-parse` for PDF extraction, `mammoth` for DOCX extraction
- All deadline dates should be stored in UTC; display in user's local timezone
- Risk level on a case is always derived from the most recent approved due diligence report — it is never manually set

---

*Document version: 1.5 — April 2026*
*Author: Carlo Biondo (Patrón) — Audience Serv*
*For internal use and handoff to development team.*
