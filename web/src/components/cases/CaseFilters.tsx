"use client";

import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In Review" },
  { value: "opt_in_requested", label: "Opt-In Requested" },
  { value: "opt_in_received", label: "Opt-In Received" },
  { value: "with_lawyer", label: "With Lawyer" },
  { value: "response_sent", label: "Response Sent" },
  { value: "awaiting_reply", label: "Awaiting Reply" },
  { value: "resolved_no_action", label: "Resolved" },
  { value: "resolved_settlement", label: "Settlement" },
  { value: "escalated_urgent", label: "Urgent" },
  { value: "delayed", label: "Delayed" },
  { value: "archived", label: "Archived" },
];

const CASE_TYPE_OPTIONS = [
  { value: "spam_complaint", label: "Spam Complaint" },
  { value: "cease_and_desist", label: "Cease & Desist" },
  { value: "gdpr_request", label: "GDPR Request" },
  { value: "data_erasure_request", label: "Data Erasure" },
  { value: "litigation_threat", label: "Litigation Threat" },
  { value: "regulatory_inquiry", label: "Regulatory Inquiry" },
  { value: "other", label: "Other" },
];

const RISK_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

interface CaseFiltersProps {
  onFilter: (filters: Record<string, string>) => void;
}

export default function CaseFilters({ onFilter }: CaseFiltersProps) {
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedStatuses.length > 0 ||
    selectedTypes.length > 0 ||
    selectedRisks.length > 0;

  const togglePill = (
    value: string,
    selected: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const handleSearch = useCallback(() => {
    const filters: Record<string, string> = {};
    if (search.trim()) filters.search = search.trim();
    if (selectedStatuses.length > 0) filters.status = selectedStatuses.join(",");
    if (selectedTypes.length > 0) filters.caseType = selectedTypes.join(",");
    if (selectedRisks.length > 0) filters.riskLevel = selectedRisks.join(",");
    onFilter(filters);
  }, [search, selectedStatuses, selectedTypes, selectedRisks, onFilter]);

  const handleClear = () => {
    setSearch("");
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSelectedRisks([]);
    onFilter({});
  };

  return (
    <div className="space-y-3">
      {/* Search bar row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, case ID, lawyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm cursor-pointer transition-colors ${
            showAdvanced
              ? "border-primary bg-green-50 text-primary"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
        <button
          type="button"
          onClick={handleSearch}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-green-600 transition-colors"
        >
          Search
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Advanced filter panel */}
      {showAdvanced && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      togglePill(opt.value, selectedStatuses, setSelectedStatuses)
                    }
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

            {/* Case Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CASE_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      togglePill(opt.value, selectedTypes, setSelectedTypes)
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      selectedTypes.includes(opt.value)
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level
              </label>
              <div className="flex flex-wrap gap-1.5">
                {RISK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      togglePill(opt.value, selectedRisks, setSelectedRisks)
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      selectedRisks.includes(opt.value)
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
