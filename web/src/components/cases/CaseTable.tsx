"use client";

import Link from "next/link";
import type { LegalCase } from "@/lib/types";
import CaseStatusBadge from "./CaseStatusBadge";
import RiskBadge from "./RiskBadge";
import DeadlineStatus from "./DeadlineStatus";

interface CaseTableProps {
  cases: LegalCase[];
}

export default function CaseTable({ cases }: CaseTableProps) {
  if (cases.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No cases found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Case ID
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Title
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Complainant Email
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Status
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Risk
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Deadline
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Next Action
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Assigned To
            </th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr
              key={c.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/cases/${c.caseId}`}
                  className="text-blue-600 hover:underline cursor-pointer font-medium"
                >
                  {c.caseId}
                </Link>
              </td>
              <td className="px-4 py-3 max-w-[200px] truncate text-gray-900">
                {c.title}
              </td>
              <td className="px-4 py-3 text-gray-600">{c.complainantEmail}</td>
              <td className="px-4 py-3">
                <CaseStatusBadge status={c.status} />
              </td>
              <td className="px-4 py-3">
                <RiskBadge level={c.riskLevel} />
              </td>
              <td className="px-4 py-3">
                <DeadlineStatus deadline={c.responseDeadline} />
              </td>
              <td className="px-4 py-3">
                {c.nextAction ? (
                  <div>
                    <p className="text-gray-900 truncate max-w-[160px]">{c.nextAction}</p>
                    {c.nextActionOwner?.name && (
                      <p className="text-xs text-gray-400">{c.nextActionOwner.name}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">&mdash;</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {c.assignedTo?.name || <span className="text-gray-400">&mdash;</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
