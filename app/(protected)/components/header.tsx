"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, BookOpen, Check, CheckCheck, Dumbbell, Menu, SmilePlus, X } from "lucide-react";
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

  const bellRef = useRef<HTMLDivElement>(null);

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
      
    } finally {
      setReminderLoading(false);
    }
  };

  useEffect(() => {
    const handler = () => {
     
      if (reminderOpen) fetchReminderNotifications();
    };
    window.addEventListener("reminder_notifications_updated", handler as EventListener);
    return () => window.removeEventListener("reminder_notifications_updated", handler as EventListener);

  }, [reminderOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setReminderOpen(false);
      }
    };
    if (reminderOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [reminderOpen]);

  const onLogout_unused = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    try {
      await handleLogout();

      showToast('Logging out...', 'success');
    } catch (error) {

      if (error && typeof error === 'object' && 'digest' in error && 
          typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
        
        showToast('Logging out...', 'success');
        return;
      }
      // Real error occurred
      console.error("Logout failed:", error);
      showToast('Logout failed. Please try again.', 'error');
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
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("toggle_sidebar"))}
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(216,149,155,0.2)",
            borderRadius: "12px",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#6b7280",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(242,209,212,0.4)";
            e.currentTarget.style.color = "#344C3D";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.8)";
            e.currentTarget.style.color = "#6b7280";
          }}
          title="Toggle sidebar"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
        <div>
          <img
            src="/novacane.png"
            alt="Novana logo"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "fill",
            }}
          />
        </div>
      </div>



      {/* Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Reminders */}
        <div style={{ position: "relative" }} ref={bellRef}>
          <button
            style={{
              background: reminderOpen ? "rgba(242,209,212,0.5)" : "rgba(255,255,255,0.8)",
              border: `1px solid ${reminderOpen ? "rgba(216,149,155,0.4)" : "rgba(216,149,155,0.2)"}`,
              borderRadius: "14px",
              width: "46px",
              height: "46px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: reminderOpen ? "#D8959B" : "#6b7280",
              transition: "all 0.2s ease",
              position: "relative" as const,
              boxShadow: reminderOpen ? "0 6px 20px rgba(216,149,155,0.2)" : "0 4px 12px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              if (!reminderOpen) {
                e.currentTarget.style.background = "rgba(242,209,212,0.4)";
                e.currentTarget.style.color = "#D8959B";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(216,149,155,0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (!reminderOpen) {
                e.currentTarget.style.background = "rgba(255,255,255,0.8)";
                e.currentTarget.style.color = "#6b7280";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
              }
            }}
            onClick={() => {
              const next = !reminderOpen;
              setReminderOpen(next);
              if (next) fetchReminderNotifications();
            }}
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={2} />
            {/* Unread badge */}
            {(() => {
              const unreadCount = reminderNotifications.filter((n) => !n?.readAt).length;
              return unreadCount > 0 ? (
                <div style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "9px",
                  background: "#D8959B",
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "white",
                  padding: "0 3px",
                  lineHeight: 1,
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              ) : null;
            })()}
          </button>

          {reminderOpen && (
            <div
              style={{
                position: "absolute",
                top: 54,
                right: 0,
                width: 380,
                borderRadius: 20,
                background: "#ffffff",
                border: "1px solid rgba(216,149,155,0.18)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(216,149,155,0.1)",
                overflow: "hidden",
                zIndex: 120,
              }}
            >
              {/* Panel Header */}
              <div style={{
                padding: "16px 18px 14px",
                background: "linear-gradient(135deg, #1E3A2F 0%, #3D6B4F 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Bell size={16} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "white", fontSize: 15, fontFamily: "Georgia, serif" }}>Notifications</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>
                      {(() => {
                        const u = reminderNotifications.filter((n) => !n?.readAt).length;
                        return u > 0 ? `${u} unread` : "All caught up";
                      })()}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={async () => {
                      try {
                        const token = window.localStorage.getItem("token");
                        if (!token) return;
                        await fetch(API.REMINDERS.MARK_ALL_NOTIFICATIONS_READ, {
                          method: "PATCH",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        fetchReminderNotifications();
                        window.dispatchEvent(new CustomEvent("reminder_notifications_updated"));
                      } catch {
                        showToast("Failed to update notifications", "error", "top");
                      }
                    }}
                    disabled={reminderLoading || reminderNotifications.length === 0 || reminderNotifications.every((n) => !!n?.readAt)}
                    title="Mark all as read"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: 10,
                      padding: "7px 10px",
                      cursor: reminderLoading || reminderNotifications.length === 0 || reminderNotifications.every((n) => !!n?.readAt) ? "not-allowed" : "pointer",
                      color: "rgba(255,255,255,0.85)",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 700,
                      opacity: reminderLoading || reminderNotifications.length === 0 || reminderNotifications.every((n) => !!n?.readAt) ? 0.5 : 1,
                    }}
                  >
                    <CheckCheck size={13} />
                    Read all
                  </button>
                  <button
                    onClick={() => setReminderOpen(false)}
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 8,
                      width: 30,
                      height: 30,
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label="Close notifications"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {reminderLoading && (
                  <div style={{ padding: "24px 18px", color: "#6b7280", fontWeight: 600, textAlign: "center", fontSize: 14 }}>
                    Loading…
                  </div>
                )}

                {!reminderLoading && reminderNotifications.length === 0 && (
                  <div style={{ padding: "32px 18px", textAlign: "center" }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: "rgba(216,149,155,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 12px",
                    }}>
                      <Bell size={24} color="#D8959B" strokeWidth={1.5} />
                    </div>
                    <div style={{ fontWeight: 700, color: "#374151", fontSize: 14, marginBottom: 4 }}>No notifications</div>
                    <div style={{ color: "#9ca3af", fontSize: 12 }}>You're all caught up!</div>
                  </div>
                )}

                {!reminderLoading && reminderNotifications.map((n, idx) => {
                  const typeLabel = n?.type === "mood" ? "Mood" : n?.type === "exercise" ? "Exercise" : "Journal";
                  const typeColor = n?.type === "mood" ? "#D8959B" : n?.type === "exercise" ? "#3D6B4F" : "#829672";
                  const TypeIcon = n?.type === "mood" ? SmilePlus : n?.type === "exercise" ? Dumbbell : BookOpen;
                  const when = n?.scheduledFor
                    ? new Date(n.scheduledFor).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                    : (n?.deliveredAt ? new Date(n.deliveredAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
                  const isLast = idx === reminderNotifications.length - 1;
                  return (
                    <div
                      key={n._id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.05)",
                        background: n?.readAt ? "transparent" : "rgba(130,150,114,0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "background 0.15s",
                      }}
                    >
                      {/* Type icon */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                        background: `${typeColor}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: typeColor,
                        border: `1px solid ${typeColor}30`,
                      }}>
                        <TypeIcon size={16} strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: n?.readAt ? 600 : 800,
                          color: n?.readAt ? "#6b7280" : "#111827",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                          {n.title}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "white",
                            background: typeColor, padding: "1px 7px", borderRadius: 999,
                            textTransform: "capitalize" as const,
                          }}>{typeLabel}</span>
                          {when && <span style={{ fontSize: 11, color: "#9ca3af" }}>{when}</span>}
                          {!n?.readAt && (
                            <span style={{
                              width: 6, height: 6, borderRadius: "50%",
                              background: "#D8959B", flexShrink: 0,
                            }} />
                          )}
                        </div>
                      </div>

                      {/* Mark as read */}
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
                              window.dispatchEvent(new CustomEvent("reminder_notifications_updated"));
                            } catch {
                              showToast("Failed to update notification", "error", "top");
                            }
                          }}
                          title="Mark as read"
                          style={{
                            background: "rgba(130,150,114,0.1)",
                            border: "1px solid rgba(130,150,114,0.25)",
                            borderRadius: 8,
                            width: 30, height: 30,
                            cursor: "pointer",
                            color: "#3D6B4F",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                          aria-label="Mark as read"
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              {reminderNotifications.length > 0 && (
                <div style={{
                  padding: "12px 16px",
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  background: "#fafafa",
                }}>
                  <button
                    onClick={() => {
                      setReminderOpen(false);
                      router.push("/reminders?history=1");
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      border: "1px solid rgba(30,58,47,0.15)",
                      background: "linear-gradient(135deg, #1E3A2F 0%, #3D6B4F 100%)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                    }}
                  >
                    <BookOpen size={14} />
                    View Full History
                  </button>
                </div>
              )}
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


      </div>
    </header>
  );
}