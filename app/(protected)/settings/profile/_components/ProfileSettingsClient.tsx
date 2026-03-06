"use client";

import { useEffect, useState } from "react";
import UpdateUserForm from "../../components/updateform";
import AxiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import type { User } from "@/app/(auth)/schema";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function normalizeUser(raw: unknown): User | null {
  if (!isRecord(raw)) return null;
  const _id = raw._id ?? raw.id;
  if (!_id) return null;

  const imageUrlRaw = raw.imageUrl;
  const imageUrl = typeof imageUrlRaw === "string" ? imageUrlRaw : imageUrlRaw === null ? null : null;

  return {
    _id: String(_id),
    email: String(raw.email ?? ""),
    fullName: String(raw.fullName ?? ""),
    username: String(raw.username ?? ""),
    phoneNumber: String(raw.phoneNumber ?? ""),
    role: raw.role === "admin" ? "admin" : "user",
    imageUrl,
  };
}

export default function ProfileSettingsClient() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await AxiosInstance.get(API.AUTH.WHOAMI);
        const u = normalizeUser(res?.data?.data);
        if (!mounted) return;
        setUser(u);
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "32px",
          border: "1px solid rgba(30,58,47,0.08)",
          boxShadow: "0 2px 12px rgba(30,58,47,0.06)",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "32px",
          border: "1px solid rgba(30,58,47,0.08)",
          boxShadow: "0 2px 12px rgba(30,58,47,0.06)",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        Unable to load profile.
      </div>
    );
  }

  return <UpdateUserForm user={user} />;
}
