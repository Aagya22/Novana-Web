import React from "react";
import { getAuthToken, getUserData } from "@/lib/cookie";
import { redirect } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const token = await getAuthToken();

  if (!token) redirect("/login");

  const base =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5050";

  let user = await getUserData();
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
    // If backend is unreachable, fall back to cookie role.
  }

  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/home");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminSidebar adminUser={user} />
      <div className="flex flex-col">
        <AdminHeader adminUser={user} />
        <main className="ml-0">{children}</main>
      </div>
    </div>
  );
}
