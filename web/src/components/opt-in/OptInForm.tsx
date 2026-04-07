"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

interface OptInFormProps {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
}

export default function OptInForm({ onSubmit, loading }: OptInFormProps) {
  const [emailAddress, setEmailAddress] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, unknown> = {
      emailAddress,
      reason: reason || null,
      notes: notes || null,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="emailAddress" className={labelClass}>
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="emailAddress"
          type="email"
          required
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          className={inputClass}
          placeholder="complainant@example.com"
        />
      </div>

      <div>
        <label htmlFor="reason" className={labelClass}>
          Reason
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="e.g. Pre-empt potential GDPR complaint, Sales team flag"
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </span>
          ) : (
            "Create Request"
          )}
        </button>
        <Link
          href="/opt-in"
          className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
