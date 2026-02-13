"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import {
  SmilePlus,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  TrendingUp,
  BarChart3,
  Clock,
  PlusCircle,
  Search,
  MoreHorizontal,
  Activity,
  Eye
} from "lucide-react";
import { API } from "../../../lib/api/endpoints";
import { toast } from "react-toastify";

interface MoodEntry {
  _id: string;
  mood: number;
  note?: string;
  date: string;
  createdAt: string;
}

export default function MoodPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    mood: 5,
    note: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API.MOODS.LIST, {
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
      // Mock data for demonstration
      setEntries([
        {
          _id: "1",
          mood: 8,
          note: "Had a really productive day at work and felt great after my evening workout!",
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          _id: "2",
          mood: 6,
          note: "Average day, nothing too exciting but feeling stable.",
          date: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: "3",
          mood: 9,
          note: "Spent time with friends and family, feeling grateful and happy!",
          date: new Date(Date.now() - 172800000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingEntry ? API.MOODS.UPDATE(editingEntry._id) : API.MOODS.CREATE;
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
        setFormData({ mood: 5, note: "", date: new Date().toISOString().split('T')[0] });
        toast.success(editingEntry ? "Mood entry updated successfully!" : "Mood entry added successfully!");
      } else {
        toast.error(data.message || "Failed to save mood entry");
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error("Failed to save mood entry");
    }
  };

  const handleEdit = (entry: MoodEntry) => {
    setEditingEntry(entry);
    setFormData({
      mood: entry.mood,
      note: entry.note || "",
      date: new Date(entry.date).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API.MOODS.DELETE(id), {
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
        toast.success("Mood entry deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete mood entry");
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error("Failed to delete mood entry");
    }
  };

  const filteredEntries = entries.filter(entry =>
    (entry.note && entry.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getMoodLabel(entry.mood).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteEntry = (entryId: string) => {
    setEntryToDelete(entryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      handleDelete(entryToDelete);
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return "😢";
    if (mood <= 4) return "😔";
    if (mood <= 6) return "😐";
    if (mood <= 8) return "😊";
    return "😄";
  };

  const getMoodLabel = (mood: number) => {
    if (mood <= 2) return "Very Sad";
    if (mood <= 4) return "Sad";
    if (mood <= 6) return "Neutral";
    if (mood <= 8) return "Happy";
    return "Very Happy";
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return "#ef4444";
    if (mood <= 4) return "#f97316";
    if (mood <= 6) return "#eab308";
    if (mood <= 8) return "#22c55e";
    return "#16a34a";
  };

  const getAverageMood = () => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + entry.mood, 0);
    return (sum / entries.length).toFixed(1);
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
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
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
                <SmilePlus size={28} strokeWidth={2} />
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
                  Mood Tracker
                </h1>
                <p style={{
                  color: "#6b7280",
                  fontSize: "16px",
                  margin: "4px 0 0 0",
                  fontWeight: "500"
                }}>
                  Track your emotional wellbeing • {entries.length} entries
                </p>
              </div>
              
              {/* Quick Stats */}
              <div style={{ display: "flex", gap: "16px", marginLeft: "auto" }}>
                <div style={{
                  padding: "12px 20px",
                  background: "rgba(34,197,94,0.1)",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "#16a34a" }}>
                    {getAverageMood()}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>
                    Avg Mood
                  </div>
                </div>
                <div style={{
                  padding: "12px 20px",
                  background: "rgba(59,130,246,0.1)",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "#2563eb" }}>
                    {entries.length}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>
                    Total
                  </div>
                </div>
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
              Add Mood
            </button>
          </div>

          {/* Search */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(242,209,212,0.3)",
            border: "1px solid rgba(216,149,155,0.2)",
            borderRadius: "12px",
            padding: "12px 16px",
            maxWidth: "400px"
          }}>
            <Search size={18} color="#6b7280" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search mood entries..."
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
              {editingEntry ? 'Edit Mood Entry' : 'How are you feeling?'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "12px", 
                    fontWeight: 600,
                    color: "#1f2937",
                    fontSize: "16px"
                  }}>
                    Mood Level: {formData.mood}/10
                  </label>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "12px"
                  }}>
                    <span style={{ fontSize: "48px", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" }}>
                      {getMoodEmoji(formData.mood)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.mood}
                        onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
                        style={{
                          width: "100%",
                          height: "8px",
                          borderRadius: "4px",
                          background: `linear-gradient(to right, #ef4444 0%, #f97316 20%, #eab308 40%, #22c55e 60%, #16a34a 80%, #15803d 100%)`,
                          outline: "none",
                          appearance: "none",
                          cursor: "pointer"
                        }}
                      />
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#6b7280",
                        fontWeight: "500"
                      }}>
                        <span>Very Sad</span>
                        <span>Neutral</span>
                        <span>Very Happy</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    textAlign: "center",
                    padding: "12px",
                    background: `${getMoodColor(formData.mood)}15`,
                    borderRadius: "12px",
                    color: getMoodColor(formData.mood),
                    fontSize: "18px",
                    fontWeight: "600"
                  }}>
                    {getMoodLabel(formData.mood)}
                  </div>
                </div>

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
                  placeholder="How are you feeling? What's on your mind? (optional)"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={4}
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
                    {editingEntry ? 'Update' : 'Save'} Mood
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEntry(null);
                      setFormData({ mood: 5, note: "", date: new Date().toISOString().split('T')[0] });
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
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "24px"
            }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid rgba(216,149,155,0.2)",
                  height: "180px",
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
                    height: "60px",
                    width: "100%"
                  }} />
                </div>
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            <div style={{
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
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
                  {/* Mood indicator gradient */}
                  <div style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "4px",
                    background: `linear-gradient(90deg, ${getMoodColor(entry.mood)}, ${getMoodColor(entry.mood)}80)`
                  }} />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{
                        fontSize: "40px",
                        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
                        background: `${getMoodColor(entry.mood)}15`,
                        padding: "8px",
                        borderRadius: "12px"
                      }}>
                        {getMoodEmoji(entry.mood)}
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: getMoodColor(entry.mood),
                          margin: "0 0 4px 0",
                          lineHeight: "1.3"
                        }}>
                          {getMoodLabel(entry.mood)}
                        </h3>
                        <div style={{
                          fontSize: "16px",
                          color: "#6b7280",
                          fontWeight: "600",
                          marginBottom: "8px"
                        }}>
                          {entry.mood}/10
                        </div>
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

                  {entry.note && (
                    <p style={{
                      color: "#4b5563",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      margin: "0 0 20px 0",
                      fontWeight: "400",
                      fontStyle: "italic"
                    }}>
                      "{entry.note.length > 120 ? entry.note.substring(0, 120) + "..." : entry.note}"
                    </p>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      background: `${getMoodColor(entry.mood)}15`,
                      borderRadius: "20px",
                      color: getMoodColor(entry.mood),
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      <Activity size={12} strokeWidth={2} />
                      Mood #{entry.mood}
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
              <SmilePlus size={64} color="#D8959B" strokeWidth={1.5} style={{ marginBottom: "24px", opacity: 0.7 }} />
              <h3 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1f2937",
                margin: "0 0 12px 0"
              }}>
                No mood entries found
              </h3>
              <p style={{
                color: "#6b7280",
                fontSize: "16px",
                marginBottom: "32px",
                maxWidth: "400px"
              }}>
                {searchTerm 
                  ? "Try adjusting your search to find mood entries."
                  : "Start tracking your mood to better understand your emotional patterns and wellbeing."}
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
                Track Your First Mood
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
              Delete Mood Entry
            </h3>
            <p style={{
              color: "#6b7280",
              fontSize: "16px",
              marginBottom: "24px"
            }}>
              Are you sure you want to delete this mood entry? This action cannot be undone.
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