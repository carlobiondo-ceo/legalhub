"use client";

import {
  AlertTriangle,
  FolderOpen,
  Clock,
  CheckCircle,
  PauseCircle,
  ShieldCheck,
} from "lucide-react";
import type { DashboardStats } from "@/lib/types";

interface KpiCardsProps {
  stats: DashboardStats;
}

const cards = [
  {
    key: "urgent" as const,
    label: "Urgent",
    icon: AlertTriangle,
    textColor: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    key: "open" as const,
    label: "Open Cases",
    icon: FolderOpen,
    textColor: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    key: "inProgress" as const,
    label: "In Progress",
    icon: Clock,
    textColor: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    key: "resolvedThisMonth" as const,
    label: "Resolved (Month)",
    icon: CheckCircle,
    textColor: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    key: "delayed" as const,
    label: "Delayed",
    icon: PauseCircle,
    textColor: "text-gray-500",
    bgColor: "bg-gray-50",
  },
  {
    key: "pendingOptIns" as const,
    label: "Pending Opt-Ins",
    icon: ShieldCheck,
    textColor: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
];

export default function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${card.bgColor} mb-3`}
            >
              <Icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {stats[card.key]}
            </div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}
