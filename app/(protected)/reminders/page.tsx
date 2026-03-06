"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Bell, Plus, Edit, Trash2, BookOpen, SmilePlus, Dumbbell, CheckCheck, RefreshCw, Inbox } from "lucide-react";
import { API } from "../../../lib/api/endpoints";
import { showToast } from "@/lib/toast";

type ReminderType = "journal" | "mood" | "exercise";

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

interface Reminder {
  _id: string;
  title: string;
  time: string;
  type?: ReminderType;
  daysOfWeek?: number[];
  enabled?: boolean;
  // legacy
  done?: boolean;
}

type ReminderNotification = {
  _id: string;
  title: string;
  type: ReminderType;
  scheduledFor: string;
  deliveredAt: string;
  readAt?: string;
};

export default function RemindersPage() {
  return (
    <Suspense>
      <RemindersContent />
    </Suspense>
  );
}

function RemindersContent() {
  const searchParams = useSearchParams();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [historyFilter, setHistoryFilter] = useState<"all" | "unread" | "read">("all");

  const [formData, setFormData] = useState<{
    title: string;
    time: string;
    type: ReminderType;
    daysOfWeek: number[];
    enabled: boolean;
  }>({
    title: "",
    time: "07:30",
    type: "journal",
    daysOfWeek: [1, 2, 3, 4, 5],
    enabled: true,
  });



  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.REMINDERS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReminders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationHistory = async () => {
    try {
      setHistoryLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(API.REMINDERS.NOTIFICATIONS(100), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data)) {
        setNotifications(data.data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
      setNotifications([]);
      showToast("Failed to load notification history", "error", "top");
    } finally {
      setHistoryLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.REMINDERS.MARK_NOTIFICATION_READ(id), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data?.success) {
        showToast(data?.message || "Failed to mark notification read", "error", "top");
        return;
      }

      const readAt = data?.data?.readAt || new Date().toISOString();
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, readAt } : n)));
      window.dispatchEvent(new CustomEvent("reminder_notifications_updated"));
    } catch (err) {
      console.error(err);
      showToast("Failed to mark notification read", "error", "top");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.REMINDERS.MARK_ALL_NOTIFICATIONS_READ, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data?.success) {
        showToast(data?.message || "Failed to mark all notifications read", "error", "top");
        return;
      }

      const nowIso = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: nowIso })));
      window.dispatchEvent(new CustomEvent("reminder_notifications_updated"));
    } catch (err) {
      console.error(err);
      showToast("Failed to mark all notifications read", "error", "top");
    }
  };

  const clearNotificationHistory = async () => {
    const confirmed = window.confirm("Delete all notification history?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.REMINDERS.CLEAR_NOTIFICATIONS, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data?.success) {
        showToast(data?.message || "Failed to clear notification history", "error", "top");
        return;
      }

      setNotifications([]);
      showToast("Notification history cleared", "success", "top");
      window.dispatchEvent(new CustomEvent("reminder_notifications_updated"));
    } catch (err) {
      console.error(err);
      showToast("Failed to clear notification history", "error", "top");
    }
  };


  useEffect(() => {
    fetchReminders();

    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "darkMode") {
        const newDarkMode = e.newValue === "true";
        setDarkMode(newDarkMode);

        if (newDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

 
  useEffect(() => {
    if (searchParams.get("history") === "1") {
      setShowHistory(true);
      fetchNotificationHistory();
    }
  }, [searchParams]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let response;
      if (editing) {
        response = await fetch(API.REMINDERS.UPDATE(editing._id), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(API.REMINDERS.CREATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();
      if (data.success) {
        fetchReminders();
        setShowForm(false);
        setEditing(null);
        setFormData({ title: "", time: "07:30", type: "journal", daysOfWeek: [1, 2, 3, 4, 5], enabled: true });
        showToast(editing ? "Reminder updated successfully" : "Reminder added successfully", "success", "top");
      } else {
        showToast(data.message || "Failed to save reminder", "error", "top");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to save reminder", "error", "top");
    }
  };

 

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(API.REMINDERS.DELETE(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        fetchReminders();
        showToast("Reminder deleted successfully", "success", "top");
      } else {
        showToast(data.message || "Failed to delete reminder", "error", "top");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete reminder", "error", "top");
    }
  };



  const toggleReminder = async (id: string) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(API.REMINDERS.TOGGLE(id), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        fetchReminders();
        showToast("Reminder status updated", "success", "top");
      } else {
        showToast(data.message || "Failed to update reminder", "error", "top");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update reminder", "error", "top");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ title: "", time: "07:30", type: "journal", daysOfWeek: [1, 2, 3, 4, 5], enabled: true });
    setShowForm(true);
  };

  const openEdit = (r: Reminder) => {
    setEditing(r);
    setFormData({
      title: r.title || "",
      time: r.time || "07:30",
      type: (r.type || "journal") as ReminderType,
      daysOfWeek: Array.isArray(r.daysOfWeek) ? r.daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
      enabled: r.enabled ?? true,
    });
    setShowForm(true);
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => {
      const has = prev.daysOfWeek.includes(day);
      const next = has ? prev.daysOfWeek.filter((d) => d !== day) : [...prev.daysOfWeek, day];
      next.sort((a, b) => a - b);
      return { ...prev, daysOfWeek: next };
    });
  };

  const iconForType = (t?: ReminderType) => {
    if (t === "mood") return <SmilePlus size={18} strokeWidth={2} />;
    if (t === "exercise") return <Dumbbell size={18} strokeWidth={2} />;
    return <BookOpen size={18} strokeWidth={2} />;
  };

  const labelForType = (t?: ReminderType) => {
    if (t === "mood") return "Mood";
    if (t === "exercise") return "Exercise";
    return "Journal";
  };



  return (
    <div style={{ minHeight: "100vh", background: "#F5F3EF", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Header />
      <Sidebar />

      <main style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Forest Green Hero Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #1E3A2F 0%, #3D6B4F 100%)",
            borderRadius: "24px",
            padding: "40px 44px",
            marginBottom: 28,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(30,58,47,0.2)",
          }}
        >
          <div style={{ position: "absolute", top: -30, right: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: -50, right: 80, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 15, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bell size={26} color="white" strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15 }}>
                    Stay on Track
                  </h1>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>
                    Your scheduled reminders
                  </p>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 15, lineHeight: 1.65, maxWidth: 380 }}>
                Gentle nudges for journaling, mood check-ins, and exercises.
              </p>
            </div>
            <button
              onClick={openCreate}
              style={{
                flexShrink: 0,
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 24px",
                background: "rgba(255,255,255,0.92)",
                color: "#1E3A2F",
                border: "none",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(216,149,155,0.45)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(216,149,155,0.55)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(216,149,155,0.45)"; }}
            >
              <Plus size={18} strokeWidth={2} />
              Add Reminder
            </button>
          </div>

            <button
              onClick={() => {
                setHistoryFilter("all");
                setShowHistory(true);
                fetchNotificationHistory();
              }}
              style={{
                flexShrink: 0,
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 20px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.12)",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                backdropFilter: "blur(6px)",
              }}
              title="View notification history"
            >
              <Bell size={16} />
              History
            </button>
        </div>

        {/* Create / Edit Modal */}
        {showForm && (
          <div
            onClick={() => setShowForm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.52)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(540px, 100%)",
                borderRadius: 18,
                padding: "24px 28px",
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1C1917", margin: 0, fontFamily: "Georgia, serif" }}>
                  {editing ? "Edit Reminder" : "New Reminder"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: "transparent", border: "none", color: "#78716C", cursor: "pointer", fontSize: 18, fontWeight: 700, lineHeight: 1 }}
                >
                  
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#78716C", letterSpacing: 0.5 }}>TITLE</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Morning journal"
                    required
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.1)",
                      background: "#F5F3EF",
                      color: "#1C1917",
                      outline: "none",
                      fontSize: 14,
                      fontFamily: "system-ui",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#78716C", letterSpacing: 0.5 }}>TYPE</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as ReminderType }))}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.1)",
                        background: "#F5F3EF",
                        color: "#1C1917",
                        outline: "none",
                        fontSize: 14,
                        fontFamily: "system-ui",
                      }}
                    >
                      <option value="journal">Journal</option>
                      <option value="mood">Mood</option>
                      <option value="exercise">Exercise</option>
                    </select>
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#78716C", letterSpacing: 0.5 }}>TIME</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
                      required
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.1)",
                        background: "#F5F3EF",
                        color: "#1C1917",
                        outline: "none",
                        fontSize: 14,
                        fontFamily: "system-ui",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#78716C", letterSpacing: 0.5 }}>DAYS</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    {dayLabels.map((lbl, idx) => {
                      const active = formData.daysOfWeek.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDay(idx)}
                          style={{
                            width: 34,
                            height: 30,
                            borderRadius: 999,
                            border: active ? "1px solid #3D6B4F" : "1px solid rgba(0,0,0,0.1)",
                            background: active ? "#3D6B4F" : "transparent",
                            color: active ? "white" : "#78716C",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                  <label style={{ display: "flex", gap: 10, alignItems: "center", color: "#1C1917", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData((p) => ({ ...p, enabled: e.target.checked }))}
                    />
                    Enabled
                  </label>
                  <button
                    type="submit"
                    style={{
                      padding: "11px 22px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #1E3A2F, #3D6B4F)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {editing ? "Save Changes" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center" as const, padding: 48, color: "#78716C" }}>Loading reminders...</div>
        )}

        {/* Empty State */}
        {!loading && reminders.length === 0 && (
          <div
            style={{
              textAlign: "center" as const,
              padding: 60,
              background: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Bell size={44} color="#D8959B" style={{ marginBottom: 12 }} />
            <p style={{ color: "#78716C", margin: 0, fontSize: 15 }}>No reminders yet. Add one to get started!</p>
          </div>
        )}

        {/* Reminders List */}
        {!loading && reminders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {reminders.map((r) => {
              const type = (r.type || "journal") as ReminderType;
              const days = Array.isArray(r.daysOfWeek) ? r.daysOfWeek : [0, 1, 2, 3, 4, 5, 6];
              const enabled = r.enabled ?? true;
              const typeColor = type === "mood" ? "#D8959B" : type === "exercise" ? "#3D6B4F" : "#829672";

              return (
                <div
                  key={r._id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 14,
                    padding: "16px 20px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderLeft: `4px solid ${typeColor}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    opacity: enabled ? 1 : 0.55,
                    transition: "opacity 0.2s",
                  }}
                >
                  {/* Type icon */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      background: `${typeColor}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: typeColor,
                      flex: "0 0 auto",
                    }}
                  >
                    {iconForType(type)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1C1917", marginBottom: 4 }}>{r.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#78716C" }}>{r.time}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "white", background: typeColor, padding: "2px 9px", borderRadius: 999, textTransform: "capitalize" as const }}>{type}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {dayLabels.map((lbl, idx) => {
                          const active = days.includes(idx);
                          return (
                            <div
                              key={idx}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 999,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 800,
                                color: active ? typeColor : "rgba(0,0,0,0.25)",
                                border: active ? `1px solid ${typeColor}55` : "1px solid rgba(0,0,0,0.08)",
                                background: active ? `${typeColor}15` : "transparent",
                              }}
                            >
                              {lbl}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
                    <button
                      onClick={() => toggleReminder(r._id)}
                      aria-label={enabled ? "Disable reminder" : "Enable reminder"}
                      style={{
                        width: 52,
                        height: 28,
                        borderRadius: 999,
                        border: "none",
                        cursor: "pointer",
                        background: enabled ? typeColor : "rgba(0,0,0,0.12)",
                        padding: 3,
                        position: "relative" as const,
                        transition: "background 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          background: "white",
                          position: "absolute",
                          top: 3,
                          left: enabled ? 27 : 3,
                          transition: "left 0.15s ease",
                        }}
                      />
                    </button>
                    <button
                      onClick={() => openEdit(r)}
                      style={{ background: "transparent", border: "none", color: "#78716C", cursor: "pointer", padding: 4 }}
                      aria-label="Edit reminder"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      style={{ background: "transparent", border: "none", color: "#78716C", cursor: "pointer", padding: 4 }}
                      aria-label="Delete reminder"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Notification History Modal */}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,20,15,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 500,
            padding: 24,
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowHistory(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              maxWidth: 680,
              width: "100%",
              boxShadow: "0 32px 80px rgba(30,58,47,0.3), 0 8px 32px rgba(0,0,0,0.12)",
              border: "1px solid rgba(30,58,47,0.08)",
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #1E3A2F 0%, #3D6B4F 100%)",
              padding: "22px 24px 20px",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 13,
                    background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Bell size={22} color="white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", fontFamily: "Georgia, serif", lineHeight: 1.2 }}>
                      Notification History
                    </div>
                    <div style={{ marginTop: 3, fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                      {notifications.length} notification{notifications.length !== 1 ? "s" : ""} total
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={fetchNotificationHistory}
                    disabled={historyLoading}
                    title="Refresh"
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.25)",
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.85)",
                      cursor: historyLoading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: historyLoading ? 0.5 : 1,
                    }}
                  >
                    <RefreshCw size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    disabled={historyLoading || notifications.length === 0 || notifications.every((n) => !!n.readAt)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.25)",
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.9)",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: historyLoading || notifications.length === 0 || notifications.every((n) => !!n.readAt) ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      opacity: historyLoading || notifications.length === 0 || notifications.every((n) => !!n.readAt) ? 0.45 : 1,
                    }}
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                  <button
                    type="button"
                    onClick={clearNotificationHistory}
                    disabled={historyLoading || notifications.length === 0}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(239,68,68,0.35)",
                      background: "rgba(239,68,68,0.15)",
                      color: "rgba(255,160,160,0.95)",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: historyLoading || notifications.length === 0 ? "not-allowed" : "pointer",
                      opacity: historyLoading || notifications.length === 0 ? 0.45 : 1,
                    }}
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.8)",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 700,
                    }}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["all", "unread", "read"] as const).map((f) => {
                  const count = f === "all" ? notifications.length : f === "unread" ? notifications.filter((n) => !n.readAt).length : notifications.filter((n) => !!n.readAt).length;
                  const active = historyFilter === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setHistoryFilter(f)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 999,
                        border: active ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.2)",
                        background: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
                        color: active ? "white" : "rgba(255,255,255,0.6)",
                        fontSize: 12,
                        fontWeight: active ? 800 : 600,
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                        textTransform: "capitalize" as const,
                        transition: "all 0.15s",
                      }}
                    >
                      {f}
                      <span style={{
                        background: active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)",
                        borderRadius: 999,
                        padding: "1px 7px",
                        fontSize: 11,
                        fontWeight: 800,
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification List */}
            <div style={{ overflowY: "auto", flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {historyLoading ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "#78716C" }}>
                  <RefreshCw size={24} color="#829672" style={{ marginBottom: 10, opacity: 0.6 }} />
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Loading notifications…</div>
                </div>
              ) : (() => {
                const filtered = notifications.filter((n) =>
                  historyFilter === "all" ? true : historyFilter === "unread" ? !n.readAt : !!n.readAt
                );

                if (filtered.length === 0) {
                  const emptyMsg = historyFilter === "unread" ? "No unread notifications." : historyFilter === "read" ? "No read notifications yet." : "No notification history.";
                  return (
                    <div style={{ padding: "40px 0", textAlign: "center" }}>
                      <div style={{
                        width: 60, height: 60, borderRadius: 18,
                        background: "rgba(130,150,114,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 14px",
                      }}>
                        <Inbox size={28} color="#829672" strokeWidth={1.5} />
                      </div>
                      <div style={{ fontWeight: 700, color: "#374151", fontSize: 15, marginBottom: 6 }}>{emptyMsg}</div>
                      <div style={{ color: "#9ca3af", fontSize: 13 }}>
                        {historyFilter === "all" ? "Notifications will appear here when reminders fire." : "Switch tabs to see other notifications."}
                      </div>
                    </div>
                  );
                }

                return filtered.map((n) => {
                  const typeColor = n.type === "mood" ? "#D8959B" : n.type === "exercise" ? "#3D6B4F" : "#829672";
                  const TypeIcon = n.type === "mood" ? SmilePlus : n.type === "exercise" ? Dumbbell : BookOpen;
                  const when = n.scheduledFor
                    ? new Date(n.scheduledFor).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                    : (n.deliveredAt ? new Date(n.deliveredAt).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
                  const readWhen = n.readAt ? new Date(n.readAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

                  return (
                    <div
                      key={n._id}
                      style={{
                        borderRadius: 14,
                        background: n.readAt ? "#fafafa" : "#ffffff",
                        border: "1px solid rgba(0,0,0,0.07)",
                        borderLeft: `4px solid ${typeColor}`,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        boxShadow: n.readAt ? "none" : "0 2px 12px rgba(130,150,114,0.12)",
                        transition: "all 0.15s",
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                        background: `${typeColor}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: typeColor,
                        border: `1px solid ${typeColor}30`,
                      }}>
                        <TypeIcon size={18} strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
                          <div style={{
                            fontWeight: n.readAt ? 600 : 800,
                            color: n.readAt ? "#4b5563" : "#111827",
                            fontSize: 14,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {n.title}
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "white",
                            background: typeColor,
                            padding: "2px 8px", borderRadius: 999,
                            textTransform: "capitalize" as const,
                            flexShrink: 0,
                          }}>
                            {n.type}
                          </span>
                          {!n.readAt && (
                            <span style={{
                              fontSize: 10, fontWeight: 800, color: "#D8959B",
                              background: "rgba(216,149,155,0.12)",
                              padding: "2px 8px", borderRadius: 999,
                              border: "1px solid rgba(216,149,155,0.3)",
                              flexShrink: 0,
                            }}>
                              Unread
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                          {when && <span>🕐 {when}</span>}
                          {readWhen && <span>✓ Read {readWhen}</span>}
                        </div>
                      </div>

                      {/* Mark read button */}
                      {!n.readAt && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(n._id)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 10,
                            border: "1px solid rgba(30,58,47,0.18)",
                            background: "rgba(30,58,47,0.07)",
                            color: "#1E3A2F",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontWeight: 700,
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                          title="Mark as read"
                          aria-label="Mark notification as read"
                        >
                          <CheckCheck size={13} />
                          Read
                        </button>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
