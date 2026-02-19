"use client";

import React, { useEffect, useState } from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { handleLogout } from "@/lib/actions/auth-action";
import { showToast } from "@/lib/toast";
import { API } from "@/lib/api/endpoints";

function readUserDataFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + "user_data" + "=([^;]+)"));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch (e) {
    return null;
  }
}

export default function Header() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderNotifications, setReminderNotifications] = useState<any[]>([]);

  useEffect(() => {
    const u = readUserDataFromCookie();
    if (u) setUser(u);
    const handler = (e: any) => {
      const detail = e?.detail;
      if (detail) {
        setUser(detail);
        return;
      }
      const updated = readUserDataFromCookie();
      if (updated) setUser(updated);
    };

    window.addEventListener("user_data_updated", handler as EventListener);
    // also listen to storage events in case another tab updated cookie via localStorage
    const storageHandler = (ev: StorageEvent) => {
      if (ev.key === "user_data") {
        try {
          const parsed = ev.newValue ? JSON.parse(ev.newValue) : null;
          if (parsed) setUser(parsed);
        } catch (e) {
          // ignore
        }
      }
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("user_data_updated", handler as EventListener);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const fetchReminderNotifications = async () => {
    try {
      setReminderLoading(true);
      const token = window.localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(API.REMINDERS.NOTIFICATIONS(20), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      if (payload?.success && Array.isArray(payload?.data)) {
        setReminderNotifications(payload.data);
      }
    } catch {
      // ignore
    } finally {
      setReminderLoading(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      // refresh list when poller delivers items
      if (reminderOpen) fetchReminderNotifications();
    };
    window.addEventListener("reminder_notifications_updated", handler as EventListener);
    return () => window.removeEventListener("reminder_notifications_updated", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderOpen]);

  const onLogout = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    try {
      setIsLoggingOut(true);
      await handleLogout();
      // If we reach here, logout succeeded (though redirect should happen first)
      showToast('Logging out...', 'success');
    } catch (error) {
      // Check if it's a Next.js redirect error (expected)
      if (error && typeof error === 'object' && 'digest' in error && 
          typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
        // This is the expected redirect, not a real error
        showToast('Logging out...', 'success');
        return;
      }
      // Real error occurred
      console.error("Logout failed:", error);
      showToast('Logout failed. Please try again.', 'error');
      setIsLoggingOut(false);
    }
  };

  const uploadAvatar = () => router.push("/settings");

  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  const initials = (() => {
    const name = user?.fullName || user?.username || "U";
    return name
      .split(" ")
      .map((s: string) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  })();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "80px",
        padding: "0 40px",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(216,149,155,0.2)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(216,149,155,0.1)",
      }}
    >
      {/* Logo Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #344C3D, #829672)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "20px",
          fontWeight: "700",
          boxShadow: "0 4px 16px rgba(52,76,61,0.3)",
          overflow: "hidden"
        }}>
          <img 
            src="/novacane.png" 
            alt="Novana logo"
            style={{
              width: "40px",
              height: "40px",
              objectFit: "contain"
            }}
          />
        </div>
        <div>
          <div style={{
            fontSize: "18px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #344C3D, #829672)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: "1"
          }}>
            Novana
          </div>
          <div style={{
            fontSize: "12px",
            color: "#6b7280",
            fontWeight: "500",
            marginTop: "2px"
          }}>
            Wellness Platform
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "rgba(242,209,212,0.3)",
          border: "1px solid rgba(216,149,155,0.3)",
          borderRadius: "16px",
          padding: "12px 20px",
          width: "400px",
          transition: "all 0.3s ease",
          color: "#6b7280",
        }}
      >
        <Search size={18} strokeWidth={2} />
        <input
          type="text"
          placeholder="Search wellness content..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#1f2937",
            fontSize: "14px",
            width: "100%",
            fontFamily: "'Inter', sans-serif",
            fontWeight: "500",
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Reminders */}
        <div style={{ position: "relative" }}>
        <button
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(216,149,155,0.2)",
            borderRadius: "14px",
            width: "46px",
            height: "46px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#6b7280",
            transition: "all 0.3s ease",
            position: "relative" as const,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(242,209,212,0.4)";
            e.currentTarget.style.color = "#D8959B";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(216,149,155,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.8)";
            e.currentTarget.style.color = "#6b7280";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
          }}
          onClick={() => {
            const next = !reminderOpen;
            setReminderOpen(next);
            if (next) fetchReminderNotifications();
          }}
        >
          <Bell size={22} strokeWidth={2} />
          {/* simple badge when there are unread notifications */}
          {reminderNotifications.some((n) => !n?.readAt) && (
            <div style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#D8959B",
              border: "2px solid white"
            }} />
          )}
        </button>

        {reminderOpen && (
          <div
            style={{
              position: "absolute",
              top: 56,
              right: 0,
              width: 340,
              borderRadius: 16,
              background: "rgba(255,255,255,0.96)",
              border: "1px solid rgba(216,149,155,0.2)",
              boxShadow: "0 16px 60px rgba(0,0,0,0.15)",
              overflow: "hidden",
              zIndex: 120,
            }}
          >
            <div style={{
              padding: "14px 14px 10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(216,149,155,0.12)",
            }}>
              <div style={{ fontWeight: 800, color: "#111827" }}>Reminders</div>
              <button
                onClick={() => router.push("/reminders")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#344C3D",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                View
              </button>
            </div>

            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {reminderLoading && (
                <div style={{ padding: 14, color: "#6b7280", fontWeight: 600 }}>Loading…</div>
              )}

              {!reminderLoading && reminderNotifications.length === 0 && (
                <div style={{ padding: 14, color: "#6b7280", fontWeight: 600 }}>No reminders yet.</div>
              )}

              {!reminderLoading && reminderNotifications.map((n) => {
                const type = n?.type === "mood" ? "Mood" : n?.type === "exercise" ? "Exercise" : "Journal";
                const when = n?.scheduledFor
                  ? new Date(n.scheduledFor).toLocaleString()
                  : (n?.deliveredAt ? new Date(n.deliveredAt).toLocaleString() : "");
                return (
                  <div
                    key={n._id}
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                      background: n?.readAt ? "transparent" : "rgba(130,150,114,0.08)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginTop: 2 }}>
                          {type}{when ? ` • ${when}` : ""}
                        </div>
                      </div>

                      {!n?.readAt && (
                        <button
                          onClick={async () => {
                            try {
                              const token = window.localStorage.getItem("token");
                              if (!token) return;
                              await fetch(API.REMINDERS.MARK_NOTIFICATION_READ(n._id), {
                                method: "PATCH",
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              fetchReminderNotifications();
                            } catch {
                              showToast("Failed to update notification", "error", "top");
                            }
                          }}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(0,0,0,0.10)",
                            borderRadius: 10,
                            padding: "8px 10px",
                            cursor: "pointer",
                            fontWeight: 800,
                            color: "#344C3D",
                            height: 34,
                          }}
                        >
                          Read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>

        {/* User Avatar */}
        <div style={{ position: "relative" }}>
          <button
            onClick={uploadAvatar}
            disabled={isUploading}
            title={user?.fullName || "Change avatar"}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              overflow: "hidden",
              border: "2px solid rgba(216,149,155,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isUploading ? "not-allowed" : "pointer",
              background: "rgba(255,255,255,0.9)",
              padding: 0,
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(216,149,155,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(216,149,155,0.3)";
              e.currentTarget.style.borderColor = "rgba(216,149,155,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(216,149,155,0.2)";
              e.currentTarget.style.borderColor = "rgba(216,149,155,0.3)";
            }}
          >
            {user?.imageUrl ? (
              <img
                src={`${backendBase}${user.imageUrl}`}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#fff",
                  background: "linear-gradient(135deg, #D8959B, #829672)",
                  fontFamily: "'Inter', serif",
                }}
              >
                {initials}
              </span>
            )}
          </button>
          
          {/* Online status indicator */}
          <div style={{
            position: "absolute",
            bottom: "2px",
            right: "2px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#10b981",
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }} />
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 20px",
            borderRadius: "14px",
            background: isLoggingOut 
              ? "rgba(156,163,175,0.2)" 
              : "rgba(255,255,255,0.8)",
            border: "1px solid rgba(216,149,155,0.2)",
            color: isLoggingOut ? "#9ca3af" : "#6b7280",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isLoggingOut ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            opacity: isLoggingOut ? 0.6 : 1,
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
          onMouseEnter={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#dc2626";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(239,68,68,0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.background = "rgba(255,255,255,0.8)";
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.borderColor = "rgba(216,149,155,0.2)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
            }
          }}
        >
          <LogOut size={18} strokeWidth={2} />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}