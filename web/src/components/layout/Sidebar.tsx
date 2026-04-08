"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, ShieldCheck, FileSearch, Settings, Menu, X, LogOut } from "lucide-react";

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
    <div className="flex flex-col h-full" style={{ background: "#1a2635" }}>
      {/* Logo header */}
      <div
        className="flex items-center gap-2.5 px-4 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Menu size={20} style={{ color: "rgba(255,255,255,0.45)" }} />
        <div>
          <div className="text-[13px] font-bold leading-tight text-white">AudienceServ</div>
          <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Legal Hub
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer mb-0.5 transition-colors duration-150"
              style={{
                background: active ? "rgba(61,180,140,0.16)" : "transparent",
                borderLeft: active ? "3px solid #3db48c" : "3px solid transparent",
                paddingLeft: active ? "7px" : "10px",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon
                size={16}
                style={{ color: active ? "#3db48c" : "rgba(255,255,255,0.5)", flexShrink: 0 }}
              />
              <span
                className="text-[13px] font-medium"
                style={{ color: active ? "#fff" : "rgba(255,255,255,0.6)" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Settings + logout */}
      <div className="px-2 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md cursor-pointer mb-0.5 transition-colors duration-150"
          style={{
            background: isActive("/settings") ? "rgba(61,180,140,0.16)" : "transparent",
            borderLeft: isActive("/settings")
              ? "3px solid #3db48c"
              : "3px solid transparent",
            paddingLeft: isActive("/settings") ? "7px" : "10px",
          }}
          onMouseEnter={(e) => {
            if (!isActive("/settings"))
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e) => {
            if (!isActive("/settings"))
              e.currentTarget.style.background = "transparent";
          }}
        >
          <Settings
            size={16}
            style={{
              color: isActive("/settings") ? "#3db48c" : "rgba(255,255,255,0.5)",
            }}
          />
          <span
            className="text-[13px] font-medium"
            style={{
              color: isActive("/settings") ? "#fff" : "rgba(255,255,255,0.6)",
            }}
          >
            Settings
          </span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-md cursor-pointer"
        style={{ background: "#1a2635", color: "#fff" }}
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
        className={`fixed inset-y-0 left-0 z-50 w-56 transform transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          className="absolute top-3 right-3 p-1 cursor-pointer z-10"
          style={{ color: "rgba(255,255,255,0.6)" }}
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-56 md:flex-col">
        {nav}
      </aside>
    </>
  );
}
