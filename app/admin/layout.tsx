import React from "react";
import { getAuthToken, getUserData } from "@/lib/cookie";
import { redirect } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getUserData();
  const token = await getAuthToken();

  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminSidebar adminUser={user} />
      <main className="ml-0">{children}</main>
    </div>
  );
}
