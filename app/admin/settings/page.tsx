import { getAuthToken, getUserData } from "@/lib/cookie";
import React from "react";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  let user = await getUserData();
  const token = await getAuthToken();

  if (token) {
    const base =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:5050";

    try {
      const res = await fetch(`${base}/api/auth/whoami`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload?.success && payload?.data) {
          user = payload.data;
        }
      }
    } catch {
      // Fall back to cookie user if backend is temporarily unreachable.
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <SettingsClient adminUser={user} token={token || ""} />
    </div>
  );
}
