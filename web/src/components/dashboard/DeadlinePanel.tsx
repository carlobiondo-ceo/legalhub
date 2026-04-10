"use client";

import Link from "next/link";
import type { DeadlineItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DeadlinePanelProps {
  deadlines: DeadlineItem[];
}

const urgencyStyles: Record<
  DeadlineItem["urgency"],
  string
> = {
  overdue: "bg-red-50 border-red-200",
  today: "bg-orange-50 border-orange-200",
  soon: "bg-yellow-50 border-yellow-200",
  upcoming: "bg-green-50 border-green-200",
};

const urgencyLabels: Record<DeadlineItem["urgency"], string> = {
  overdue: "Overdue",
  today: "Due Today",
  soon: "Due Soon",
  upcoming: "Upcoming",
};

export default function DeadlinePanel({ deadlines }: DeadlinePanelProps) {
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
        Upcoming Deadlines
      </h2>

      {deadlines.length === 0 ? (
        <p className="text-sm text-gray-500">
          No deadlines in the next 14 days.
        </p>
      ) : (
        <div className="max-h-80 overflow-y-auto space-y-2">
          {deadlines.map((item) => (
            <Link
              key={item.id}
              href={`/cases/${item.caseId}`}
              className={cn(
                "block rounded-md border p-3 cursor-pointer hover:opacity-80 transition-opacity",
                urgencyStyles[item.urgency]
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  {item.caseId}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    item.urgency === "overdue" && "bg-red-100 text-red-700",
                    item.urgency === "today" && "bg-orange-100 text-orange-700",
                    item.urgency === "soon" && "bg-yellow-100 text-yellow-700",
                    item.urgency === "upcoming" && "bg-green-100 text-green-700"
                  )}
                >
                  {urgencyLabels[item.urgency]}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                {item.title}
              </p>
              {item.daysUntil !== null && (
                <p className="text-xs text-gray-500 mt-1">
                  {item.daysUntil < 0
                    ? `${Math.abs(item.daysUntil)} days overdue`
                    : item.daysUntil === 0
                    ? "Due today"
                    : `${item.daysUntil} days remaining`}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
