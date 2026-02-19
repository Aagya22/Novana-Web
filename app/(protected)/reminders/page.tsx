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

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [darkMode, setDarkMode] = useState(false);
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



  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(135deg, #1f2937 0%, #111827 50%, #374151 100%)"
          : "#F5F3EF",
        fontFamily: "system-ui, -apple-system, sans-serif",
        transition: "background 0.3s ease",
      }}
    >
      <Header />
      <Sidebar />

      <main
        style={{
          padding: "32px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 12, letterSpacing: 1.2, color: darkMode ? "rgba(255,255,255,0.5)" : "#6b7280", fontWeight: 700 }}>
              REMINDERS
            </div>
            <h1 style={{ fontSize: "36px", fontWeight: 700, color: darkMode ? "#f9fafb" : "#1C1917", margin: 0, fontFamily: "Georgia, serif" }}>
              Stay on track
            </h1>
            <p
              style={{
                color: darkMode ? "#9ca3af" : "#6b7280",
                margin: "4px 0 0 0",
              }}
            >
              Set reminders for journal, mood, and exercises
            </p>
          </div>

          <button
            onClick={openCreate}
            style={{
              background: darkMode ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.9)",
              color: "#1f2937",
              border: "none",
              padding: "12px 20px",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Plus size={18} /> + Add
          </button>
        </div>

        {/* Create / Edit Modal */}
        {showForm && (
          <div
            onClick={() => setShowForm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
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
                width: "min(560px, 100%)",
                borderRadius: 18,
                padding: 20,
                background: darkMode ? "rgba(17,24,39,0.92)" : "rgba(255,255,255,0.95)",
                border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: darkMode ? "#f9fafb" : "#111827" }}>
                  {editing ? "Edit reminder" : "Add reminder"}
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: darkMode ? "rgba(255,255,255,0.7)" : "#6b7280",
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: darkMode ? "rgba(255,255,255,0.65)" : "#6b7280" }}>
                    Title
                  </label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Morning journal"
                    required
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
                      background: darkMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.9)",
                      color: darkMode ? "#f9fafb" : "#111827",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: darkMode ? "rgba(255,255,255,0.65)" : "#6b7280" }}>
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as ReminderType }))}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
                        background: darkMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.9)",
                        color: darkMode ? "#f9fafb" : "#111827",
                        outline: "none",
                      }}
                    >
                      <option value="journal">Journal</option>
                      <option value="mood">Mood</option>
                      <option value="exercise">Exercise</option>
                    </select>
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: darkMode ? "rgba(255,255,255,0.65)" : "#6b7280" }}>
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
                      required
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
                        background: darkMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.9)",
                        color: darkMode ? "#f9fafb" : "#111827",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: darkMode ? "rgba(255,255,255,0.65)" : "#6b7280" }}>
                    Days
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {dayLabels.map((lbl, idx) => {
                      const active = formData.daysOfWeek.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDay(idx)}
                          style={{
                            width: 34,
                            height: 28,
                            borderRadius: 999,
                            border: active
                              ? "1px solid rgba(130,150,114,0.8)"
                              : darkMode
                                ? "1px solid rgba(255,255,255,0.08)"
                                : "1px solid rgba(0,0,0,0.08)",
                            background: active ? "rgba(130,150,114,0.25)" : "transparent",
                            color: active
                              ? (darkMode ? "#f9fafb" : "#1f2937")
                              : (darkMode ? "rgba(255,255,255,0.6)" : "#6b7280"),
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

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                  <label style={{ display: "flex", gap: 10, alignItems: "center", color: darkMode ? "rgba(255,255,255,0.75)" : "#374151", fontWeight: 600 }}>
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
                      padding: "12px 18px",
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg, #829672, #344C3D)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {editing ? "Save" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            Loading...
          </div>
        )}

        {/* Empty State */}
        {!loading && reminders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              background: darkMode
                ? "rgba(31,41,55,0.9)"
                : "rgba(255,255,255,0.95)",
              borderRadius: 16,
            }}
          >
            <Bell size={48} />
            <p>No reminders yet.</p>
          </div>
        )}

        {/* Active Reminders */}
        {!loading && reminders.length > 0 && (
          <div
            style={{
              borderRadius: 22,
              padding: 18,
              background: darkMode ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.75)",
              border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
              boxShadow: darkMode ? "0 20px 60px rgba(0,0,0,0.4)" : "0 12px 40px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: darkMode ? "#f9fafb" : "#1C1917", fontFamily: "Georgia, serif" }}>
              Active Reminders
            </div>

            <div style={{ display: "grid" }}>
              {reminders.map((r) => {
                const type = (r.type || "journal") as ReminderType;
                const days = Array.isArray(r.daysOfWeek) ? r.daysOfWeek : [0, 1, 2, 3, 4, 5, 6];
                const enabled = r.enabled ?? true;

                return (
                  <div
                    key={r._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 10px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                          color: darkMode ? "rgba(130,150,114,0.95)" : "#344C3D",
                          flex: "0 0 auto",
                        }}
                      >
                        {iconForType(type)}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: darkMode ? (enabled ? "#f9fafb" : "rgba(255,255,255,0.45)") : (enabled ? "#111827" : "rgba(17,24,39,0.45)"),
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 360,
                            }}
                          >
                            {r.title}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
                          <div style={{ color: darkMode ? "rgba(255,255,255,0.55)" : "#6b7280", fontSize: 13, fontWeight: 600 }}>
                            {r.time}
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
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
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: active
                                      ? (darkMode ? "#cfe7d6" : "#344C3D")
                                      : (darkMode ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"),
                                    border: active
                                      ? "1px solid rgba(130,150,114,0.55)"
                                      : darkMode
                                        ? "1px solid rgba(255,255,255,0.08)"
                                        : "1px solid rgba(0,0,0,0.06)",
                                    background: active ? "rgba(130,150,114,0.18)" : "transparent",
                                  }}
                                >
                                  {lbl}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
                      {/* Toggle */}
                      <button
                        onClick={() => toggleReminder(r._id)}
                        aria-label={enabled ? "Disable reminder" : "Enable reminder"}
                        style={{
                          width: 54,
                          height: 30,
                          borderRadius: 999,
                          border: "none",
                          cursor: "pointer",
                          background: enabled ? "rgba(130,150,114,0.95)" : (darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"),
                          padding: 3,
                          position: "relative" as const,
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
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
                        style={{
                          background: "transparent",
                          border: "none",
                          color: darkMode ? "rgba(255,255,255,0.65)" : "#6b7280",
                          cursor: "pointer",
                        }}
                        aria-label="Edit reminder"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(r._id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: darkMode ? "rgba(255,255,255,0.65)" : "#6b7280",
                          cursor: "pointer",
                        }}
                        aria-label="Delete reminder"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
