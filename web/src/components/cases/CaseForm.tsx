"use client";

import { useState } from "react";
import Link from "next/link";
import type { LegalCase, CaseSource, CaseType, RiskLevel } from "@/lib/types";

const SOURCE_OPTIONS: { value: CaseSource; label: string }[] = [
  { value: "email_auto", label: "Email (Auto-detected)" },
  { value: "email_manual", label: "Email (Manual)" },
  { value: "lawyer_letter", label: "Lawyer Letter" },
  { value: "regulatory_body", label: "Regulatory Body" },
  { value: "galaxy_platform", label: "Galaxy Platform" },
  { value: "other", label: "Other" },
];

const CASE_TYPE_OPTIONS: { value: CaseType; label: string }[] = [
  { value: "spam_complaint", label: "Spam Complaint" },
  { value: "cease_and_desist", label: "Cease & Desist" },
  { value: "gdpr_request", label: "GDPR Request" },
  { value: "data_erasure_request", label: "Data Erasure Request" },
  { value: "litigation_threat", label: "Litigation Threat" },
  { value: "regulatory_inquiry", label: "Regulatory Inquiry" },
  { value: "other", label: "Other" },
];

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

interface CaseFormProps {
  initialData?: Partial<LegalCase>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
}

function toDateInputValue(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const sectionClass = "space-y-4";

export default function CaseForm({ initialData, onSubmit, loading }: CaseFormProps) {
  const isEditing = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [complainantEmail, setComplainantEmail] = useState(initialData?.complainantEmail ?? "");
  const [complainantName, setComplainantName] = useState(initialData?.complainantName ?? "");
  const [complainantCountry, setComplainantCountry] = useState(initialData?.complainantCountry ?? "");

  const [lawyerName, setLawyerName] = useState(initialData?.lawyerName ?? "");
  const [lawyerFirm, setLawyerFirm] = useState(initialData?.lawyerFirm ?? "");
  const [lawyerEmail, setLawyerEmail] = useState(initialData?.lawyerEmail ?? "");
  const [lawyerPhone, setLawyerPhone] = useState(initialData?.lawyerPhone ?? "");

  const [source, setSource] = useState<CaseSource>(initialData?.source ?? "email_manual");
  const [sourceOther, setSourceOther] = useState(initialData?.sourceOther ?? "");
  const [caseType, setCaseType] = useState<CaseType>(initialData?.caseType ?? "spam_complaint");
  const [caseTypeOther, setCaseTypeOther] = useState(initialData?.caseTypeOther ?? "");
  const [jurisdiction, setJurisdiction] = useState(initialData?.jurisdiction ?? "");
  const [riskLevel, setRiskLevel] = useState<RiskLevel | "">(initialData?.riskLevel ?? "");

  const [dateReceived, setDateReceived] = useState(
    toDateInputValue(initialData?.dateReceived) || todayStr()
  );
  const [responseDeadline, setResponseDeadline] = useState(
    toDateInputValue(initialData?.responseDeadline)
  );
  const [internalDeadline, setInternalDeadline] = useState(
    toDateInputValue(initialData?.internalDeadline)
  );
  const [followUpDate, setFollowUpDate] = useState(
    toDateInputValue(initialData?.followUpDate)
  );

  const [escalatedToLawyer, setEscalatedToLawyer] = useState(
    initialData?.escalatedToLawyer ?? false
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, unknown> = {
      title,
      complainantEmail,
      complainantName: complainantName || null,
      complainantCountry: complainantCountry || null,
      lawyerName: lawyerName || null,
      lawyerFirm: lawyerFirm || null,
      lawyerEmail: lawyerEmail || null,
      lawyerPhone: lawyerPhone || null,
      source,
      sourceOther: source === "other" ? sourceOther || null : null,
      caseType,
      caseTypeOther: caseType === "other" ? caseTypeOther || null : null,
      jurisdiction: jurisdiction || null,
      riskLevel: riskLevel || null,
      dateReceived: dateReceived || todayStr(),
      responseDeadline: responseDeadline || null,
      internalDeadline: internalDeadline || null,
      followUpDate: followUpDate || null,
      escalatedToLawyer,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Identity Section */}
      <fieldset className={sectionClass}>
        <legend className="text-lg font-semibold text-gray-900 mb-2">Identity</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="title" className={labelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Case title"
            />
          </div>
          <div>
            <label htmlFor="complainantEmail" className={labelClass}>
              Complainant Email <span className="text-red-500">*</span>
            </label>
            <input
              id="complainantEmail"
              type="email"
              required
              value={complainantEmail}
              onChange={(e) => setComplainantEmail(e.target.value)}
              className={inputClass}
              placeholder="complainant@example.com"
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
            />
          </div>
          <div>
            <label htmlFor="complainantCountry" className={labelClass}>
              Complainant Country
            </label>
            <input
              id="complainantCountry"
              type="text"
              value={complainantCountry}
              onChange={(e) => setComplainantCountry(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {/* Lawyer Section */}
      <fieldset className={sectionClass}>
        <legend className="text-lg font-semibold text-gray-900 mb-2">Lawyer</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lawyerName" className={labelClass}>Lawyer Name</label>
            <input id="lawyerName" type="text" value={lawyerName} onChange={(e) => setLawyerName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="lawyerFirm" className={labelClass}>Lawyer Firm</label>
            <input id="lawyerFirm" type="text" value={lawyerFirm} onChange={(e) => setLawyerFirm(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="lawyerEmail" className={labelClass}>Lawyer Email</label>
            <input id="lawyerEmail" type="email" value={lawyerEmail} onChange={(e) => setLawyerEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="lawyerPhone" className={labelClass}>Lawyer Phone</label>
            <input id="lawyerPhone" type="text" value={lawyerPhone} onChange={(e) => setLawyerPhone(e.target.value)} className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Classification Section */}
      <fieldset className={sectionClass}>
        <legend className="text-lg font-semibold text-gray-900 mb-2">Classification</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="source" className={labelClass}>Source</label>
            <select id="source" value={source} onChange={(e) => setSource(e.target.value as CaseSource)} className={inputClass + " cursor-pointer"}>
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {source === "other" && (
              <input
                type="text"
                value={sourceOther}
                onChange={(e) => setSourceOther(e.target.value)}
                className={inputClass + " mt-2"}
                placeholder="Specify the source..."
              />
            )}
          </div>
          <div>
            <label htmlFor="caseType" className={labelClass}>Case Type</label>
            <select id="caseType" value={caseType} onChange={(e) => setCaseType(e.target.value as CaseType)} className={inputClass + " cursor-pointer"}>
              {CASE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {caseType === "other" && (
              <input
                type="text"
                value={caseTypeOther}
                onChange={(e) => setCaseTypeOther(e.target.value)}
                className={inputClass + " mt-2"}
                placeholder="Specify the case type..."
              />
            )}
          </div>
          <div>
            <label htmlFor="jurisdiction" className={labelClass}>Jurisdiction</label>
            <input id="jurisdiction" type="text" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className={inputClass} placeholder="e.g. Germany, EU" />
          </div>
          <div>
            <label htmlFor="riskLevel" className={labelClass}>Risk Level</label>
            <select id="riskLevel" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as RiskLevel | "")} className={inputClass + " cursor-pointer"}>
              <option value="">-- Not Set --</option>
              {RISK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Dates Section */}
      <fieldset className={sectionClass}>
        <legend className="text-lg font-semibold text-gray-900 mb-2">Dates</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateReceived" className={labelClass}>Date Received</label>
            <input id="dateReceived" type="date" value={dateReceived} onChange={(e) => setDateReceived(e.target.value)} className={inputClass + " cursor-pointer"} />
          </div>
          <div>
            <label htmlFor="responseDeadline" className={labelClass}>Response Deadline</label>
            <input id="responseDeadline" type="date" value={responseDeadline} onChange={(e) => setResponseDeadline(e.target.value)} className={inputClass + " cursor-pointer"} />
          </div>
          <div>
            <label htmlFor="internalDeadline" className={labelClass}>Internal Deadline</label>
            <input id="internalDeadline" type="date" value={internalDeadline} onChange={(e) => setInternalDeadline(e.target.value)} className={inputClass + " cursor-pointer"} />
          </div>
          <div>
            <label htmlFor="followUpDate" className={labelClass}>Follow-Up Date</label>
            <input id="followUpDate" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className={inputClass + " cursor-pointer"} />
          </div>
        </div>
      </fieldset>

      {/* Assignment Section */}
      <fieldset className={sectionClass}>
        <legend className="text-lg font-semibold text-gray-900 mb-2">Assignment</legend>
        <div className="flex items-center gap-3">
          <input
            id="escalatedToLawyer"
            type="checkbox"
            checked={escalatedToLawyer}
            onChange={(e) => setEscalatedToLawyer(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="escalatedToLawyer" className="text-sm font-medium text-gray-700 cursor-pointer">
            Escalated to Lawyer
          </label>
        </div>
      </fieldset>

      {/* Actions */}
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
              {isEditing ? "Saving..." : "Creating..."}
            </span>
          ) : isEditing ? "Save Changes" : "Create Case"}
        </button>
        <Link
          href="/cases"
          className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
