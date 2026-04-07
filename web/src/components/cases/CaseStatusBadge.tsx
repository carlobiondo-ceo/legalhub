import type { CaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<CaseStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-100 text-blue-700" },
  in_review: { label: "In Review", className: "bg-indigo-100 text-indigo-700" },
  opt_in_requested: { label: "Opt-In Requested", className: "bg-yellow-100 text-yellow-700" },
  opt_in_received: { label: "Opt-In Received", className: "bg-amber-100 text-amber-700" },
  with_lawyer: { label: "With Lawyer", className: "bg-purple-100 text-purple-700" },
  response_sent: { label: "Response Sent", className: "bg-teal-100 text-teal-700" },
  awaiting_reply: { label: "Awaiting Reply", className: "bg-orange-100 text-orange-700" },
  resolved_no_action: { label: "Resolved", className: "bg-green-100 text-green-700" },
  resolved_settlement: { label: "Settlement", className: "bg-green-100 text-green-700" },
  escalated_urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
  delayed: { label: "Delayed", className: "bg-gray-100 text-gray-600" },
  archived: { label: "Archived", className: "bg-gray-50 text-gray-400" },
};

interface CaseStatusBadgeProps {
  status: CaseStatus;
}

export default function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
