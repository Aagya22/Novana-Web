"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { FileText, Plus, Edit, Trash2, Check, Target } from "lucide-react";
import { API } from "../../../lib/api/endpoints";
import { toast } from "react-toastify";

interface HabitEntry {
  _id: string;
  name: string;
  description?: string;
  frequency: string;
  streak: number;
  lastCompleted?: string;
  createdAt: string;
}

export default function HabitsPage() {
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HabitEntry | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    frequency: "daily"
  });

  useEffect(() => {
    fetchEntries();
    // Initialize dark mode state
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.className = 'dark';
    }

    // Listen for storage changes to sync dark mode across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darkMode') {
        const newDarkMode = e.newValue === 'true';
        setDarkMode(newDarkMode);
        document.documentElement.className = newDarkMode ? 'dark' : '';
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API.HABITS.LIST, {
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
      const url = editingEntry ? API.HABITS.UPDATE(editingEntry._id) : API.HABITS.CREATE;
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
        setFormData({ name: "", description: "", frequency: "daily" });
        toast.success(editingEntry ? "Habit updated successfully!" : "Habit added successfully!");
      } else {
        toast.error(data.message || "Failed to save habit");
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error("Failed to save habit");
    }
  };

  const handleEdit = (entry: HabitEntry) => {
    setEditingEntry(entry);
    setFormData({
      name: entry.name,
      description: entry.description || "",
      frequency: entry.frequency
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API.HABITS.DELETE(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchEntries();
        toast.success("Habit deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete habit");
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error("Failed to delete habit");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API.HABITS.COMPLETE(id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchEntries();
        toast.success("Habit completed!");
      } else {
        toast.error(data.message || "Failed to complete habit");
      }
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error("Failed to complete habit");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode 
          ? "linear-gradient(135deg, #1f2937 0%, #111827 50%, #374151 100%)"
          : "linear-gradient(135deg, #f4f3f1 0%, #e8f0e6 50%, #f2d1d4 100%)",
        color: darkMode ? "#f9fafb" : "#1e3a2b",
        fontFamily: "'Inter', sans-serif",
        transition: "background 0.3s ease, color 0.3s ease"
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
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: darkMode ? "#f9fafb" : "#1e3a2b", margin: 0 }}>
              Other Habits
            </h1>
            <p style={{ color: darkMode ? "#9ca3af" : "#5a9a72", margin: "4px 0 0 0" }}>
              Build and track your daily habits
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
            Add Habit
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div
            style={{
              background: darkMode ? "rgba(31,41,55,0.9)" : "rgba(255,255,255,0.95)",
              border: `1px solid ${darkMode ? "rgba(75,85,99,0.3)" : "#e2ebe6"}`,
              borderRadius: "16px",
              padding: "24px",
              backdropFilter: "blur(10px)",
              boxShadow: darkMode 
                ? "0 8px 32px rgba(0,0,0,0.3)"
                : "0 8px 32px rgba(0,0,0,0.1)"
            }}
          >
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input
                  type="text"
                  placeholder="Habit name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    padding: "12px",
                    border: `1px solid ${darkMode ? "rgba(75,85,99,0.4)" : "#e2ebe6"}`,
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: darkMode ? "rgba(55,65,81,0.5)" : "#ffffff",
                    color: darkMode ? "#f3f4f6" : "#1f2937"
                  }}
                />
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                  style={{
                    padding: "12px",
                    border: `1px solid ${darkMode ? "rgba(75,85,99,0.4)" : "#e2ebe6"}`,
                    borderRadius: "8px",
                    fontSize: "16px",
                    background: darkMode ? "rgba(55,65,81,0.5)" : "#ffffff",
                    color: darkMode ? "#f3f4f6" : "#1f2937"
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    padding: "12px",
                    border: `1px solid ${darkMode ? "rgba(75,85,99,0.4)" : "#e2ebe6"}`,
                    borderRadius: "8px",
                    fontSize: "16px",
                    resize: "vertical",
                    background: darkMode ? "rgba(55,65,81,0.5)" : "#ffffff",
                    color: darkMode ? "#f3f4f6" : "#1f2937"
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
                    {editingEntry ? 'Update' : 'Save'} Habit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEntry(null);
                      setFormData({ name: "", description: "", frequency: "daily" });
                    }}
                    style={{
                      background: darkMode ? "rgba(55,65,81,0.5)" : "#f7fbf8",
                      border: `1px solid ${darkMode ? "rgba(75,85,99,0.3)" : "#e2ebe6"}`,
                      borderRadius: "8px",
                      padding: "12px 20px",
                      color: darkMode ? "#9ca3af" : "#5a9a72",
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
          <div style={{ textAlign: "center", padding: "40px", color: darkMode ? "#9ca3af" : "#6b7280" }}>
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: darkMode ? "rgba(31,41,55,0.9)" : "rgba(255,255,255,0.95)",
              border: `1px solid ${darkMode ? "rgba(75,85,99,0.3)" : "#e2ebe6"}`,
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
              boxShadow: darkMode 
                ? "0 8px 32px rgba(0,0,0,0.3)"
                : "0 8px 32px rgba(0,0,0,0.1)"
            }}
          >
            <FileText size={48} color={darkMode ? "#6b7280" : "#7aaa8e"} />
            <p style={{ color: darkMode ? "#9ca3af" : "#5a9a72", margin: "16px 0 0 0" }}>
              No habits yet. Start building positive habits!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {entries.map((entry) => (
              <div
                key={entry._id}
                style={{
                  background: darkMode ? "rgba(31,41,55,0.9)" : "rgba(255,255,255,0.95)",
                  border: `1px solid ${darkMode ? "rgba(75,85,99,0.3)" : "#e2ebe6"}`,
                  borderRadius: "16px",
                  padding: "24px",
                  backdropFilter: "blur(10px)",
                  boxShadow: darkMode 
                    ? "0 8px 32px rgba(0,0,0,0.3)"
                    : "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 600, color: darkMode ? "#f9fafb" : "#1e3a2b", margin: 0 }}>
                      {entry.name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
                      <span style={{
                        fontSize: "12px",
                        color: "#2E8B57",
                        background: "rgba(46, 139, 87, 0.1)",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        textTransform: "capitalize"
                      }}>
                        {entry.frequency}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Target size={14} color={darkMode ? "#9ca3af" : "#7aaa8e"} />
                        <span style={{ fontSize: "14px", color: darkMode ? "#9ca3af" : "#7aaa8e" }}>
                          Streak: {entry.streak} days
                        </span>
                      </div>
                    </div>
                    {entry.description && (
                      <p style={{ color: darkMode ? "#9ca3af" : "#5a9a72", margin: "8px 0 0 0", lineHeight: 1.5 }}>
                        {entry.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      onClick={() => handleComplete(entry._id)}
                      style={{
                        background: "linear-gradient(135deg, #2E8B57, #3aaa6e)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Check size={16} />
                      Complete
                    </button>
                    <button
                      onClick={() => handleEdit(entry)}
                      style={{
                        background: darkMode ? "rgba(55,65,81,0.5)" : "#f7fbf8",
                        border: `1px solid ${darkMode ? "rgba(75,85,99,0.3)" : "#e2ebe6"}`,
                        borderRadius: "8px",
                        padding: "8px",
                        cursor: "pointer",
                        color: darkMode ? "#9ca3af" : "#5a9a72",
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      style={{
                        background: darkMode ? "rgba(127,29,29,0.3)" : "#fee",
                        border: `1px solid ${darkMode ? "rgba(185,28,28,0.4)" : "#fcc"}`,
                        borderRadius: "8px",
                        padding: "8px",
                        cursor: "pointer",
                        color: darkMode ? "#f87171" : "#c33",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}