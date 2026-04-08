"use client";

import { FileSearch } from "lucide-react";

export default function DueDiligencePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Due Diligence</h2>
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <FileSearch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-base font-medium text-gray-900 mb-2">Coming in Phase 3</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          AI-powered due diligence reports, client questionnaire auto-fill, and automatic dangerous clause detection will be available here.
        </p>
      </div>
    </div>
  );
}
