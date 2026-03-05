"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, UserPlus, CheckCheck, Trash2, X } from "lucide-react";
import { API } from "@/lib/api/endpoints";

interface AdminHeaderProps {
  adminUser: any;
}

export default function AdminHeader({ adminUser }: AdminHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setNotifLoading(true);
    try {
      const res = await fetch(API.ADMIN_NOTIFICATIONS.LIST(50), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications);
        setUnreadCount(json.data.unreadCount);
      }
    } catch {
      // ignore
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Initial fetch + 30s polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Re-fetch when panel opens
  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen, fetchNotifications]);

  // Click-outside closes panel
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const markRead = async (id: string) => {
    const token = getToken();
    if (!token) return;
    await fetch(API.ADMIN_NOTIFICATIONS.MARK_READ(id), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    const token = getToken();
    if (!token) return;
    await fetch(API.ADMIN_NOTIFICATIONS.MARK_ALL_READ, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const clearAll = async () => {
    const token = getToken();
    if (!token) return;
    await fetch(API.ADMIN_NOTIFICATIONS.CLEAR, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications([]);
    setUnreadCount(0);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const initials = adminUser?.fullName
    ? adminUser.fullName
        .split(" ")
        .map((s: string) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

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
        borderBottom: "1px solid rgba(99,102,241,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(99,102,241,0.08)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src="/novacane.png"
          alt="Novana"
          style={{ width: "100px", height: "100px", objectFit: "fill" }}
        />
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
            }}
          >
            Admin Panel
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

        {/* Bell */}
        <div style={{ position: "relative" }} ref={bellRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Admin notifications"
            style={{
              background: notifOpen ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.8)",
              border: `1px solid ${notifOpen ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.2)"}`,
              borderRadius: "14px",
              width: "46px",
              height: "46px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: notifOpen ? "#6366f1" : "#6b7280",
              transition: "all 0.2s ease",
              position: "relative" as const,
              boxShadow: notifOpen
                ? "0 6px 20px rgba(99,102,241,0.2)"
                : "0 4px 12px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              if (!notifOpen) {
                e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                e.currentTarget.style.color = "#6366f1";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!notifOpen) {
                e.currentTarget.style.background = "rgba(255,255,255,0.8)";
                e.currentTarget.style.color = "#6b7280";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
              }
            }}
          >
            <Bell size={20} strokeWidth={2} />
            {unreadCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "9px",
                  background: "#6366f1",
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "white",
                  padding: "0 3px",
                  lineHeight: 1,
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                position: "absolute",
                top: 54,
                right: 0,
                width: 380,
                borderRadius: 20,
                background: "#ffffff",
                border: "1px solid rgba(99,102,241,0.15)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(99,102,241,0.1)",
                overflow: "hidden",
                zIndex: 120,
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  padding: "16px 18px 14px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Bell size={16} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "white",
                        fontSize: 15,
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      Notifications
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>
                      {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={markAllRead}
                    disabled={unreadCount === 0 || notifLoading}
                    title="Mark all as read"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: 10,
                      padding: "7px 10px",
                      cursor: unreadCount === 0 ? "not-allowed" : "pointer",
                      color: "rgba(255,255,255,0.85)",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 700,
                      opacity: unreadCount === 0 ? 0.5 : 1,
                    }}
                  >
                    <CheckCheck size={13} />
                    Read all
                  </button>

                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      title="Clear all"
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
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  <button
                    onClick={() => setNotifOpen(false)}
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
                    aria-label="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {notifLoading && notifications.length === 0 && (
                  <div
                    style={{
                      padding: "24px 18px",
                      color: "#6b7280",
                      fontWeight: 600,
                      textAlign: "center",
                      fontSize: 14,
                    }}
                  >
                    Loading…
                  </div>
                )}

                {!notifLoading && notifications.length === 0 && (
                  <div style={{ padding: "32px 18px", textAlign: "center" }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        background: "rgba(99,102,241,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <Bell size={24} color="#6366f1" strokeWidth={1.5} />
                    </div>
                    <div
                      style={{ fontWeight: 700, color: "#374151", fontSize: 14, marginBottom: 4 }}
                    >
                      No notifications
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: 12 }}>
                      You&apos;ll be notified when new users join
                    </div>
                  </div>
                )}

                {notifications.map((n, idx) => {
                  const isLast = idx === notifications.length - 1;
                  return (
                    <div
                      key={n._id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.05)",
                        background: n.readAt ? "transparent" : "rgba(99,102,241,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "background 0.15s",
                        cursor: n.readAt ? "default" : "pointer",
                      }}
                      onClick={() => { if (!n.readAt) markRead(n._id); }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 11,
                          flexShrink: 0,
                          background: "rgba(99,102,241,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid rgba(99,102,241,0.2)",
                        }}
                      >
                        <UserPlus size={16} strokeWidth={2} color="#6366f1" />
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: n.readAt ? 500 : 700,
                            color: n.readAt ? "#6b7280" : "#111827",
                            fontSize: 13,
                            lineHeight: 1.4,
                            marginBottom: 3,
                          }}
                        >
                          {n.message}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          {formatTime(n.createdAt)}
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!n.readAt && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#6366f1",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Admin avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 10px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(99,102,241,0.15)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              overflow: "hidden",
              flexShrink: 0,
              border: "1.5px solid rgba(99,102,241,0.25)",
            }}
          >
            {adminUser?.imageUrl ? (
              <img
                src={`${backendBase}${adminUser.imageUrl}`}
                alt={adminUser.fullName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {initials}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", lineHeight: 1.2 }}>
              {adminUser?.fullName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6366f1",
                fontWeight: 600,
                textTransform: "uppercase" as const,
                letterSpacing: "0.03em",
              }}
            >
              {adminUser?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
