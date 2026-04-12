"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  MessageSquare,
  Shield,
  Clock,
  User as UserIcon,
  Upload,
  Edit3,
  ArrowRightLeft,
  Zap,
  Plus,
} from "lucide-react";
import { cases as casesApi, auth as authApi } from "@/lib/api";
import type { User } from "@/lib/types";
import type {
  LegalCase,
  CaseStatus,
  CaseSource,
  CaseType,
  RiskLevel,
  ActivityLog,
} from "@/lib/types";
import CaseStatusBadge from "@/components/cases/CaseStatusBadge";
import RiskBadge from "@/components/cases/RiskBadge";
import DeadlineStatus from "@/components/cases/DeadlineStatus";
import DocumentTabs from "@/components/documents/DocumentTabs";

// --- Constants ---

const ALL_STATUSES: { value: CaseStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In Review" },
  { value: "opt_in_requested", label: "Opt-In Requested" },
  { value: "opt_in_received", label: "Opt-In Received" },
  { value: "with_lawyer", label: "With Lawyer" },
  { value: "response_sent", label: "Response Sent" },
  { value: "awaiting_reply", label: "Awaiting Reply" },
  { value: "resolved_no_action", label: "Resolved - No Action" },
  { value: "resolved_settlement", label: "Resolved - Settlement" },
  { value: "escalated_urgent", label: "Escalated - Urgent" },
  { value: "delayed", label: "Delayed" },
  { value: "archived", label: "Archived" },
];

const SOURCE_OPTIONS: { value: CaseSource; label: string }[] = [
  { value: "email_auto", label: "Email (Auto-detected)" },
  { value: "email_manual", label: "Email (Manual)" },
  { value: "lawyer_letter", label: "Lawyer Letter" },
  { value: "regulatory_body", label: "Regulatory Body" },
  { value: "galaxy_platform", label: "Galaxy Platform" },
  { value: "other", label: "Other" },
];

const CASE_TYPE_OPTIONS: { value: CaseType; label: string }[] = [
  { value: "spam_complaint", label: "Spam Complaint" },
  { value: "cease_and_desist", label: "Cease & Desist" },
  { value: "gdpr_request", label: "GDPR Request" },
  { value: "data_erasure_request", label: "Data Erasure Request" },
  { value: "litigation_threat", label: "Litigation Threat" },
  { value: "regulatory_inquiry", label: "Regulatory Inquiry" },
  { value: "other", label: "Other" },
];

const RISK_OPTIONS: { value: RiskLevel | ""; label: string }[] = [
  { value: "", label: "Not Set" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

// --- Activity Icon ---

function activityIcon(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("upload") || lower.includes("document")) return Upload;
  if (lower.includes("status")) return ArrowRightLeft;
  if (lower.includes("email") || lower.includes("sent")) return MessageSquare;
  if (lower.includes("escalat") || lower.includes("lawyer")) return Shield;
  if (lower.includes("assign") || lower.includes("user")) return UserIcon;
  if (lower.includes("edit") || lower.includes("update")) return Edit3;
  return Clock;
}

// --- Inline Editable Field ---

function InlineField({
  label,
  value,
  type = "text",
  options,
  onSave,
  badge,
}: {
  label: string;
  value: string;
  type?: "text" | "email" | "date" | "select" | "checkbox";
  options?: { value: string; label: string }[];
  onSave: (val: string) => void;
  badge?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) {
      onSave(draft);
    }
  };

  if (type === "checkbox") {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-500">{label}</span>
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onSave(e.target.checked ? "true" : "false")}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
      </div>
    );
  }

  if (type === "select" && options) {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-500">{label}</span>
        <select
          value={value}
          onChange={(e) => onSave(e.target.value)}
          className="text-sm text-gray-900 bg-transparent border-none focus:ring-2 focus:ring-primary rounded cursor-pointer pr-6 text-right"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 group">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(value);
                setEditing(false);
              }
            }}
            className="text-sm text-gray-900 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary w-48 text-right"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-gray-900 hover:text-primary cursor-pointer transition-colors duration-200 text-right"
            title="Click to edit"
          >
            {value || <span className="text-gray-400">&mdash;</span>}
          </button>
        )}
        {badge}
      </div>
    </div>
  );
}

// --- Page ---

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<LegalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showNextAction, setShowNextAction] = useState(false);

  const loadCase = useCallback(async () => {
    try {
      const data = await casesApi.get(id);
      setCaseData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load case");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  useEffect(() => {
    authApi.users().then(setAllUsers).catch(() => {});
  }, []);

  // Close status dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateField = async (field: string, value: unknown) => {
    if (!caseData) return;
    try {
      const updated = await casesApi.update(caseData.id, { [field]: value } as Partial<LegalCase>);
      setCaseData(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleStatusChange = async (status: CaseStatus) => {
    setStatusOpen(false);
    await updateField("status", status);
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error || !caseData) {
    return (
      <div className="space-y-4">
        <Link
          href="/cases"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cases
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error || "Case not found."}
        </div>
      </div>
    );
  }

  const c = caseData;

  const toDateVal = (d: string | null) => {
    if (!d) return "";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const sourceLabel = SOURCE_OPTIONS.find((s) => s.value === c.source)?.label ?? c.source;
  const typeLabel = CASE_TYPE_OPTIONS.find((t) => t.value === c.caseType)?.label ?? c.caseType;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link
        href="/cases"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cases
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-mono">{c.caseId}</p>
          <h1 className="text-2xl font-semibold text-gray-900 truncate">{c.title}</h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status badge with dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => setStatusOpen(!statusOpen)}
              className="inline-flex items-center gap-1 cursor-pointer transition-colors duration-200"
            >
              <CaseStatusBadge status={c.status} />
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-56 max-h-72 overflow-y-auto">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleStatusChange(s.value)}
                    className={`w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200 ${
                      s.value === c.status
                        ? "bg-gray-100 font-medium text-gray-900"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <RiskBadge level={c.riskLevel} />
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0">
          <div className="divide-y divide-gray-100">
            <InlineField
              label="Title"
              value={c.title}
              onSave={(v) => updateField("title", v)}
            />
            <InlineField
              label="Complainant Email"
              value={c.complainantEmail}
              type="email"
              onSave={(v) => updateField("complainantEmail", v)}
            />
            <InlineField
              label="Complainant Name"
              value={c.complainantName ?? ""}
              onSave={(v) => updateField("complainantName", v || null)}
            />
            <InlineField
              label="Complainant Country"
              value={c.complainantCountry ?? ""}
              onSave={(v) => updateField("complainantCountry", v || null)}
            />
            <InlineField
              label="Source"
              value={c.source}
              type="select"
              options={SOURCE_OPTIONS}
              onSave={(v) => updateField("source", v)}
            />
            <InlineField
              label="Case Type"
              value={c.caseType}
              type="select"
              options={CASE_TYPE_OPTIONS}
              onSave={(v) => updateField("caseType", v)}
            />
            <InlineField
              label="Jurisdiction"
              value={c.jurisdiction ?? ""}
              onSave={(v) => updateField("jurisdiction", v || null)}
            />
            <InlineField
              label="Risk Level"
              value={c.riskLevel ?? ""}
              type="select"
              options={RISK_OPTIONS}
              onSave={(v) => updateField("riskLevel", v || null)}
            />
          </div>

          <div className="divide-y divide-gray-100">
            <InlineField
              label="Lawyer Name"
              value={c.lawyerName ?? ""}
              onSave={(v) => updateField("lawyerName", v || null)}
            />
            <InlineField
              label="Lawyer Firm"
              value={c.lawyerFirm ?? ""}
              onSave={(v) => updateField("lawyerFirm", v || null)}
            />
            <InlineField
              label="Lawyer Email"
              value={c.lawyerEmail ?? ""}
              type="email"
              onSave={(v) => updateField("lawyerEmail", v || null)}
            />
            <InlineField
              label="Lawyer Phone"
              value={c.lawyerPhone ?? ""}
              onSave={(v) => updateField("lawyerPhone", v || null)}
            />
            <InlineField
              label="Date Received"
              value={toDateVal(c.dateReceived)}
              type="date"
              onSave={(v) => updateField("dateReceived", v)}
            />
            <InlineField
              label="Response Deadline"
              value={toDateVal(c.responseDeadline)}
              type="date"
              onSave={(v) => updateField("responseDeadline", v || null)}
              badge={<DeadlineStatus deadline={c.responseDeadline} />}
            />
            <InlineField
              label="Internal Deadline"
              value={toDateVal(c.internalDeadline)}
              type="date"
              onSave={(v) => updateField("internalDeadline", v || null)}
              badge={<DeadlineStatus deadline={c.internalDeadline} />}
            />
            <InlineField
              label="Follow-Up Date"
              value={toDateVal(c.followUpDate)}
              type="date"
              onSave={(v) => updateField("followUpDate", v || null)}
              badge={<DeadlineStatus deadline={c.followUpDate} />}
            />
            <InlineField
              label="Escalated to Lawyer"
              value={c.escalatedToLawyer ? "true" : "false"}
              type="checkbox"
              onSave={(v) => updateField("escalatedToLawyer", v === "true")}
            />
          </div>

          {c.linkedOptInRequest && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-2">Linked Opt-In Request</p>
              <Link
                href={`/opt-in/${c.linkedOptInRequest.requestId}`}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer"
              >
                <span className="font-mono font-medium">{c.linkedOptInRequest.requestId}</span>
                <span className="text-gray-500">—</span>
                <span>{c.linkedOptInRequest.emailAddress}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Next Action Card */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Next Action</h2>
        </div>
        {c.nextAction || c.nextActionOwnerId || c.nextActionDeadline || showNextAction ? (
          <div className="space-y-3">
            <InlineField
              label="What"
              value={c.nextAction ?? ""}
              onSave={(v) => updateField("nextAction", v || null)}
            />
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Who</span>
              <select
                value={c.nextActionOwnerId ?? ""}
                onChange={(e) => updateField("nextActionOwnerId", e.target.value || null)}
                className="text-sm text-gray-900 bg-transparent border-none focus:ring-2 focus:ring-primary rounded cursor-pointer pr-6 text-right"
              >
                <option value="">Not assigned</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <InlineField
              label="By when"
              value={toDateVal(c.nextActionDeadline)}
              type="date"
              onSave={(v) => updateField("nextActionDeadline", v || null)}
              badge={<DeadlineStatus deadline={c.nextActionDeadline} />}
            />
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-3">No next action set</p>
            <button
              type="button"
              onClick={() => setShowNextAction(true)}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              Add next action
            </button>
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        </div>
        <DocumentTabs
          documents={c.documents ?? []}
          caseId={c.id}
          onRefresh={loadCase}
        />
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
        </div>
        <ActivityTimeline logs={c.activityLogs ?? []} />
      </div>
    </div>
  );
}

// --- Activity Timeline ---

function ActivityTimeline({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No activity recorded yet.
      </p>
    );
  }

  // Newest first
  const sorted = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <ul className="space-y-4">
      {sorted.map((log) => {
        const Icon = activityIcon(log.action);
        return (
          <li key={log.id} className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{log.actor?.name ?? "System"}</span>{" "}
                {log.action}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(log.createdAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
