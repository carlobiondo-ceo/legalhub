# AudienceServ Legal Hub — Phase 1 MVP Design

**Date:** 2026-04-07
**Author:** Carlo Biondo (Patrón)
**Status:** Approved

---

## Overview

Phase 1 MVP of the AudienceServ Legal Hub — an internal web platform to manage legal complaints, opt-in disputes, and case workflows. Replaces fragmented spreadsheets and manual email tracking with a structured case management system.

**Primary users:** Carlo (Admin) and Hue (Legal Expert).

---

## Architecture

### Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Docker container) |
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Authentication | Google OAuth via Passport.js (backend), session cookies (frontend) |
| File Storage | Local filesystem (Docker volume at `/uploads`) |
| Containerization | Docker Compose (3 services: `api`, `web`, `db`) |

### Project Structure

```
C:\Users\Carlo\Projects\Legal\
├── docker-compose.yml
├── .env.example
├── api/                          # Express backend
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts               # Seeds Carlo + Hue accounts
│   └── src/
│       ├── index.ts              # Express app entry
│       ├── config/
│       ├── middleware/           # Auth, error handling, CORS
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── cases.ts
│       │   ├── optInRequests.ts
│       │   └── documents.ts
│       ├── services/
│       └── utils/
├── web/                          # Next.js frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   └── src/
│       ├── app/
│       │   ├── layout.tsx        # Root layout with sidebar
│       │   ├── page.tsx          # Dashboard
│       │   ├── login/
│       │   ├── cases/
│       │   │   ├── page.tsx      # Case list
│       │   │   ├── new/
│       │   │   └── [id]/
│       │   │       └── page.tsx  # Case detail
│       │   └── opt-in/
│       │       ├── page.tsx
│       │       ├── new/
│       │       └── [id]/
│       ├── components/
│       ├── lib/                  # API client, utils
│       └── styles/
└── uploads/                      # Local file storage (Docker volume)
```

### Docker Compose Services

| Service | Image | Port |
|---|---|---|
| `db` | postgres:16-alpine | 5432 |
| `api` | Node 20 (custom Dockerfile) | 3001 |
| `web` | Node 20 (custom Dockerfile) | 3000 |

The `uploads/` directory is mounted as a Docker volume shared between the `api` container and the host for persistence.

---

## Data Model

### User

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String | |
| email | String | Unique, Google account email |
| role | Enum | `admin`, `legal` (MVP); `sales`, `readonly` later |
| avatarUrl | String? | From Google profile |
| createdAt | DateTime | |
| updatedAt | DateTime | |

Seeded accounts: Carlo (admin), Hue (legal).

### LegalCase

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| caseId | String | Auto-generated `LEGAL-YYYY-NNNN`, unique |
| title | String | |
| complainantEmail | String | |
| complainantName | String? | |
| complainantCountry | String? | |
| lawyerName | String? | |
| lawyerFirm | String? | |
| lawyerEmail | String? | |
| lawyerPhone | String? | |
| dateReceived | DateTime | |
| sourceEmailSubject | String? | Verbatim, no truncation |
| sourceGmailThreadId | String? | Gmail thread ID |
| source | Enum | `email_auto`, `email_manual`, `lawyer_letter`, `regulatory_body`, `galaxy_platform`, `other` |
| caseType | Enum | `spam_complaint`, `cease_and_desist`, `gdpr_request`, `data_erasure_request`, `litigation_threat`, `regulatory_inquiry`, `other` |
| jurisdiction | String? | |
| riskLevel | Enum? | `low`, `medium`, `high`, `critical` — derived from DD report (manual for MVP) |
| status | Enum | See Status Pipeline below |
| responseDeadline | DateTime? | |
| internalDeadline | DateTime? | |
| followUpDate | DateTime? | |
| assignedToId | FK → User | |
| escalatedToLawyer | Boolean | Default false |
| dateEscalated | DateTime? | |
| linkedOptInRequestId | FK → OptInRequest? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Case ID generation:** Sequential counter per year. On case creation, query the highest existing `NNNN` for the current year and increment. Format: `LEGAL-2026-0001`.

### OptInRequest

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| requestId | String | Auto-generated `OPT-YYYY-NNNN`, unique |
| emailAddress | String | |
| requestedById | FK → User | |
| dateRequested | DateTime | |
| reason | String? | |
| sixpgSubmitted | Boolean | Default false |
| sixpgSubmittedAt | DateTime? | |
| status | Enum | `pending`, `received`, `verified`, `issue_found`, `linked_to_case` |
| galaxyData | JSON? | Structured Galaxy fields |
| linkedCaseId | FK → LegalCase? | |
| notes | String? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### CaseDocument

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| caseId | FK → LegalCase? | |
| optInRequestId | FK → OptInRequest? | |
| section | Enum | `opt_in_proof`, `correspondence`, `internal_notes`, `sent_responses`, `due_diligence`, `other` |
| fileName | String | |
| filePath | String | Path on disk |
| fileSize | Int | Bytes |
| mimeType | String | |
| version | Int | Starts at 1, increments on re-upload |
| uploadedById | FK → User | |
| uploadedAt | DateTime | |

### ActivityLog

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| caseId | FK → LegalCase? | |
| optInRequestId | FK → OptInRequest? | |
| actorId | FK → User | |
| action | String | e.g., `status_changed`, `document_uploaded`, `case_created`, `field_updated` |
| details | JSON | e.g., `{ "from": "New", "to": "In Review" }` |
| createdAt | DateTime | |

---

## Status Pipeline

Legal cases move through these statuses:

| Status | Badge Color | Meaning |
|---|---|---|
| `new` | Blue | Just received, not yet assigned |
| `in_review` | Indigo | Being assessed internally |
| `opt_in_requested` | Yellow | Waiting for Bernhard's opt-in doc |
| `opt_in_received` | Amber | Document received, ready for review |
| `with_lawyer` | Purple | Escalated to Stolzenheim |
| `response_sent` | Teal | Reply dispatched |
| `awaiting_reply` | Orange | Ball in complainant's court |
| `resolved_no_action` | Green | Closed, no further action |
| `resolved_settlement` | Green | Closed with agreement |
| `escalated_urgent` | Red | Requires immediate attention |
| `delayed` | Gray | Blocked, no progress |
| `archived` | Light Gray | Filed away |

Every status change is logged in the ActivityLog with actor, timestamp, and from/to values.

---

## Screens

### 1. Login

- Full-page centered card with Audience Serv branding
- Single "Sign in with Google" button
- Redirects to Dashboard on success
- Unauthorized users see an error (only seeded accounts can log in)

### 2. Dashboard

- **KPI cards** (top row): Urgent, Open, In Progress, Resolved (this month), Delayed, Pending Opt-Ins
- **Deadline alert panel**: All cases with deadlines in the next 14 days, sorted by urgency. Color-coded: red (overdue), orange (due today), yellow (1-3 days), green (4-14 days)
- **Recent activity feed**: Last 20 actions across all cases (uploads, status changes, notes)

### 3. Legal Cases — List View

- Table with columns: Case ID, Title, Complainant Email, Status (badge), Risk Level (badge), Response Deadline, Assigned To
- Filters: Status (multi-select), Case Type (multi-select), Risk Level, Jurisdiction, Date Range
- Search: by complainant email, case ID, lawyer name, keyword
- "New Case" button top-right
- Click a row to open case detail

### 4. Legal Cases — Case Detail

- **Header**: Case ID + Title, status badge, risk badge, assigned user
- **Info section**: All identity and classification fields, editable inline
- **Deadlines section**: Response deadline, internal deadline, follow-up date. Auto-calculated deadline status (On Track / Due Soon / Overdue)
- **Document tabs**: Six tabs (Opt-In Proof, Correspondence, Internal Notes, Sent Responses, Due Diligence, Other). Each tab shows uploaded files with name, size, uploader, date. Drag-and-drop upload zone.
- **Activity timeline**: Chronological log of all actions on this case

### 5. Legal Cases — New Case Form

- Form with all case fields
- Case ID auto-generated on save
- Date Received defaults to now
- Status defaults to "New"
- Assigned To defaults to current user
- Save creates the case and redirects to the detail page

### 6. Opt-In Requests — List View

- Table: Request ID, Email Address, Requested By, Status (badge), Date Requested, Linked Case
- Filters: Status, Date Range
- "New Request" button

### 7. Opt-In Requests — Detail

- All fields editable
- Galaxy Data section (structured JSON form): Send Date, IP, Opt-In Method, Confirmation Email, List Source, Open/Click Events, Unsubscribe
- Document upload for opt-in proof
- Link to Legal Case (optional FK)
- Activity timeline

---

## UI Design System

Per the CLAUDE.md design tokens:

| Element | Value |
|---|---|
| Sidebar BG | `#1E1E2E` |
| Sidebar Text | `#E2E8F0` |
| Sidebar Active | `#FFFFFF` |
| Content BG | `#FFFFFF` |
| Page BG | `#F4F6F8` |
| Primary Action | `#22C55E` |
| Danger | `#EF4444` |
| Warning | `#F59E0B` |
| Info | `#3B82F6` |
| Text Primary | `#111827` |
| Text Muted | `#6B7280` |
| Border | `#E5E7EB` |
| Font | Inter (300-700) |
| Icons | Lucide React (no emoji as icons) |

Sidebar: fixed, ~240px, dark charcoal. Collapses to hamburger on mobile (<768px).
All clickable elements: `cursor-pointer` with smooth hover transitions.
shadcn/ui components throughout.

---

## API Endpoints (MVP)

### Auth
- `GET /api/auth/google` — Initiate Google OAuth
- `GET /api/auth/google/callback` — OAuth callback
- `GET /api/auth/me` — Get current user
- `POST /api/auth/logout` — End session

### Legal Cases
- `GET /api/cases` — List cases (with filters, search, pagination)
- `GET /api/cases/:id` — Get single case with documents and activity
- `POST /api/cases` — Create case
- `PATCH /api/cases/:id` — Update case fields
- `DELETE /api/cases/:id` — Delete case (admin only)

### Opt-In Requests
- `GET /api/opt-in-requests` — List requests (with filters, pagination)
- `GET /api/opt-in-requests/:id` — Get single request
- `POST /api/opt-in-requests` — Create request
- `PATCH /api/opt-in-requests/:id` — Update request
- `DELETE /api/opt-in-requests/:id` — Delete request (admin only)

### Documents
- `POST /api/documents/upload` — Upload file (multipart, with caseId/optInRequestId + section)
- `GET /api/documents/:id/download` — Download file
- `DELETE /api/documents/:id` — Delete document

### Dashboard
- `GET /api/dashboard/stats` — KPI card data
- `GET /api/dashboard/deadlines` — Upcoming deadlines
- `GET /api/dashboard/activity` — Recent activity feed

---

## Authentication Flow

1. User clicks "Sign in with Google" on the login page
2. Frontend redirects to `GET /api/auth/google`
3. Express (Passport.js) redirects to Google OAuth consent screen
4. Google redirects back to `/api/auth/google/callback`
5. Passport validates the Google profile, checks if the email exists in the User table
6. If found: creates a session (express-session with PostgreSQL session store), redirects to dashboard
7. If not found: returns unauthorized error
8. Frontend checks `GET /api/auth/me` on load to verify session; redirects to login if expired

Only seeded users (Carlo, Hue) can log in. No self-registration.

---

## What's Excluded from Phase 1

These features are deferred to later phases:

- Gmail webhook / email-to-case automation
- Gmail thread import + AI summaries
- Communication Center (Stolzenheim emails, SixPG portal)
- Due Diligence AI (outbound reports, inbound questionnaire fill, redline scanning)
- Dashboard charts (case volume bar chart, risk distribution donut)
- Historical Excel/CSV import
- Deadline notification emails
- PDF export
- Sales Rep and Read-Only roles
- Audit log (immutable)
- GDPR compliance tracker
- Case duplication detector
- Case merge
- Bulk opt-in import

---

## Deployment (MVP)

Local development only. `docker-compose up` starts all three services. Hot-reload enabled for both `api` and `web` containers in development mode.

VPS deployment will be addressed after MVP is validated.
