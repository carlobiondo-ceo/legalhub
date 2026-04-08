"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, ShieldCheck, FileSearch, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Legal Cases", href: "/cases", icon: Briefcase },
  { label: "Opt-In Requests", href: "/opt-in", icon: ShieldCheck },
  { label: "Due Diligence", href: "/due-diligence", icon: FileSearch },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const nav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5">
        <h1 className="text-white text-lg font-semibold">AudienceServ</h1>
        <p className="text-sidebar-text text-sm">Legal Hub</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200",
                active
                  ? "bg-sidebar-hover text-sidebar-active"
                  : "text-sidebar-text hover:bg-sidebar-hover"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 pb-4">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200",
            isActive("/settings")
              ? "bg-sidebar-hover text-sidebar-active"
              : "text-sidebar-text hover:bg-sidebar-hover"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          Settings
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-md bg-sidebar-bg text-white cursor-pointer"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-sidebar-bg transform transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          className="absolute top-3 right-3 p-1 text-sidebar-text hover:text-white cursor-pointer"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col bg-sidebar-bg">
        {nav}
      </aside>
    </>
  );
}
