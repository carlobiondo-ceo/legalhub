"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cases as casesApi } from "@/lib/api";
import type { LegalCase } from "@/lib/types";
import CaseFilters from "@/components/cases/CaseFilters";
import CaseTable from "@/components/cases/CaseTable";

export default function CasesPage() {
  const [caseList, setCaseList] = useState<LegalCase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const loadCases = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await casesApi.list(Object.keys(params).length > 0 ? params : undefined);
      setCaseList(res.data || []);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases(filters);
  }, [filters, loadCases]);

  const handleFilter = useCallback((newFilters: Record<string, string>) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Legal Cases</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">
              {total} total case{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link
          href="/cases/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Case
        </Link>
      </div>

      {/* Filters */}
      <CaseFilters onFilter={handleFilter} />

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
        !error && <CaseTable cases={caseList} />
      )}
    </div>
  );
}
