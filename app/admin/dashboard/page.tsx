import { getAuthToken, getUserData } from "@/lib/cookie";
import { redirect } from "next/navigation";
import React from "react";
import AdminDashboardClient from "./admindashboardclient";


async function fetchUsers(token: string) {
  const base = process.env.API_BASE_URL || "http://localhost:5050";
  const res = await fetch(`${base}/api/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch users: ${res.status} ${text}`);
  }
  return res.json();
}

export default async function AdminDashboardPage() {
  const user = await getUserData();
  const token = await getAuthToken();

  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }

  let users = [] as any[];
  try {
    const data = await fetchUsers(token || "");
    users = data.data || [];
  } catch (err) {
    console.error(err);
  }

  return <AdminDashboardClient initialUsers={users} adminUser={user} token={token || ""} />;
}