import type { OptInStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<OptInStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  received: { label: "Received", className: "bg-blue-100 text-blue-700" },
  verified: { label: "Verified", className: "bg-green-100 text-green-700" },
  issue_found: { label: "Issue Found", className: "bg-red-100 text-red-700" },
  linked_to_case: { label: "Linked to Case", className: "bg-purple-100 text-purple-700" },
};

interface OptInStatusBadgeProps {
  status: OptInStatus;
}

export default function OptInStatusBadge({ status }: OptInStatusBadgeProps) {
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
