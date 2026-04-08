"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {(user) => (
        <div className="min-h-screen" style={{ background: "#eef2f7" }}>
          <Sidebar />
          <div className="md:pl-56">
            <Topbar user={user} />
            <main className="p-6">{children}</main>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
