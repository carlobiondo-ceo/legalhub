"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthGuardProps {
  children: (user: User) => React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    auth
      .me()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        if (pathname !== "/login") {
          router.replace("/login");
        }
      });
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children(user)}</>;
}
