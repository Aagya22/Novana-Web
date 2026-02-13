"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Bell, Plus, Edit, Trash2 } from "lucide-react";
import { API } from "../../../lib/api/endpoints";
import { toast } from "react-toastify";

interface Reminder {
  _id: string;
  title: string;
  time: string;
  done: boolean;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({ title: "", time: "" });

  /* ---------------- FETCH REMINDERS ---------------- */

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

  /* ---------------- USE EFFECT ---------------- */

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

  /* ---------------- CREATE / UPDATE ---------------- */

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
        setFormData({ title: "", time: "" });
        toast.success(editing ? "Reminder updated successfully!" : "Reminder added successfully!");
      } else {
        toast.error(data.message || "Failed to save reminder");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save reminder");
    }
  };

  /* ---------------- DELETE ---------------- */

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
        toast.success("Reminder deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete reminder");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete reminder");
    }
  };

  /* ---------------- TOGGLE ---------------- */

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
        toast.success("Reminder status updated!");
      } else {
        toast.error(data.message || "Failed to update reminder");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update reminder");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(135deg, #1f2937 0%, #111827 50%, #374151 100%)"
          : "linear-gradient(135deg, #f4f3f1 0%, #e8f0e6 50%, #f2d1d4 100%)",
        transition: "background 0.3s ease",
      }}
    >
      <Header />
      <Sidebar />

      <main
        style={{
          padding: "32px",
          marginLeft: "240px", // sidebar width
          maxWidth: "1200px",
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
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: darkMode ? "#f9fafb" : "#1f2937",
                margin: 0,
              }}
            >
              Reminders
            </h1>
            <p
              style={{
                color: darkMode ? "#9ca3af" : "#6b7280",
                margin: "4px 0 0 0",
              }}
            >
              Manage your daily reminders
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "linear-gradient(135deg, #829672, #344C3D)",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
            }}
          >
            <Plus size={18} /> Add Reminder
          </button>
        </div>

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

        {/* Reminder List */}
        <div style={{ display: "grid", gap: 16 }}>
          {reminders.map((r) => (
            <div
              key={r._id}
              style={{
                background: darkMode
                  ? "rgba(31,41,55,0.9)"
                  : "rgba(255,255,255,0.95)",
                padding: 20,
                borderRadius: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 16 }}>
                <input
                  type="checkbox"
                  checked={r.done}
                  onChange={() => toggleReminder(r._id)}
                />
                <div>
                  <h4
                    style={{
                      margin: 0,
                      textDecoration: r.done ? "line-through" : "none",
                    }}
                  >
                    {r.title}
                  </h4>
                  <p style={{ margin: 0 }}>{r.time}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    setEditing(r);
                    setFormData({ title: r.title, time: r.time });
                    setShowForm(true);
                  }}
                >
                  <Edit size={16} />
                </button>

                <button onClick={() => handleDelete(r._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
