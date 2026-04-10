export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "legal" | "sales" | "readonly";
  avatarUrl: string | null;
}

export type CaseStatus =
  | "new" | "in_review" | "opt_in_requested" | "opt_in_received"
  | "with_lawyer" | "response_sent" | "awaiting_reply"
  | "resolved_no_action" | "resolved_settlement"
  | "escalated_urgent" | "delayed" | "archived";

export type CaseType =
  | "spam_complaint" | "cease_and_desist" | "gdpr_request"
  | "data_erasure_request" | "litigation_threat" | "regulatory_inquiry" | "other";

export type CaseSource =
  | "email_auto" | "email_manual" | "lawyer_letter"
  | "regulatory_body" | "galaxy_platform" | "other";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type OptInStatus = "pending" | "received" | "verified" | "issue_found" | "linked_to_case";

export type DocumentSection =
  | "opt_in_proof" | "correspondence" | "internal_notes"
  | "sent_responses" | "due_diligence" | "other";

export interface LegalCase {
  id: string;
  caseId: string;
  title: string;
  complainantEmail: string;
  complainantName: string | null;
  complainantCountry: string | null;
  lawyerName: string | null;
  lawyerFirm: string | null;
  lawyerEmail: string | null;
  lawyerPhone: string | null;
  dateReceived: string;
  sourceEmailSubject: string | null;
  sourceGmailThreadId: string | null;
  source: CaseSource;
  caseType: CaseType;
  jurisdiction: string | null;
  riskLevel: RiskLevel | null;
  status: CaseStatus;
  responseDeadline: string | null;
  internalDeadline: string | null;
  followUpDate: string | null;
  assignedToId: string | null;
  assignedTo: Pick<User, "id" | "name" | "avatarUrl"> | null;
  escalatedToLawyer: boolean;
  dateEscalated: string | null;
  linkedOptInRequestId: string | null;
  documents?: CaseDocument[];
  activityLogs?: ActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface OptInRequest {
  id: string;
  requestId: string;
  emailAddress: string;
  requestedById: string;
  requestedBy: Pick<User, "id" | "name" | "avatarUrl">;
  dateRequested: string;
  reason: string | null;
  sixpgSubmitted: boolean;
  sixpgSubmittedAt: string | null;
  status: OptInStatus;
  galaxyData: Record<string, unknown> | null;
  notes: string | null;
  linkedCase?: { id: string; caseId: string; title: string } | null;
  documents?: CaseDocument[];
  activityLogs?: ActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseDocument {
  id: string;
  caseId: string | null;
  optInRequestId: string | null;
  section: DocumentSection;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  version: number;
  uploadedById: string;
  uploadedBy: Pick<User, "id" | "name">;
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  caseId: string | null;
  optInRequestId: string | null;
  actorId: string;
  actor: Pick<User, "id" | "name" | "avatarUrl">;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  case?: { id: string; caseId: string; title: string } | null;
  optInRequest?: { id: string; requestId: string; emailAddress: string } | null;
}

export interface DashboardStats {
  urgent: number;
  open: number;
  inProgress: number;
  resolvedThisMonth: number;
  delayed: number;
  pendingOptIns: number;
}

export interface DeadlineItem {
  id: string;
  caseId: string;
  title: string;
  status: CaseStatus;
  responseDeadline: string | null;
  internalDeadline: string | null;
  followUpDate: string | null;
  assignedTo: Pick<User, "id" | "name"> | null;
  nearestDeadline: string | null;
  daysUntil: number | null;
  urgency: "overdue" | "today" | "soon" | "upcoming";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
