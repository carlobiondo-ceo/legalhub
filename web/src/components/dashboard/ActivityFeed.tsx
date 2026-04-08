"use client";

import Link from "next/link";
import {
  Plus,
  ArrowRightLeft,
  FileUp,
  Edit,
  Trash2,
  Activity,
} from "lucide-react";
import type { ActivityLog } from "@/lib/types";

interface ActivityFeedProps {
  activity: ActivityLog[];
}

function getActionIcon(action: string) {
  if (action.includes("created")) return Plus;
  if (action.includes("status_changed")) return ArrowRightLeft;
  if (action.includes("uploaded")) return FileUp;
  if (action.includes("field_updated")) return Edit;
  if (action.includes("deleted")) return Trash2;
  return Activity;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function describeAction(log: ActivityLog): string {
  const action = log.action;
  if (action === "created") return "created a new case";
  if (action === "status_changed") {
    const from = (log.details?.from as string) || "";
    const to = (log.details?.to as string) || "";
    if (from && to) return `changed status from ${from} to ${to}`;
    return "changed the status";
  }
  if (action === "uploaded") return "uploaded a document";
  if (action === "field_updated") {
    const field = (log.details?.field as string) || "a field";
    return `updated ${field}`;
  }
  if (action === "deleted") return "deleted a record";
  return action.replace(/_/g, " ");
}

export default function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 10,
        border: "1px solid #e2e8f0",
        padding: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ fontWeight: 600, color: "#1a202c", fontSize: 14, marginBottom: 16 }}>
        Recent Activity
      </h2>

      {activity.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activity.</p>
      ) : (
        <div className="max-h-80 overflow-y-auto space-y-3">
          {activity.map((log) => {
            const Icon = getActionIcon(log.action);
            const linkHref = log.caseId
              ? `/cases/${log.caseId}`
              : log.optInRequestId
              ? `/opt-in-requests/${log.optInRequestId}`
              : null;
            const linkLabel = log.case
              ? log.case.caseId
              : log.optInRequest
              ? log.optInRequest.requestId
              : null;

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 text-sm"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700">
                    <span className="font-medium text-gray-900">
                      {log.actor.name}
                    </span>{" "}
                    {describeAction(log)}
                    {linkHref && linkLabel && (
                      <>
                        {" "}
                        <Link
                          href={linkHref}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          {linkLabel}
                        </Link>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {timeAgo(log.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
