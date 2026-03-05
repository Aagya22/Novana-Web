"use client";

import React, { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import AxiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export default function ChangePasswordSettings() {
  const C = {
    forest: "#1E3A2F",
    forestMid: "#3D6B4F",
    sage: "#829672",
    blush: "#D8959B",
    card: "#FFFFFF",
    text: "#111827",
    muted: "rgba(31,41,55,0.55)",
    border: "rgba(30,58,47,0.08)",
    soft: "rgba(30,58,47,0.02)",
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      toast.error("Enter your current password");
      return;
    }

    if (newPassword.trim().length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setSaving(true);
    try {
      const res = await AxiosInstance.put(API.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully");
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "rgba(30,58,47,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <KeyRound size={22} color={C.sage} strokeWidth={1.8} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: C.text }}>Change Password</div>
          <div style={{ fontSize: "13px", color: C.muted, marginTop: "3px" }}>
            Update your account password to keep your account secure.
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "12px 14px",
          borderRadius: "14px",
          border: `1px solid ${C.border}`,
          background: C.soft,
          marginBottom: "16px",
          fontSize: "12px",
          color: C.muted,
          lineHeight: 1.6,
        }}
      >
        Password must be at least 8 characters. You’ll need your current password to confirm this change.
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "10px" }}>
        <input
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          placeholder="Current password"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "12px",
            border: `1px solid ${C.border}`,
            outline: "none",
            fontSize: "14px",
          }}
        />

        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "12px",
            border: `1px solid ${C.border}`,
            outline: "none",
            fontSize: "14px",
          }}
        />

        <input
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "12px",
            border: `1px solid ${C.border}`,
            outline: "none",
            fontSize: "14px",
          }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: "12px",
              border: "none",
              background: C.forest,
              color: "white",
              fontWeight: 800,
              fontSize: "14px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.85 : 1,
            }}
          >
            {saving ? "Updating..." : "Update Password"}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={reset}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: `1px solid ${C.border}`,
              background: C.card,
              color: C.text,
              fontWeight: 800,
              fontSize: "14px",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ fontSize: "12px", color: C.muted, lineHeight: 1.6 }}>
          If you’ve forgotten your password, use the “Forgot password?” link on the login page.
        </div>
      </form>
    </div>
  );
}
