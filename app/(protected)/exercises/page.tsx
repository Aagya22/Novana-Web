"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Dumbbell, Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { API } from "../../../lib/api/endpoints";

interface ExerciseEntry {
  _id: string;
  type: string;
  duration: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export default function ExercisesPage() {
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExerciseEntry | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    duration: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API.EXERCISES.LIST, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingEntry ? API.EXERCISES.UPDATE(editingEntry._id) : API.EXERCISES.CREATE;
      const method = editingEntry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        fetchEntries();
        setShowForm(false);
        setEditingEntry(null);
        setFormData({ type: "", duration: 0, date: new Date().toISOString().split('T')[0], notes: "" });
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleEdit = (entry: ExerciseEntry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type,
      duration: entry.duration,
      date: new Date(entry.date).toISOString().split('T')[0],
      notes: entry.notes || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API.EXERCISES.DELETE(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchEntries();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4faf6",
        color: "#1e3a2b",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Header />
      <Sidebar />

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "28px 32px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1e3a2b", margin: 0 }}>
              Exercises
            </h1>
            <p style={{ color: "#5a9a72", margin: "4px 0 0 0" }}>
              Track your physical activities
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "linear-gradient(135deg, #2E8B57, #3aaa6e)",
              border: "none",
              borderRadius: "12px",
              padding: "12px 20px",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Plus size={18} />
            Add Exercise
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2ebe6",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input
                  type="text"
                  placeholder="Exercise type (e.g., Running, Yoga)"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={{
                    padding: "12px",
                    border: "1px solid #e2ebe6",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    required
                    min="1"
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "1px solid #e2ebe6",
                      borderRadius: "8px",
                      fontSize: "16px",
                    }}
                  />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "1px solid #e2ebe6",
                      borderRadius: "8px",
                      fontSize: "16px",
                    }}
                  />
                </div>
                <textarea
                  placeholder="Notes (optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{
                    padding: "12px",
                    border: "1px solid #e2ebe6",
                    borderRadius: "8px",
                    fontSize: "16px",
                    resize: "vertical",
                  }}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #2E8B57, #3aaa6e)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 20px",
                      color: "white",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {editingEntry ? 'Update' : 'Save'} Exercise
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEntry(null);
                      setFormData({ type: "", duration: 0, date: new Date().toISOString().split('T')[0], notes: "" });
                    }}
                    style={{
                      background: "#f7fbf8",
                      border: "1px solid #e2ebe6",
                      borderRadius: "8px",
                      padding: "12px 20px",
                      color: "#5a9a72",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Entries List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#ffffff",
              border: "1px solid #e2ebe6",
              borderRadius: "16px",
            }}
          >
            <Dumbbell size={48} color="#7aaa8e" />
            <p style={{ color: "#5a9a72", margin: "16px 0 0 0" }}>
              No exercise entries yet. Start tracking your activities!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {entries.map((entry) => (
              <div
                key={entry._id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2ebe6",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1e3a2b", margin: 0 }}>
                      {entry.type}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={14} color="#7aaa8e" />
                        <span style={{ fontSize: "14px", color: "#7aaa8e" }}>
                          {entry.duration} min
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={14} color="#7aaa8e" />
                        <span style={{ fontSize: "14px", color: "#7aaa8e" }}>
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEdit(entry)}
                      style={{
                        background: "#f7fbf8",
                        border: "1px solid #e2ebe6",
                        borderRadius: "8px",
                        padding: "8px",
                        cursor: "pointer",
                        color: "#5a9a72",
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      style={{
                        background: "#fee",
                        border: "1px solid #fcc",
                        borderRadius: "8px",
                        padding: "8px",
                        cursor: "pointer",
                        color: "#c33",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {entry.notes && (
                  <p style={{ color: "#1e3a2b", lineHeight: 1.6, margin: 0 }}>
                    {entry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}