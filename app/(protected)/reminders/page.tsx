"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Bell, Plus, Edit, Trash2 } from "lucide-react";
import { API } from "../../../lib/api/endpoints";

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
  const [formData, setFormData] = useState({ title: "", time: "" });

  useEffect(() => {
    fetchReminders();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (editing) {
        await fetch(API.REMINDERS.UPDATE(editing._id), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(API.REMINDERS.CREATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }
      fetchReminders();
      setShowForm(false);
      setEditing(null);
      setFormData({ title: "", time: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(API.REMINDERS.DELETE(id), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchReminders();
  };

  const toggleReminder = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(API.REMINDERS.TOGGLE(id), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchReminders();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f8fb" }}>
      <Header />
      <Sidebar />

      <main style={{ padding: "32px", marginLeft: "240px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1>Reminders</h1>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#5b8def",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={16} /> Add Reminder
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <h3>{editing ? "Edit Reminder" : "Add New Reminder"}</h3>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ddd", borderRadius: 4 }}
            />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ddd", borderRadius: 4 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={{ background: "#5b8def", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 4 }}>
                {editing ? "Update" : "Add"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setFormData({ title: "", time: "" }); }} style={{ background: "#ccc", color: "#000", border: "none", padding: "10px 16px", borderRadius: 4 }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {reminders.map((r) => (
              <div
                key={r._id}
                style={{
                  background: "#fff",
                  padding: 16,
                  borderRadius: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    type="checkbox"
                    checked={r.done}
                    onChange={() => toggleReminder(r._id)}
                  />
                  <div>
                    <h4 style={{ margin: 0, textDecoration: r.done ? "line-through" : "none" }}>{r.title}</h4>
                    <p style={{ margin: 0, color: "#777" }}>{r.time}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setEditing(r); setFormData({ title: r.title, time: r.time }); setShowForm(true); }}
                    style={{ background: "#f6c445", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    style={{ background: "#ff7a9a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}