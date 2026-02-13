import React from "react";
import { redirect } from "next/navigation";
import { getAuthToken, getUserData } from "@/lib/cookie";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

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
    // fall back to cookie role if backend unreachable
  }

  if (!user) {
    redirect("/login");
  }

  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  return <>{children}</>;
}
