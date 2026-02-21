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
  Clock,
  Plus,
  Edit,
} from "lucide-react";
import { API } from "../../../lib/api/endpoints";
import AxiosInstance from "../../../lib/api/axios";
import { toast } from "react-toastify";

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
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
    setLoading(true);
    const handle = setTimeout(() => {
      fetchEntries();
    }, 250);
    return () => clearTimeout(handle);
  }, [searchTerm, startDate, endDate]);

  const fetchEntries = async () => {
    try {
      const url = new URL(API.JOURNALS.LIST);
      if (searchTerm.trim()) url.searchParams.set("q", searchTerm.trim());
      if (startDate) url.searchParams.set("startDate", startDate);
      if (endDate) url.searchParams.set("endDate", endDate);

      const response = await AxiosInstance.get(url.toString());
      const data = response.data;
      if (data.success) {
        setEntries(data.data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEntry ? API.JOURNALS.UPDATE(editingEntry._id) : API.JOURNALS.CREATE;
      const method = editingEntry ? 'PUT' : 'POST';

      const response = await AxiosInstance.request({
        url,
        method,
        data: formData,
      });
      const data = response.data;
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
      const response = await AxiosInstance.delete(API.JOURNALS.DELETE(id));
      const data = response.data;
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

  const filteredEntries = entries;

  const handleDeleteEntry = (entryId: string) => {
    setEntryToDelete(entryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      handleDelete(entryToDelete);
    }
  };

  const openViewEntry = (entry: JournalEntry) => {
    setViewingEntry(entry);
    setShowViewModal(true);
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

  const C = {
    bg: "#F5F3EF",
    forest: "#1E3A2F",
    forestMid: "#3D6B4F",
    sage: "#829672",
    blush: "#D8959B",
    card: "#FFFFFF",
    text: "#1C1917",
    muted: "#78716C",
    border: "rgba(30,58,47,0.08)",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Header />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>

          {/* Hero Banner */}
          <div style={{
            position: "relative",
            background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
            borderRadius: "24px",
            padding: "40px 44px",
            marginBottom: "24px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "24px",
            boxShadow: "0 8px 40px rgba(30,58,47,0.2)",
          }}>
            <div style={{ position: "absolute", top: "-50px", right: "160px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-70px", right: "20px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
            <div style={{ zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "15px", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={26} color="white" strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "34px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15 }}>
                    Your Journal
                  </h1>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 500 }}>
                    {entries.length} {entries.length === 1 ? "entry" : "entries"}
                  </p>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.65, maxWidth: "380px", margin: 0 }}>
                A private space to reflect, process, and grow. Every word you write is a gift to your future self.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{
                flexShrink: 0,
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 24px",
                background: C.blush,
                color: "white",
                border: "none",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(216,149,155,0.45)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(216,149,155,0.55)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(216,149,155,0.45)"; }}
            >
              <PlusCircle size={18} strokeWidth={2} />
              New Entry
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div style={{
            background: C.card,
            borderRadius: "16px",
            padding: "14px 18px",
            marginBottom: "24px",
            border: `1px solid ${C.border}`,
            boxShadow: "0 2px 8px rgba(30,58,47,0.05)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F5F3EF", borderRadius: "10px", padding: "9px 14px", flex: 1, minWidth: "160px" }}>
              <Search size={15} color={C.muted} strokeWidth={2} />
              <input
                type="text"
                placeholder="Search entries…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: "14px", width: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <Calendar size={14} color={C.muted} />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: "8px 12px", background: "#F5F3EF", border: "none", borderRadius: "10px", color: C.text, fontSize: "13px", cursor: "pointer", fontFamily: "system-ui, -apple-system, sans-serif", outline: "none" }}
              />
              <span style={{ color: C.muted, fontSize: "13px" }}>—</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: "8px 12px", background: "#F5F3EF", border: "none", borderRadius: "10px", color: C.text, fontSize: "13px", cursor: "pointer", fontFamily: "system-ui, -apple-system, sans-serif", outline: "none" }}
              />
            </div>
            {(searchTerm || startDate || endDate) && (
              <button
                onClick={() => { setSearchTerm(""); setStartDate(""); setEndDate(""); }}
                style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "10px", color: C.muted, fontSize: "13px", cursor: "pointer", fontWeight: 500, flexShrink: 0 }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Write Form Modal */}
          {showForm && (
            <div
              onClick={() => { setShowForm(false); setEditingEntry(null); setFormData({ title: "", content: "", date: new Date().toISOString().split("T")[0] }); }}
              style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "24px" }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{ width: "min(700px, 100%)", background: C.card, borderRadius: "24px", overflow: "hidden", boxShadow: "0 32px 80px rgba(30,58,47,0.3)" }}
              >
                <div style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.forestMid})`, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#FFFFFF" }}>
                      {editingEntry ? "Edit Entry" : "New Journal Entry"}
                    </h2>
                    <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.55)", fontSize: "13px" }}>
                      {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowForm(false); setEditingEntry(null); setFormData({ title: "", content: "", date: new Date().toISOString().split("T")[0] }); }}
                    style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "10px", color: "white", width: "36px", height: "36px", cursor: "pointer", fontSize: "17px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <input
                    type="text"
                    placeholder="Give this entry a title…"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{ padding: "13px 16px", border: `1px solid ${C.border}`, borderRadius: "12px", fontSize: "16px", fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F3EF", color: C.text, fontWeight: 500, outline: "none" }}
                  />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    style={{ padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: "12px", fontSize: "14px", fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F3EF", color: C.text, outline: "none" }}
                  />
                  <textarea
                    placeholder="Write your thoughts here… let it all out."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={10}
                    style={{ padding: "14px 16px", border: `1px solid ${C.border}`, borderRadius: "12px", fontSize: "15px", resize: "vertical", fontFamily: "Georgia, 'Times New Roman', serif", background: "#F5F3EF", color: C.text, lineHeight: "1.8", outline: "none" }}
                  />
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingEntry(null); setFormData({ title: "", content: "", date: new Date().toISOString().split("T")[0] }); }}
                      style={{ padding: "12px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "12px", color: C.muted, fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: "12px 28px", background: `linear-gradient(135deg, ${C.forest}, ${C.sage})`, border: "none", borderRadius: "12px", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 16px rgba(30,58,47,0.25)" }}
                    >
                      {editingEntry ? "Update Entry" : "Save Entry"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Entry Cards */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: C.card, borderRadius: "20px", height: "200px", border: `1px solid ${C.border}`, opacity: 0.5 }} />
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
              {filteredEntries.map((entry) => (
                <div
                  key={entry._id}
                  style={{
                    background: C.card,
                    borderRadius: "20px",
                    padding: "24px",
                    border: `1px solid ${C.border}`,
                    borderLeft: `4px solid ${C.blush}`,
                    boxShadow: "0 2px 10px rgba(30,58,47,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() => openViewEntry(entry)}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 32px rgba(216,149,155,0.18)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(30,58,47,0.06)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, paddingRight: "12px" }}>
                      <h3 style={{ margin: "0 0 8px 0", fontSize: "19px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif", lineHeight: 1.3 }}>
                        {entry.title}
                      </h3>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: `${C.blush}15`, color: C.blush, fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "999px" }}>
                        <Clock size={10} />
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(entry); }}
                        style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: `${C.sage}15`, border: "none", borderRadius: "8px", color: C.sage, cursor: "pointer" }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry._id); }}
                        style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.08)", border: "none", borderRadius: "8px", color: "#ef4444", cursor: "pointer" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, color: C.muted, fontSize: "14px", lineHeight: "1.75", fontFamily: "Georgia, serif" }}>
                    {entry.content.length > 160 ? entry.content.substring(0, 160) + "…" : entry.content}
                  </p>
                  {entry.date && (
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "10px", fontSize: "12px", color: "#A8A29E", fontWeight: 500 }}>
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px", background: C.card, borderRadius: "24px", border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: `${C.blush}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <BookOpen size={34} color={C.blush} strokeWidth={1.5} />
              </div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "22px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif" }}>
                {searchTerm || startDate || endDate ? "No entries found" : "Start your journal"}
              </h3>
              <p style={{ margin: "0 0 28px 0", color: C.muted, fontSize: "15px", maxWidth: "340px", lineHeight: 1.65 }}>
                {searchTerm || startDate || endDate
                  ? "Try adjusting your search or date filters."
                  : "Capture your thoughts, feelings, and reflections. Every entry is a step toward self-awareness."}
              </p>
              <button
                onClick={() => setShowForm(true)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 28px", background: `linear-gradient(135deg, ${C.forest}, ${C.forestMid})`, color: "white", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 20px rgba(30,58,47,0.25)" }}
              >
                <PlusCircle size={18} />
                Write Your First Entry
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: "24px" }}>
          <div style={{ background: C.card, borderRadius: "20px", padding: "32px", maxWidth: "380px", width: "100%", boxShadow: "0 20px 60px rgba(30,58,47,0.2)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif" }}>Delete entry?</h3>
            <p style={{ margin: "0 0 24px 0", color: C.muted, fontSize: "14px", lineHeight: 1.6 }}>
              This journal entry will be permanently deleted and cannot be recovered.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: "12px", background: "#F5F3EF", border: "none", borderRadius: "12px", color: C.muted, fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ flex: 1, padding: "12px", background: "#ef4444", border: "none", borderRadius: "12px", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingEntry && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 420, padding: "24px" }}
          onClick={() => setShowViewModal(false)}
        >
          <div
            style={{ background: C.card, borderRadius: "20px", padding: "32px", maxWidth: "720px", width: "100%", boxShadow: "0 20px 60px rgba(30,58,47,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: C.text, fontFamily: "Georgia, serif", lineHeight: 1.25 }}>
                  {viewingEntry.title}
                </h3>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${C.blush}15`, color: C.blush, fontSize: "12px", fontWeight: 700, padding: "5px 10px", borderRadius: "999px" }}>
                    <Clock size={12} />
                    {formatDate(viewingEntry.createdAt)}
                  </span>
                  {viewingEntry.date && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(130,150,114,0.12)", color: C.sage, fontSize: "12px", fontWeight: 700, padding: "5px 10px", borderRadius: "999px" }}>
                      <Calendar size={12} />
                      {new Date(viewingEntry.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.border}`, background: "#F5F3EF", color: C.muted, cursor: "pointer", fontWeight: 800, lineHeight: 1 }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
              <div
                style={{ whiteSpace: "pre-wrap", color: C.text, fontSize: 15, lineHeight: 1.85, fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {viewingEntry.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}