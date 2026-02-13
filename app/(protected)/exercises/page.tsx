"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Dumbbell, Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { API } from "../../../lib/api/endpoints";
import { toast } from "react-toastify";

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
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    duration: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // ✅ Fetch entries function (moved outside useEffect)
  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API.EXERCISES.LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Properly closed useEffect
  useEffect(() => {
    fetchEntries();

    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    if (savedDarkMode) {
      document.documentElement.className = "dark";
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "darkMode") {
        const newDarkMode = e.newValue === "true";
        setDarkMode(newDarkMode);
        document.documentElement.className = newDarkMode ? "dark" : "";
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const url = editingEntry
        ? API.EXERCISES.UPDATE(editingEntry._id)
        : API.EXERCISES.CREATE;

      const method = editingEntry ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        fetchEntries();
        setShowForm(false);
        setEditingEntry(null);
        setFormData({
          type: "",
          duration: 0,
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        toast.success(editingEntry ? "Exercise updated successfully!" : "Exercise added successfully!");
      } else {
        toast.error(data.message || "Failed to save exercise");
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Failed to save exercise");
    }
  };

  const handleEdit = (entry: ExerciseEntry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type,
      duration: entry.duration,
      date: new Date(entry.date).toISOString().split("T")[0],
      notes: entry.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API.EXERCISES.DELETE(id), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchEntries();
        toast.success("Exercise deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete exercise");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete exercise");
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
        transition: "background 0.3s ease, color 0.3s ease",
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
        <h1 style={{ fontSize: "28px", fontWeight: 700 }}>
          Exercises
        </h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Dumbbell size={48} />
            <p>No exercise entries yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {entries.map((entry) => (
              <div
                key={entry._id}
                style={{
                  background: darkMode
                    ? "rgba(31,41,55,0.9)"
                    : "rgba(255,255,255,0.95)",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <h3>{entry.type}</h3>
                <p>
                  {entry.duration} min •{" "}
                  {new Date(entry.date).toLocaleDateString()}
                </p>
                {entry.notes && <p>{entry.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
