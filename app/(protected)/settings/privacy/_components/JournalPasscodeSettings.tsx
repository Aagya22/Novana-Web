"use client";

import React, { useEffect, useState } from "react";
import { Shield, Lock, Unlock, KeyRound, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import AxiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export default function JournalPasscodeSettings() {
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

  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [passcode, setPasscode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"enable" | "change" | "disable" | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance.get(API.AUTH.JOURNAL_PASSCODE_STATUS);
      const data = res.data;
      const nextEnabled = Boolean(data?.data?.enabled);
      setEnabled(nextEnabled);
      setMode(nextEnabled ? null : "enable");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load journal passcode status");
      setEnabled(false);
      setMode("enable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const clearLocalUnlock = () => {
    try {
      window.sessionStorage.removeItem("journal_access_token");
      window.sessionStorage.removeItem("journal_access_token_expires_at");
    } catch {
      // ignore
    }
  };

  const resetFields = () => {
    setPasscode("");
    setConfirm("");
    setPassword("");
  };

  const onSet = async (e: React.FormEvent) => {
    e.preventDefault();

    const p = passcode.trim();
    const c = confirm.trim();

    if (!/^\d{4,8}$/.test(p)) {
      toast.error("Passcode must be 4–8 digits");
      return;
    }

    if (p !== c) {
      toast.error("Passcodes do not match");
      return;
    }

    if (!password.trim()) {
      toast.error("Enter your account password to continue");
      return;
    }

    setSaving(true);
    try {
      const res = await AxiosInstance.put(API.AUTH.JOURNAL_PASSCODE_SET, { passcode: p, password: password });
      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to set journal passcode");
        return;
      }

      clearLocalUnlock();
      resetFields();
      toast.success(enabled ? "Journal passcode updated" : "Journal passcode enabled");
      await loadStatus();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to set journal passcode");
    } finally {
      setSaving(false);
    }
  };

  const onClear = async () => {
    if (!password.trim()) {
      toast.error("Enter your account password to continue");
      return;
    }

    setSaving(true);
    try {
      const res = await AxiosInstance.delete(API.AUTH.JOURNAL_PASSCODE_CLEAR, { data: { password: password } });
      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to clear journal passcode");
        return;
      }

      clearLocalUnlock();
      resetFields();
      toast.success("Journal passcode disabled");
      await loadStatus();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to clear journal passcode");
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
          <Shield size={22} color={C.sage} strokeWidth={1.8} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: C.text }}>Journal Passcode</div>
          <div style={{ fontSize: "13px", color: C.muted, marginTop: "3px" }}>
            Add an extra lock before journal entries can be viewed.
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          padding: "12px 14px",
          borderRadius: "14px",
          border: `1px solid ${C.border}`,
          background: C.soft,
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          {enabled ? <Lock size={18} color={C.forest} /> : <Unlock size={18} color={C.sage} />}
          <div style={{ display: "grid", gap: "2px", minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: C.text }}>
              {loading ? "Status: Loading..." : enabled ? "Enabled" : "Disabled"}
            </div>
            <div style={{ fontSize: "12px", color: C.muted, lineHeight: 1.4 }}>
              {enabled ? "Journal access requires your passcode." : "No passcode required."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {enabled ? (
            <>
              <button
                type="button"
                onClick={() => {
                  resetFields();
                  setMode(mode === "change" ? null : "change");
                }}
                disabled={saving || loading}
                style={{
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: `1px solid ${C.border}`,
                  background: C.card,
                  color: C.forest,
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: saving || loading ? "not-allowed" : "pointer",
                }}
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => {
                  resetFields();
                  setMode(mode === "disable" ? null : "disable");
                }}
                disabled={saving || loading}
                style={{
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: `1px solid ${C.blush}`,
                  background: "rgba(216,149,155,0.12)",
                  color: C.forest,
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: saving || loading ? "not-allowed" : "pointer",
                }}
              >
                Disable
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                resetFields();
                setMode("enable");
              }}
              disabled={saving || loading}
              style={{
                padding: "10px 12px",
                borderRadius: "12px",
                border: "none",
                background: C.forest,
                color: "white",
                fontWeight: 800,
                fontSize: "13px",
                cursor: saving || loading ? "not-allowed" : "pointer",
                opacity: saving || loading ? 0.85 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <KeyRound size={16} color="white" />
              Enable
            </button>
          )}
        </div>
      </div>

      {(mode === "enable" || mode === "change") && (
        <form onSubmit={onSet} style={{ display: "grid", gap: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: C.text, marginBottom: "2px" }}>
            {mode === "enable" ? "Enable journal passcode" : "Change journal passcode"}
          </div>

          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            inputMode="numeric"
            type="password"
            placeholder="Passcode (4–8 digits)"
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
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            inputMode="numeric"
            type="password"
            placeholder="Confirm passcode"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder="Account password (required)"
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
              {saving ? "Saving..." : mode === "enable" ? "Enable" : "Update"}
            </button>
            {enabled && (
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  resetFields();
                  setMode(null);
                }}
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
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {mode === "disable" && (
        <div style={{ display: "grid", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle size={18} color={C.blush} />
            <div style={{ fontSize: "13px", fontWeight: 800, color: C.text }}>Disable journal passcode</div>
          </div>
          <div style={{ fontSize: "12px", color: C.muted, lineHeight: 1.6 }}>
            Disabling removes the extra lock. You’ll only need your normal login to access the journal.
          </div>

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder="Account password (required)"
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
              type="button"
              onClick={onClear}
              disabled={saving}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: "12px",
                border: `1px solid ${C.blush}`,
                background: "rgba(216,149,155,0.12)",
                color: C.forest,
                fontWeight: 800,
                fontSize: "14px",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.85 : 1,
              }}
            >
              {saving ? "Disabling..." : "Disable"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                resetFields();
                setMode(null);
              }}
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
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: "10px", fontSize: "12px", color: C.muted, lineHeight: 1.6 }}>
        You’ll be asked for this passcode when opening your journal. If you forget it, you can disable it with your account password.
      </div>
    </div>
  );
}
