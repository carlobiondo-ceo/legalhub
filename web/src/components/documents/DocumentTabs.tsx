"use client";

import { useState } from "react";
import type { CaseDocument, DocumentSection } from "@/lib/types";
import { documents as docsApi } from "@/lib/api";
import DocumentList from "./DocumentList";
import DocumentUpload from "./DocumentUpload";

const TABS: { key: DocumentSection; label: string }[] = [
  { key: "opt_in_proof", label: "Opt-In Proof" },
  { key: "correspondence", label: "Correspondence" },
  { key: "internal_notes", label: "Internal Notes" },
  { key: "sent_responses", label: "Sent Responses" },
  { key: "due_diligence", label: "Due Diligence" },
  { key: "other", label: "Other" },
];

interface DocumentTabsProps {
  documents: CaseDocument[];
  caseId?: string;
  optInRequestId?: string;
  onRefresh: () => void;
}

export default function DocumentTabs({
  documents,
  caseId,
  optInRequestId,
  onRefresh,
}: DocumentTabsProps) {
  const [activeTab, setActiveTab] = useState<DocumentSection>("opt_in_proof");

  const filteredDocs = documents.filter((d) => d.section === activeTab);

  const handleDelete = async (id: string) => {
    try {
      await docsApi.delete(id);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete document");
    }
  };

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-4">
        {TABS.map((tab) => {
          const count = documents.filter((d) => d.section === tab.key).length;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-200
                border-b-2 -mb-px
                ${isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Document list for active section */}
      <DocumentList documents={filteredDocs} onDelete={handleDelete} />

      {/* Upload zone */}
      <div className="mt-4">
        <DocumentUpload
          caseId={caseId}
          optInRequestId={optInRequestId}
          section={activeTab}
          onUploaded={onRefresh}
        />
      </div>
    </div>
  );
}
