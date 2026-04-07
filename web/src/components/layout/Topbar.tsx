"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/api";
import type { User } from "@/lib/types";

const breadcrumbMap: Record<string, string> = {
  "/": "Dashboard",
  "/cases": "Legal Cases",
  "/opt-in": "Opt-In Requests",
  "/settings": "Settings",
};

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  if (pathname === "/") {
    return [{ label: "Dashboard", href: "/" }];
  }

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = "";

  for (const segment of segments) {
    path += `/${segment}`;
    const label = breadcrumbMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

interface TopbarProps {
  user: User;
}

export default function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  const handleLogout = async () => {
    try {
      await auth.logout();
    } finally {
      window.location.href = "/login";
    }
  };

  const initial = user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center">
            {i > 0 && <span className="mx-2">/</span>}
            <span className={i === breadcrumbs.length - 1 ? "text-gray-900 font-medium" : ""}>
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700 hidden sm:inline">{user.name}</span>

        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
            {initial}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
