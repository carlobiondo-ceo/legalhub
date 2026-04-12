"use client";

import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

interface GalaxyDataFormProps {
  data: Record<string, unknown> | null;
  onChange: (data: Record<string, unknown>) => void;
  /** Called when user uploads a file for an event field (sent/open/click/unsub) */
  onFileUpload?: (field: string, file: File) => void;
}

export default function GalaxyDataForm({ data, onChange, onFileUpload }: GalaxyDataFormProps) {
  const current = data ?? {};

  const update = useCallback(
    (field: string, value: unknown) => {
      onChange({ ...current, [field]: value });
    },
    [current, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="galaxy-sendDate" className={labelClass}>
            Campaign Send Date
          </label>
          <input
            id="galaxy-sendDate"
            type="date"
            value={(current.sendDate as string) ?? ""}
            onChange={(e) => update("sendDate", e.target.value)}
            className={inputClass + " cursor-pointer"}
          />
          <p className="text-xs text-gray-500 mt-1">Date the mailing that triggered the complaint was sent.</p>
        </div>

        <div>
          <label htmlFor="galaxy-ipAddress" className={labelClass}>
            IP Address
          </label>
          <input
            id="galaxy-ipAddress"
            type="text"
            value={(current.ipAddress as string) ?? ""}
            onChange={(e) => update("ipAddress", e.target.value)}
            className={inputClass}
            placeholder="e.g. 192.168.1.1"
          />
        </div>

        <div>
          <label htmlFor="galaxy-optInMethod" className={labelClass}>
            Opt-In Method
          </label>
          <select
            id="galaxy-optInMethod"
            value={(current.optInMethod as string) ?? ""}
            onChange={(e) => update("optInMethod", e.target.value)}
            className={inputClass + " cursor-pointer"}
          >
            <option value="">-- Select --</option>
            <option value="double_opt_in">Double Opt-In</option>
            <option value="single_opt_in">Single Opt-In</option>
          </select>
        </div>

        <div>
          <label htmlFor="galaxy-confirmationEmailSent" className={labelClass}>
            DOI Confirmation Email Sent?
          </label>
          <select
            id="galaxy-confirmationEmailSent"
            value={(current.confirmationEmailSent as string) ?? ""}
            onChange={(e) => update("confirmationEmailSent", e.target.value)}
            className={inputClass + " cursor-pointer"}
          >
            <option value="">-- Select --</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Was a double opt-in confirmation email sent to the subscriber at signup?</p>
        </div>

        <div>
          <label htmlFor="galaxy-soiTimestamp" className={labelClass}>
            SOI Timestamp
          </label>
          <input
            id="galaxy-soiTimestamp"
            type="datetime-local"
            value={(current.soiTimestamp as string) ?? ""}
            onChange={(e) => update("soiTimestamp", e.target.value)}
            className={inputClass + " cursor-pointer"}
          />
          <p className="text-xs text-gray-500 mt-1">Single opt-in time (subscription form submitted).</p>
        </div>

        <div>
          <label htmlFor="galaxy-doiTimestamp" className={labelClass}>
            DOI Timestamp
          </label>
          <input
            id="galaxy-doiTimestamp"
            type="datetime-local"
            value={(current.doiTimestamp as string) ?? ""}
            onChange={(e) => update("doiTimestamp", e.target.value)}
            className={inputClass + " cursor-pointer"}
          />
          <p className="text-xs text-gray-500 mt-1">Double opt-in time (confirmation link clicked).</p>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="galaxy-listSource" className={labelClass}>
            List Source / Partner
          </label>
          <input
            id="galaxy-listSource"
            type="text"
            value={(current.listSource as string) ?? ""}
            onChange={(e) => update("listSource", e.target.value)}
            className={inputClass}
            placeholder="e.g. Partner name or list source"
          />
        </div>
      </div>

      <EventField
        id="galaxy-sentEvents"
        label="Sent Events"
        value={(current.sentEvents as string) ?? ""}
        onChange={(v) => update("sentEvents", v)}
        onFileUpload={onFileUpload ? (f) => onFileUpload("sentEvents", f) : undefined}
        placeholder="One timestamp per line, e.g. 2026-01-15T09:00:00Z"
      />

      <EventField
        id="galaxy-openEvents"
        label="Open Events"
        value={(current.openEvents as string) ?? ""}
        onChange={(v) => update("openEvents", v)}
        onFileUpload={onFileUpload ? (f) => onFileUpload("openEvents", f) : undefined}
        placeholder="One timestamp per line, e.g. 2026-01-15T10:30:00Z"
      />

      <EventField
        id="galaxy-clickEvents"
        label="Click Events"
        value={(current.clickEvents as string) ?? ""}
        onChange={(v) => update("clickEvents", v)}
        onFileUpload={onFileUpload ? (f) => onFileUpload("clickEvents", f) : undefined}
        placeholder="One timestamp per line, e.g. 2026-01-15T11:00:00Z"
      />

      <EventField
        id="galaxy-unsubscribeEvent"
        label="Unsubscribe Event"
        value={(current.unsubscribeEvent as string) ?? ""}
        onChange={(v) => update("unsubscribeEvent", v)}
        onFileUpload={onFileUpload ? (f) => onFileUpload("unsubscribeEvent", f) : undefined}
        placeholder="e.g. 2026-02-01T09:15:00Z"
      />
    </div>
  );
}

/** Event field with textarea + optional file upload button */
function EventField({
  id,
  label,
  value,
  onChange,
  onFileUpload,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFileUpload?: (file: File) => void;
  placeholder: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // If it's a text/csv, read and append to textarea
    if (file.type === "text/csv" || file.name.endsWith(".csv") || file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const combined = value ? value + "\n" + text.trim() : text.trim();
        onChange(combined);
      };
      reader.readAsText(file);
    } else if (onFileUpload) {
      // For non-text files (screenshots, exports), upload as document
      onFileUpload(file);
    }

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
          title="Upload CSV/text file or screenshot"
        >
          <Upload size={12} />
          Upload file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt,.xlsx,.png,.jpg,.jpeg,.pdf"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={inputClass}
        placeholder={placeholder}
      />
    </div>
  );
}
