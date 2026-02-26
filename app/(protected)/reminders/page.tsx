"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Bell, Plus, Edit, Trash2, BookOpen, SmilePlus, Dumbbell } from "lucide-react";
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
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);

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
            background: "rgba(28,25,23,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 500,
            padding: 24,
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setShowHistory(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "22px 22px",
              maxWidth: 760,
              width: "100%",
              boxShadow: "0 20px 60px rgba(30,58,47,0.25)",
              border: "1px solid rgba(30,58,47,0.10)",
              maxHeight: "80vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#1C1917", fontFamily: "Georgia, serif" }}>
                  Notification History
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: "#78716C", fontWeight: 600 }}>
                  {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={fetchNotificationHistory}
                  disabled={historyLoading}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(30,58,47,0.14)",
                    background: "rgba(30,58,47,0.08)",
                    color: "#1E3A2F",
                    fontWeight: 800,
                    cursor: historyLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {historyLoading ? "Loading…" : "Refresh"}
                </button>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  disabled={historyLoading || notifications.length === 0 || notifications.every((n) => !!n.readAt)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(30,58,47,0.14)",
                    background: "rgba(30,58,47,0.08)",
                    color: "#1E3A2F",
                    fontWeight: 900,
                    cursor: historyLoading || notifications.length === 0 || notifications.every((n) => !!n.readAt) ? "not-allowed" : "pointer",
                  }}
                >
                  Mark All Read
                </button>
                <button
                  type="button"
                  onClick={clearNotificationHistory}
                  disabled={historyLoading || notifications.length === 0}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(239,68,68,0.25)",
                    background: "rgba(239,68,68,0.08)",
                    color: "#ef4444",
                    fontWeight: 900,
                    cursor: historyLoading || notifications.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Delete All
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "#F5F3EF",
                    color: "#78716C",
                    cursor: "pointer",
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ overflowY: "auto", paddingRight: 4 }}>
              {historyLoading ? (
                <div style={{ padding: 16, color: "#78716C", fontWeight: 700 }}>Loading…</div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: 18, color: "#78716C", fontWeight: 700 }}>No notification history.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notifications.map((n) => {
                    const when = n.scheduledFor
                      ? new Date(n.scheduledFor).toLocaleString()
                      : (n.deliveredAt ? new Date(n.deliveredAt).toLocaleString() : "");
                    return (
                      <div
                        key={n._id}
                        style={{
                          padding: "14px 14px",
                          borderRadius: 16,
                          background: n.readAt ? "#FFFFFF" : "rgba(130,150,114,0.10)",
                          border: "1px solid rgba(30,58,47,0.10)",
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 12, background: "rgba(30,58,47,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E3A2F", flexShrink: 0 }}>
                              {iconForType(n.type)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 900, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {n.title}
                              </div>
                              <div style={{ marginTop: 2, fontSize: 12, fontWeight: 800, color: "#6b7280" }}>
                                {labelForType(n.type)}{when ? ` • ${when}` : ""}{n.readAt ? " • Read" : " • Unread"}
                              </div>
                            </div>
                          </div>
                        </div>

                          {!n.readAt && (
                            <button
                              type="button"
                              onClick={() => markNotificationRead(n._id)}
                              style={{
                                height: 36,
                                borderRadius: 12,
                                border: "1px solid rgba(0,0,0,0.10)",
                                background: "transparent",
                                color: "#344C3D",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                padding: "0 12px",
                                fontWeight: 900,
                              }}
                              title="Mark as read"
                              aria-label="Mark notification as read"
                            >
                              Read
                            </button>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
