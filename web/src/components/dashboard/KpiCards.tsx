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

const ACCENT = "#3db48c";

const cards = [
  { key: "urgent" as const, label: "Urgent", icon: AlertTriangle, color: "#dc2626" },
  { key: "open" as const, label: "Open Cases", icon: FolderOpen, color: "#d97706" },
  { key: "inProgress" as const, label: "In Progress", icon: Clock, color: "#2563eb" },
  { key: "resolvedThisMonth" as const, label: "Resolved (Month)", icon: CheckCircle, color: ACCENT },
  { key: "delayed" as const, label: "Delayed", icon: PauseCircle, color: "#6b7280" },
  { key: "pendingOptIns" as const, label: "Pending Opt-Ins", icon: ShieldCheck, color: "#7c3aed" },
];

export default function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className="flex gap-3.5 mb-5 flex-wrap">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="flex-1 min-w-[170px]"
            style={{
              background: "#ffffff",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              padding: 20,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <div
                  className="mb-1.5"
                  style={{
                    fontSize: 11,
                    color: "#a0aec0",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#1a202c",
                    lineHeight: 1.2,
                  }}
                >
                  {stats[card.key]}
                </div>
              </div>
              <div
                className="flex-shrink-0"
                style={{
                  background: card.color + "1a",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Icon size={20} color={card.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
