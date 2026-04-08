"use client";

import { usePathname } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import { auth } from "@/lib/api";
import type { User } from "@/lib/types";

const labelMap: Record<string, string> = {
  "/": "Dashboard",
  "/cases": "Legal Cases",
  "/cases/new": "New Case",
  "/opt-in": "Opt-In Requests",
  "/opt-in/new": "New Opt-In Request",
  "/due-diligence": "Due Diligence",
  "/settings": "Settings",
};

function getPageLabel(pathname: string): string {
  if (labelMap[pathname]) return labelMap[pathname];
  if (pathname.startsWith("/cases/")) return "Legal Cases";
  if (pathname.startsWith("/opt-in/")) return "Opt-In Requests";
  return "Dashboard";
}

interface TopbarProps {
  user: User;
}

export default function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const label = getPageLabel(pathname);

  const handleLogout = async () => {
    try {
      await auth.logout();
    } finally {
      window.location.href = "/login";
    }
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-6 py-3"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <span className="text-sm font-semibold" style={{ color: "#4a5568" }}>
        {label}
      </span>

      <div className="flex items-center gap-4">
        <Search size={16} style={{ color: "#a0aec0", cursor: "pointer" }} />

        <div className="flex items-center gap-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{
                background: "rgba(61,180,140,0.13)",
                color: "#3db48c",
              }}
            >
              {initials}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer transition-colors"
            style={{ color: "#a0aec0" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#4a5568")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#a0aec0")}
            aria-label="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
