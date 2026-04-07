"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const error = searchParams.get("error");

  useEffect(() => {
    auth
      .me()
      .then(() => {
        router.replace("/");
      })
      .catch(() => {
        setChecking(false);
      });
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">AudienceServ</h1>
        <p className="text-sm text-gray-500 mt-1">Legal Hub</p>

        {error === "unauthorized" && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Access denied. Your account is not authorized.
          </div>
        )}

        <a
          href={auth.loginUrl()}
          className="mt-6 inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 cursor-pointer transition-colors duration-200"
        >
          Sign in with Google
        </a>

        <p className="mt-6 text-xs text-gray-400">
          Access restricted to authorized Audience Serv team members.
        </p>
      </div>
    </div>
  );
}
