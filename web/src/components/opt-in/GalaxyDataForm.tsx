"use client";

import { useCallback } from "react";

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

interface GalaxyDataFormProps {
  data: Record<string, unknown> | null;
  onChange: (data: Record<string, unknown>) => void;
}

export default function GalaxyDataForm({ data, onChange }: GalaxyDataFormProps) {
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
            Send Date
          </label>
          <input
            id="galaxy-sendDate"
            type="date"
            value={(current.sendDate as string) ?? ""}
            onChange={(e) => update("sendDate", e.target.value)}
            className={inputClass + " cursor-pointer"}
          />
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
            Confirmation Email Sent
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

      <div>
        <label htmlFor="galaxy-openEvents" className={labelClass}>
          Open Events (timestamps)
        </label>
        <textarea
          id="galaxy-openEvents"
          value={(current.openEvents as string) ?? ""}
          onChange={(e) => update("openEvents", e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="One timestamp per line, e.g. 2026-01-15T10:30:00Z"
        />
      </div>

      <div>
        <label htmlFor="galaxy-clickEvents" className={labelClass}>
          Click Events (timestamps)
        </label>
        <textarea
          id="galaxy-clickEvents"
          value={(current.clickEvents as string) ?? ""}
          onChange={(e) => update("clickEvents", e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="One timestamp per line, e.g. 2026-01-15T11:00:00Z"
        />
      </div>

      <div>
        <label htmlFor="galaxy-unsubscribeEvent" className={labelClass}>
          Unsubscribe Event
        </label>
        <input
          id="galaxy-unsubscribeEvent"
          type="text"
          value={(current.unsubscribeEvent as string) ?? ""}
          onChange={(e) => update("unsubscribeEvent", e.target.value)}
          className={inputClass}
          placeholder="e.g. 2026-02-01T09:15:00Z"
        />
      </div>
    </div>
  );
}
