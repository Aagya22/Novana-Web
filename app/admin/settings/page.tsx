import { getAuthToken, getUserData } from "@/lib/cookie";
import React from "react";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  const user = await getUserData();
  const token = await getAuthToken();

  return (
    <div className="p-8">
      <SettingsClient adminUser={user} token={token || ""} />
    </div>
  );
}
