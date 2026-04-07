"use client";

import Link from "next/link";
import type { OptInRequest } from "@/lib/types";
import OptInStatusBadge from "./OptInStatusBadge";

interface OptInTableProps {
  requests: OptInRequest[];
}

export default function OptInTable({ requests }: OptInTableProps) {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No opt-in requests found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Request ID
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Email Address
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Requested By
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Status
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Date Requested
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Linked Case
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/opt-in/${r.id}`}
                  className="text-blue-600 hover:underline cursor-pointer font-medium"
                >
                  {r.requestId}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{r.emailAddress}</td>
              <td className="px-4 py-3 text-gray-600">
                {r.requestedBy?.name ?? <span className="text-gray-400">&mdash;</span>}
              </td>
              <td className="px-4 py-3">
                <OptInStatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(r.dateRequested).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-3">
                {r.linkedCase ? (
                  <Link
                    href={`/cases/${r.linkedCase.id}`}
                    className="text-blue-600 hover:underline cursor-pointer text-sm"
                  >
                    {r.linkedCase.caseId}
                  </Link>
                ) : (
                  <span className="text-gray-400">&mdash;</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
