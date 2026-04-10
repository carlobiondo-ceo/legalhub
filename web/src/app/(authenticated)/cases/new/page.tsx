"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cases } from "@/lib/api";
import CaseForm from "@/components/cases/CaseForm";

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const newCase = await cases.create(data);
      router.push(`/cases/${newCase.caseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create case");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/cases"
          className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
          aria-label="Back to cases"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">New Case</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CaseForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
