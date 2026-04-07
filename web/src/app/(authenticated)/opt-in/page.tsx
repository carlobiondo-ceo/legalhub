"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { optInRequests } from "@/lib/api";
import type { OptInRequest, OptInStatus } from "@/lib/types";
import OptInTable from "@/components/opt-in/OptInTable";

const STATUS_OPTIONS: { value: OptInStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "received", label: "Received" },
  { value: "verified", label: "Verified" },
  { value: "issue_found", label: "Issue Found" },
  { value: "linked_to_case", label: "Linked to Case" },
];

export default function OptInListPage() {
  const [requests, setRequests] = useState<OptInRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (selectedStatuses.length > 0) params.status = selectedStatuses.join(",");

      const res = await optInRequests.list(
        Object.keys(params).length > 0 ? params : undefined
      );
      setRequests(res.requests || []);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatuses]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const toggleStatus = (value: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const hasFilters = search.trim() !== "" || selectedStatuses.length > 0;

  const clearFilters = () => {
    setSearch("");
    setSelectedStatuses([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Opt-In Requests</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">
              {total} total request{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link
          href="/opt-in/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or request ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadRequests()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={loadRequests}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-green-600 transition-colors"
          >
            Search
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleStatus(opt.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                selectedStatuses.includes(opt.value)
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded mb-2" />
          ))}
        </div>
      ) : (
        !error && <OptInTable requests={requests} />
      )}
    </div>
  );
}
