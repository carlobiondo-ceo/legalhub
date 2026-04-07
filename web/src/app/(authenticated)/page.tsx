"use client";

import { useEffect, useState } from "react";
import { dashboard } from "@/lib/api";
import type { DashboardStats, DeadlineItem, ActivityLog } from "@/lib/types";
import KpiCards from "@/components/dashboard/KpiCards";
import DeadlinePanel from "@/components/dashboard/DeadlinePanel";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deadlines, setDeadlines] = useState<DeadlineItem[] | null>(null);
  const [activity, setActivity] = useState<ActivityLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dashboard.stats(),
      dashboard.deadlines(),
      dashboard.activity(),
    ])
      .then(([s, d, a]) => {
        setStats(s);
        setDeadlines(d);
        setActivity(a);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      });
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const loading = !stats || !deadlines || !activity;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 mb-3" />
              <div className="h-7 w-12 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <KpiCards stats={stats} />
      )}

      {/* Deadline Panel + Activity Feed */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
            >
              <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeadlinePanel deadlines={deadlines} />
          <ActivityFeed activity={activity} />
        </div>
      )}
    </div>
  );
}
