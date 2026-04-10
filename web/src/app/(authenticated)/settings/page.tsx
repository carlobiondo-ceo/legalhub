"use client";

import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <SettingsIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-base font-medium text-gray-900 mb-2">Coming soon</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          User management, notification preferences, and platform configuration will live here.
        </p>
      </div>
    </div>
  );
}
