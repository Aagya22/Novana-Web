"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import {
  PlusCircle,
  Calendar,
  Search,
  BookOpen,
  Edit3,
  Trash2,
  Filter,
  MoreHorizontal,
  Heart,
  Share2,
  Clock,
  Plus,
  Edit,
} from "lucide-react";
import { API } from "../../../lib/api/endpoints";
import { toast } from "react-toastify";

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  mood?: string;
}

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
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
        toast.success(editingEntry ? "Journal entry updated successfully!" : "Journal entry added successfully!");
      } else {
        toast.error(data.message || "Failed to save journal entry");
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error("Failed to save journal entry");
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
        setShowDeleteModal(false);
        setEntryToDelete(null);
        toast.success("Journal entry deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete journal entry");
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error("Failed to delete journal entry");
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || entry.mood === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteEntry = (entryId: string) => {
    setEntryToDelete(entryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      handleDelete(entryToDelete);
    }
  };

  const getMoodColor = (mood?: string) => {
    const moodColors: { [key: string]: string } = {
      grateful: "#10b981",
      energetic: "#f59e0b", 
      accomplished: "#8b5cf6",
      reflective: "#06b6d4",
      peaceful: "#84cc16"
    };
    return moodColors[mood || ""] || "#6b7280";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f4f3f1 0%, #e8f0e6 50%, #f2d1d4 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <Header />
      <Sidebar />

      <main style={{
        marginLeft: "0",
        padding: "32px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}>
        {/* Page Header */}
        <div style={{
          background: "rgba(255,255,255,0.9)",
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "32px",
          border: "1px solid rgba(216,149,155,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #D8959B, #829672)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 8px 24px rgba(216,149,155,0.3)"
              }}>
                <BookOpen size={28} strokeWidth={2} />
              </div>
              <div>
                <h1 style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#1f2937",
                  margin: 0,
                  background: "linear-gradient(135deg, #1f2937, #344C3D)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}>
                  Journal
                </h1>
                <p style={{
                  color: "#6b7280",
                  fontSize: "16px",
                  margin: "4px 0 0 0",
                  fontWeight: "500"
                }}>
                  Capture your thoughts and reflections • {entries.length} entries
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 24px",
                background: "linear-gradient(135deg, #344C3D, #829672)",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 24px rgba(52,76,61,0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(52,76,61,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(52,76,61,0.3)";
              }}
            >
              <PlusCircle size={20} strokeWidth={2} />
              New Entry
            </button>
          </div>

          {/* Search and Filter */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(242,209,212,0.3)",
              border: "1px solid rgba(216,149,155,0.2)",
              borderRadius: "12px",
              padding: "12px 16px",
              flex: 1,
              maxWidth: "400px"
            }}>
              <Search size={18} color="#6b7280" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search your entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#1f2937",
                  fontSize: "14px",
                  width: "100%",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "500"
                }}
              />
            </div>
            
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              style={{
                padding: "12px 16px",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(216,149,155,0.2)",
                borderRadius: "12px",
                color: "#1f2937",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <option value="all">All moods</option>
              <option value="grateful">Grateful</option>
              <option value="energetic">Energetic</option>
              <option value="accomplished">Accomplished</option>
              <option value="reflective">Reflective</option>
              <option value="peaceful">Peaceful</option>
            </select>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "32px",
            border: "1px solid rgba(216,149,155,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
          }}>
            <h2 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 24px 0"
            }}>
              {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <input
                  type="text"
                  placeholder="Entry title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    padding: "16px",
                    border: "1px solid rgba(216,149,155,0.3)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontFamily: "'Inter', sans-serif",
                    background: "rgba(255,255,255,0.8)",
                    color: "#1f2937",
                    fontWeight: "500"
                  }}
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{
                    padding: "16px",
                    border: "1px solid rgba(216,149,155,0.3)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontFamily: "'Inter', sans-serif",
                    background: "rgba(255,255,255,0.8)",
                    color: "#1f2937",
                    fontWeight: "500"
                  }}
                />
                <textarea
                  placeholder="Write your thoughts..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={8}
                  style={{
                    padding: "16px",
                    border: "1px solid rgba(216,149,155,0.3)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    resize: "vertical",
                    fontFamily: "'Inter', sans-serif",
                    background: "rgba(255,255,255,0.8)",
                    color: "#1f2937",
                    lineHeight: "1.6"
                  }}
                />
                <div style={{ display: "flex", gap: "16px" }}>
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #344C3D, #829672)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "16px 24px",
                      color: "white",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 16px rgba(52,76,61,0.3)"
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
                      background: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(216,149,155,0.3)",
                      borderRadius: "12px",
                      padding: "16px 24px",
                      color: "#6b7280",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.3s ease"
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
        <div style={{ display: "grid", gap: "24px" }}>
          {loading ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "24px"
            }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid rgba(216,149,155,0.2)",
                  height: "200px",
                  animation: "pulse 2s infinite"
                }}>
                  <div style={{
                    background: "rgba(216,149,155,0.2)",
                    borderRadius: "8px",
                    height: "24px",
                    width: "60%",
                    marginBottom: "16px"
                  }} />
                  <div style={{
                    background: "rgba(216,149,155,0.1)",
                    borderRadius: "6px",
                    height: "16px",
                    width: "40%",
                    marginBottom: "16px"
                  }} />
                  <div style={{
                    background: "rgba(216,149,155,0.1)",
                    borderRadius: "6px",
                    height: "80px",
                    width: "100%"
                  }} />
                </div>
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            <div style={{
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
              gap: "24px"
            }}>
              {filteredEntries.map((entry) => (
                <div
                  key={entry._id}
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid rgba(216,149,155,0.2)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 35px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#1f2937",
                        margin: "0 0 8px 0",
                        lineHeight: "1.3"
                      }}>
                        {entry.title}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "14px", fontWeight: "500" }}>
                          <Clock size={14} strokeWidth={2} />
                          {formatDate(entry.date || entry.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <button style={{
                      background: "transparent",
                      border: "none",
                      padding: "8px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      color: "#6b7280",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(216,149,155,0.1)";
                      e.currentTarget.style.color = "#D8959B";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#6b7280";
                    }}
                    >
                      <MoreHorizontal size={18} strokeWidth={2} />
                    </button>
                  </div>

                  <p style={{
                    color: "#4b5563",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    margin: "0 0 20px 0",
                    fontWeight: "400",
                    whiteSpace: "pre-wrap"
                  }}>
                    {entry.content.length > 150 ? entry.content.substring(0, 150) + "..." : entry.content}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 12px",
                        background: "rgba(216,149,155,0.1)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#D8959B",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}>
                        <Heart size={14} strokeWidth={2} />
                        Like
                      </button>
                      <button style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 12px",
                        background: "rgba(130,150,114,0.1)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#829672",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}>
                        <Share2 size={14} strokeWidth={2} />
                        Share
                      </button>
                    </div>
                    
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(entry);
                        }}
                        style={{
                          padding: "8px",
                          background: "rgba(59,130,246,0.1)",
                          border: "none",
                          borderRadius: "8px",
                          color: "#3b82f6",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                      >
                        <Edit3 size={14} strokeWidth={2} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEntry(entry._id);
                        }}
                        style={{
                          padding: "8px",
                          background: "rgba(239,68,68,0.1)",
                          border: "none",
                          borderRadius: "8px",
                          color: "#ef4444",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 32px",
              background: "rgba(255,255,255,0.9)",
              borderRadius: "20px",
              border: "1px solid rgba(216,149,155,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              textAlign: "center"
            }}>
              <BookOpen size={64} color="#D8959B" strokeWidth={1.5} style={{ marginBottom: "24px", opacity: 0.7 }} />
              <h3 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1f2937",
                margin: "0 0 12px 0"
              }}>
                No journal entries found
              </h3>
              <p style={{
                color: "#6b7280",
                fontSize: "16px",
                marginBottom: "32px",
                maxWidth: "400px"
              }}>
                {searchTerm || selectedFilter !== "all" 
                  ? "Try adjusting your search or filter to find entries."
                  : "Start your wellness journey by writing your first journal entry."}
              </p>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 32px",
                  background: "linear-gradient(135deg, #344C3D, #829672)",
                  color: "white",
                  border: "none",
                  borderRadius: "16px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 8px 24px rgba(52,76,61,0.3)"
                }}
              >
                <PlusCircle size={20} strokeWidth={2} />
                Create Your First Entry
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(8px)"
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 16px 0"
            }}>
              Delete Entry
            </h3>
            <p style={{
              color: "#6b7280",
              fontSize: "16px",
              marginBottom: "24px"
            }}>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "12px 24px",
                  background: "transparent",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  color: "#6b7280",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "12px 24px",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}