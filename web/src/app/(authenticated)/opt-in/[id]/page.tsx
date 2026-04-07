"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Clock,
  User,
  Upload,
  Edit3,
  ArrowRightLeft,
  MessageSquare,
  Shield,
  Database,
} from "lucide-react";
import { optInRequests as optInApi } from "@/lib/api";
import type { OptInRequest, OptInStatus, ActivityLog } from "@/lib/types";
import OptInStatusBadge from "@/components/opt-in/OptInStatusBadge";
import GalaxyDataForm from "@/components/opt-in/GalaxyDataForm";
import DocumentTabs from "@/components/documents/DocumentTabs";

// --- Constants ---

const ALL_STATUSES: { value: OptInStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "received", label: "Received" },
  { value: "verified", label: "Verified" },
  { value: "issue_found", label: "Issue Found" },
  { value: "linked_to_case", label: "Linked to Case" },
];

// --- Activity Icon ---

function activityIcon(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("upload") || lower.includes("document")) return Upload;
  if (lower.includes("status")) return ArrowRightLeft;
  if (lower.includes("email") || lower.includes("sent")) return MessageSquare;
  if (lower.includes("escalat") || lower.includes("lawyer")) return Shield;
  if (lower.includes("assign") || lower.includes("user")) return User;
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

// --- Activity Timeline ---

function ActivityTimeline({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No activity recorded yet.
      </p>
    );
  }

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

// --- Page ---

export default function OptInDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [reqData, setReqData] = useState<OptInRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [galaxySaving, setGalaxySaving] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const galaxyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRequest = useCallback(async () => {
    try {
      const data = await optInApi.get(id);
      setReqData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load request");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

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
    if (!reqData) return;
    try {
      const updated = await optInApi.update(reqData.id, {
        [field]: value,
      } as Partial<OptInRequest>);
      setReqData(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleStatusChange = async (status: OptInStatus) => {
    setStatusOpen(false);
    await updateField("status", status);
  };

  const handleGalaxyChange = useCallback(
    (data: Record<string, unknown>) => {
      if (!reqData) return;
      // Optimistic local update
      setReqData({ ...reqData, galaxyData: data });

      // Debounce the API call
      if (galaxyTimer.current) clearTimeout(galaxyTimer.current);
      setGalaxySaving(true);
      galaxyTimer.current = setTimeout(async () => {
        try {
          await optInApi.update(reqData.id, {
            galaxyData: data,
          } as Partial<OptInRequest>);
        } catch (err) {
          alert(err instanceof Error ? err.message : "Failed to save Galaxy data");
        } finally {
          setGalaxySaving(false);
        }
      }, 800);
    },
    [reqData]
  );

  // --- Loading ---
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error || !reqData) {
    return (
      <div className="space-y-4">
        <Link
          href="/opt-in"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Opt-In Requests
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error || "Request not found."}
        </div>
      </div>
    );
  }

  const r = reqData;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link
        href="/opt-in"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Opt-In Requests
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-mono">{r.requestId}</p>
          <h1 className="text-2xl font-semibold text-gray-900 truncate">
            {r.emailAddress}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status badge with dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => setStatusOpen(!statusOpen)}
              className="inline-flex items-center gap-1 cursor-pointer transition-colors duration-200"
            >
              <OptInStatusBadge status={r.status} />
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
                      s.value === r.status
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
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Request Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div className="divide-y divide-gray-100">
            <InlineField
              label="Email Address"
              value={r.emailAddress}
              type="email"
              onSave={(v) => updateField("emailAddress", v)}
            />
            <InlineField
              label="Requested By"
              value={r.requestedBy?.name ?? ""}
              onSave={() => {}}
            />
            <InlineField
              label="Date Requested"
              value={
                r.dateRequested
                  ? new Date(r.dateRequested).toISOString().split("T")[0]
                  : ""
              }
              type="date"
              onSave={(v) => updateField("dateRequested", v)}
            />
          </div>

          <div className="divide-y divide-gray-100">
            <InlineField
              label="Reason"
              value={r.reason ?? ""}
              onSave={(v) => updateField("reason", v || null)}
            />
            <InlineField
              label="Notes"
              value={r.notes ?? ""}
              onSave={(v) => updateField("notes", v || null)}
            />
            {r.linkedCase && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Linked Case</span>
                <Link
                  href={`/cases/${r.linkedCase.id}`}
                  className="text-sm text-blue-600 hover:underline cursor-pointer"
                >
                  {r.linkedCase.caseId} &mdash; {r.linkedCase.title}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SixPG Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SixPG Portal</h2>
        <div className="divide-y divide-gray-100 max-w-md">
          <InlineField
            label="SixPG Submitted"
            value={r.sixpgSubmitted ? "true" : "false"}
            type="checkbox"
            onSave={(v) => updateField("sixpgSubmitted", v === "true")}
          />
          {r.sixpgSubmittedAt && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Submitted At</span>
              <span className="text-sm text-gray-900">
                {new Date(r.sixpgSubmittedAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Galaxy Data Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Galaxy Data</h2>
          {galaxySaving && (
            <span className="text-xs text-gray-400 ml-2">Saving...</span>
          )}
        </div>
        <GalaxyDataForm data={r.galaxyData} onChange={handleGalaxyChange} />
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        </div>
        <DocumentTabs
          documents={r.documents ?? []}
          optInRequestId={r.id}
          onRefresh={loadRequest}
        />
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
        </div>
        <ActivityTimeline logs={r.activityLogs ?? []} />
      </div>
    </div>
  );
}
