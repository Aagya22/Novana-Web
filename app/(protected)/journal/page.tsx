"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Calendar, Edit, Trash2 } from "lucide-react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { API } from "../../../lib/api/endpoints";

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
}

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API.JOURNALS.LIST, {
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
      const url = editingEntry ? API.JOURNALS.UPDATE(editingEntry._id) : API.JOURNALS.CREATE;
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
        setFormData({ title: "", content: "", date: new Date().toISOString().split('T')[0] });
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      date: new Date(entry.date).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API.JOURNALS.DELETE(id), {
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
              Journal
            </h1>
            <p style={{ color: "#5a9a72", margin: "4px 0 0 0" }}>
              Write your thoughts and reflections
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
            New Entry
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
                  placeholder="Entry title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
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
                    padding: "12px",
                    border: "1px solid #e2ebe6",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                />
                <textarea
                  placeholder="Write your thoughts..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={8}
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
                    {editingEntry ? 'Update' : 'Save'} Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEntry(null);
                      setFormData({ title: "", content: "", date: new Date().toISOString().split('T')[0] });
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
            <BookOpen size={48} color="#7aaa8e" />
            <p style={{ color: "#5a9a72", margin: "16px 0 0 0" }}>
              No journal entries yet. Start writing your first entry!
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
                      {entry.title}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <Calendar size={14} color="#7aaa8e" />
                      <span style={{ fontSize: "14px", color: "#7aaa8e" }}>
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
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
                <p style={{ color: "#1e3a2b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}