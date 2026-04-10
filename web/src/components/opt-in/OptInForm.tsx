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
  const [complainantName, setComplainantName] = useState("");
  const [complainantCountry, setComplainantCountry] = useState("");
  const [gender, setGender] = useState("");
  const [soiTimestamp, setSoiTimestamp] = useState("");
  const [doiTimestamp, setDoiTimestamp] = useState("");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, unknown> = {
      emailAddress,
      complainantName: complainantName || null,
      complainantCountry: complainantCountry || null,
      gender: gender || null,
      soiTimestamp: soiTimestamp || null,
      doiTimestamp: doiTimestamp || null,
      responseDeadline: responseDeadline || null,
      reason: reason || null,
      notes: notes || null,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
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
          <label htmlFor="complainantCountry" className={labelClass}>
            Country <span className="text-red-500">*</span>
          </label>
          <input
            id="complainantCountry"
            type="text"
            required
            value={complainantCountry}
            onChange={(e) => setComplainantCountry(e.target.value)}
            className={inputClass}
            placeholder="e.g. DE, AT, CH"
          />
        </div>

        <div>
          <label htmlFor="complainantName" className={labelClass}>
            Complainant Name
          </label>
          <input
            id="complainantName"
            type="text"
            value={complainantName}
            onChange={(e) => setComplainantName(e.target.value)}
            className={inputClass}
            placeholder="Full name (if known)"
          />
        </div>

        <div>
          <label htmlFor="gender" className={labelClass}>
            Gender
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div>
          <label htmlFor="responseDeadline" className={labelClass}>
            Response Deadline
          </label>
          <input
            id="responseDeadline"
            type="date"
            value={responseDeadline}
            onChange={(e) => setResponseDeadline(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-gray-500 mt-1">Some complainers want an answer earlier than 30 days.</p>
        </div>

        <div>
          <label htmlFor="soiTimestamp" className={labelClass}>
            SOI Timestamp
          </label>
          <input
            id="soiTimestamp"
            type="datetime-local"
            value={soiTimestamp}
            onChange={(e) => setSoiTimestamp(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-gray-500 mt-1">Single opt-in time (subscription form submitted).</p>
        </div>

        <div>
          <label htmlFor="doiTimestamp" className={labelClass}>
            DOI Timestamp
          </label>
          <input
            id="doiTimestamp"
            type="datetime-local"
            value={doiTimestamp}
            onChange={(e) => setDoiTimestamp(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-gray-500 mt-1">Double opt-in time (confirmation link clicked).</p>
        </div>
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
