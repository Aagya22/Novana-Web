"use client";

import React, { useMemo, useState, useEffect } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { API } from "../../../lib/api/endpoints";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";

import anxiousFaceWithSweat from "@iconify-icons/twemoji/anxious-face-with-sweat";
import angryFace from "@iconify-icons/twemoji/angry-face";
import cryingFace from "@iconify-icons/twemoji/crying-face";
import faceWithTearsOfJoy from "@iconify-icons/twemoji/face-with-tears-of-joy";
import grinningFace from "@iconify-icons/twemoji/grinning-face";
import neutralFace from "@iconify-icons/twemoji/neutral-face";
import pensiveFace from "@iconify-icons/twemoji/pensive-face";
import relievedFace from "@iconify-icons/twemoji/relieved-face";
import sleepyFace from "@iconify-icons/twemoji/sleepy-face";
import smilingFaceWithSmilingEyes from "@iconify-icons/twemoji/smiling-face-with-smiling-eyes";
import slightlySmilingFace from "@iconify-icons/twemoji/slightly-smiling-face";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  PlusCircle,
  Edit3,
  Trash2,
  MapPin,
} from "lucide-react";

interface ScheduleItem {
  _id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description?: string;
  location?: string;
}

interface MoodRangeItem {
  _id: string;
  dayKey: string; // YYYY-MM-DD
  mood: number;
  moodType?: string;
}

type MoodOption = {
  key: string;
  icon: any;
};

const MOOD_OPTIONS: MoodOption[] = [
  { key: "joyful", icon: faceWithTearsOfJoy },
  { key: "calm", icon: relievedFace },
  { key: "hopeful", icon: slightlySmilingFace },
  { key: "anxious", icon: anxiousFaceWithSweat },
  { key: "sad", icon: pensiveFace },
  { key: "tired", icon: sleepyFace },
  { key: "neutral", icon: neutralFace },
  { key: "happy", icon: smilingFaceWithSmilingEyes },
  { key: "content", icon: smilingFaceWithSmilingEyes },
  { key: "angry", icon: angryFace },
  { key: "stressed", icon: anxiousFaceWithSweat },
];

function clampMoodScore(score: number) {
  return Math.max(1, Math.min(10, score));
}

function getMoodIconByKey(key?: string, score?: number) {
  if (key) {
    const opt = MOOD_OPTIONS.find((m) => m.key === key);
    if (opt) return opt.icon;
  }

  const safe = clampMoodScore(score ?? 5);
  if (safe <= 2) return cryingFace;
  if (safe <= 4) return pensiveFace;
  if (safe <= 6) return neutralFace;
  if (safe <= 8) return smilingFaceWithSmilingEyes;
  return grinningFace;
}

function toLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateKey(dateKey: string) {
  const m = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return dateKey;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(y, mo - 1, d).toLocaleDateString();
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [moodsByDay, setMoodsByDay] = useState<Record<string, MoodRangeItem>>({});
  const [loading, setLoading] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "09:00",
    description: "",
    location: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const monthRange = useMemo(() => {
    const from = toLocalDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const to = toLocalDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
    return { from, to };
  }, [currentDate]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const [sRes, mRes] = await Promise.all([
          fetch(`${API.SCHEDULES.LIST}?from=${monthRange.from}&to=${monthRange.to}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
          fetch(`${API.MOODS.RANGE}?from=${monthRange.from}&to=${monthRange.to}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
        ]);

        const sData = await sRes.json();
        const mData = await mRes.json();

        if (sData?.success) {
          setSchedules(sData.data ?? []);
        } else {
          setSchedules([]);
        }

        if (mData?.success) {
          const next: Record<string, MoodRangeItem> = {};
          for (const item of (mData.data ?? []) as MoodRangeItem[]) {
            next[item.dayKey] = item;
          }
          setMoodsByDay(next);
        } else {
          setMoodsByDay({});
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [monthRange.from, monthRange.to]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const schedulesByDate = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    for (const s of schedules) {
      const key = s.date;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    }
    return map;
  }, [schedules]);

  const selectedDateKey = useMemo(() => toLocalDateKey(selectedDate), [selectedDate]);
  const selectedDayEvents = schedulesByDate[selectedDateKey] ?? [];

  const parseScheduleDateTime = (s: ScheduleItem): Date | null => {
    const m = s.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const t = s.time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!m || !t) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const hh = Number(t[1]);
    const mm = Number(t[2]);
    return new Date(y, mo - 1, d, hh, mm, 0, 0);
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ height: "120px" }} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = toLocalDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      const dayEvents = schedulesByDate[dateKey] ?? [];
      const mood = moodsByDay[dateKey];
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentDate.getMonth() && 
                     new Date().getFullYear() === currentDate.getFullYear();
      
      days.push(
        <div
          key={day}
          style={{
            height: "120px",
            border: "1px solid rgba(30,58,47,0.12)",
            borderRadius: "8px",
            padding: "8px",
            background: isToday 
              ? "rgba(30,58,47,0.08)"
              : "rgba(255,255,255,0.85)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden"
          }}
          onClick={() => {
            const clicked = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            setSelectedDate(clicked);
            setEditingSchedule(null);
            setFormData({
              title: "",
              date: toLocalDateKey(clicked),
              time: "09:00",
              description: "",
              location: "",
            });
            setShowDayModal(true);
          }}
          onMouseEnter={(e) => {
            if (!isToday) {
              e.currentTarget.style.background = "rgba(255,255,255,0.9)";
              e.currentTarget.style.transform = "scale(1.02)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isToday) {
              e.currentTarget.style.background = "rgba(255,255,255,0.7)";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div style={{
              fontWeight: isToday ? "700" : "600",
              color: isToday ? "#1E3A2F" : "#1f2937",
              fontSize: isToday ? "16px" : "14px"
            }}>
              {day}
            </div>
            {mood && (
              <div
                style={{ width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Mood"
              >
                <Icon icon={getMoodIconByKey(mood.moodType, mood.mood)} width={18} height={18} />
              </div>
            )}
          </div>
          
          {dayEvents.slice(0, 3).map((event, index) => (
            <div
              key={event._id}
              style={{
                fontSize: "10px",
                padding: "2px 6px",
                marginBottom: "2px",
                borderRadius: "4px",
                background: `rgba(30,58,47,0.09)`,
                color: "#1E3A2F",
                border: `1px solid rgba(30,58,47,0.18)`,
                fontWeight: "500",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {event.time} {event.title}
            </div>
          ))}
          
          {dayEvents.length > 3 && (
            <div style={{
              fontSize: "10px",
              color: "#6b7280",
              fontWeight: "600",
              padding: "2px 6px"
            }}>
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const term = searchTerm.trim().toLowerCase();

    const upcoming = schedules
      .map((s) => ({ schedule: s, when: parseScheduleDateTime(s) }))
      .filter((x) => x.when && x.when.getTime() > now.getTime())
      .filter(({ schedule }) => {
        if (!term) return true;
        const titleMatch = schedule.title.toLowerCase().includes(term);
        const descMatch = (schedule.description || "").toLowerCase().includes(term);
        const locMatch = (schedule.location || "").toLowerCase().includes(term);
        return titleMatch || descMatch || locMatch;
      })
      .sort((a, b) => (a.when!.getTime() - b.when!.getTime()))
      .map((x) => x.schedule);

    return upcoming;
  }, [schedules, searchTerm]);

  const openNewEventModal = () => {
    setEditingSchedule(null);
    setFormData({
      title: "",
      date: toLocalDateKey(selectedDate || new Date()),
      time: "09:00",
      description: "",
      location: "",
    });
    setShowEventForm(true);
  };

  const openEditModal = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      date: schedule.date,
      time: schedule.time,
      description: schedule.description || "",
      location: schedule.location || "",
    });
    setShowEventForm(true);
  };

  const saveSchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const payload = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        description: formData.description || undefined,
        location: formData.location || undefined,
      };

      const url = editingSchedule ? API.SCHEDULES.UPDATE(editingSchedule._id) : API.SCHEDULES.CREATE;
      const method = editingSchedule ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data?.success) {
        toast.error(data?.message || "Failed to save schedule");
        return;
      }

      toast.success(editingSchedule ? "Schedule updated" : "Schedule created");
      setShowEventForm(false);
      setEditingSchedule(null);

      // Reload month data
      const [sRes, mRes] = await Promise.all([
        fetch(`${API.SCHEDULES.LIST}?from=${monthRange.from}&to=${monthRange.to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API.MOODS.RANGE}?from=${monthRange.from}&to=${monthRange.to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const sData = await sRes.json();
      const mData = await mRes.json();
      if (sData?.success) setSchedules(sData.data ?? []);
      if (mData?.success) {
        const next: Record<string, MoodRangeItem> = {};
        for (const item of (mData.data ?? []) as MoodRangeItem[]) next[item.dayKey] = item;
        setMoodsByDay(next);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save schedule");
    }
  };

  const deleteSchedule = async (schedule: ScheduleItem) => {
    if (!confirm("Delete this schedule?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(API.SCHEDULES.DELETE(schedule._id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data?.success) {
        toast.error(data?.message || "Failed to delete schedule");
        return;
      }

      toast.success("Schedule deleted");
      setSchedules((prev) => prev.filter((s) => s._id !== schedule._id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete schedule");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3EF", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Header />
      <Sidebar />

      <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Forest Green Hero Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #1E3A2F 0%, #3D6B4F 100%)",
            borderRadius: "24px",
            padding: "40px 44px",
            marginBottom: 0,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(30,58,47,0.2)",
          }}
        >
          <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", bottom: -60, right: 100, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 15, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar size={26} color="white" strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15 }}>
                    Your Schedule
                  </h1>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>
                    {schedules.length} scheduled item{schedules.length !== 1 ? "s" : ""} — stay organized
                  </p>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 15, lineHeight: 1.65, maxWidth: 400 }}>
                Plan your days and keep track of everything that matters most.
              </p>
            </div>
            <button
              onClick={openNewEventModal}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 24px",
                borderRadius: 14,
                border: "none",
                background: "rgba(255,255,255,0.92)",
                color: "#1E3A2F",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(216,149,155,0.45)",
                transition: "transform 0.2s, box-shadow 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(216,149,155,0.55)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(216,149,155,0.45)"; }}
            >
              <PlusCircle size={16} /> New Event
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#FFFFFF",
          border: "1px solid rgba(30,58,47,0.08)",
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 28,
          boxShadow: "0 2px 8px rgba(30,58,47,0.05)",
        }}>
          <Search size={15} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#1C1917",
              fontSize: 14,
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 500,
              width: "100%",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28 }}>
          {/* Main Calendar */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              padding: "24px",
              border: "1px solid rgba(30,58,47,0.08)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {/* Month Navigation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                style={{
                  padding: "10px 12px",
                  background: "rgba(30,58,47,0.08)",
                  border: "1px solid rgba(30,58,47,0.15)",
                  borderRadius: 10,
                  color: "#1E3A2F",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1C1917", margin: 0, fontFamily: "Georgia, serif" }}>
                {formatDate(currentDate)}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                style={{
                  padding: "10px 12px",
                  background: "rgba(30,58,47,0.08)",
                  border: "1px solid rgba(30,58,47,0.15)",
                  borderRadius: 10,
                  color: "#1E3A2F",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Day Headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 6 }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  style={{
                    padding: "10px",
                    textAlign: "center" as const,
                    fontWeight: 700,
                    color: "#78716C",
                    fontSize: 12,
                    letterSpacing: 0.5,
                    textTransform: "uppercase" as const,
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {renderCalendarGrid()}
            </div>
          </div>

          {/* Upcoming Events Sidebar */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              padding: "20px",
              border: "1px solid rgba(30,58,47,0.08)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              height: "fit-content",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1C1917", margin: "0 0 16px 0", fontFamily: "Georgia, serif" }}>
              Upcoming Events
            </h3>

            {loading && (
              <div style={{ fontSize: 13, color: "#78716C", marginBottom: 12 }}>Loading...</div>
            )}

            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {upcomingEvents.slice(0, 6).map((event) => (
                <div
                  key={event._id}
                  onClick={() => openEditModal(event)}
                  style={{
                    padding: "14px 16px",
                    background: "#F5F3EF",
                    border: "1px solid rgba(30,58,47,0.1)",
                    borderLeft: "3px solid #1E3A2F",
                    borderRadius: "0 10px 10px 0",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(30,58,47,0.05)";
                    e.currentTarget.style.transform = "translateX(2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F5F3EF";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1917", marginBottom: 2 }}>{event.title}</div>
                      <div style={{ fontSize: 12, color: "#78716C", fontWeight: 500 }}>
                        {event.time} · {formatDateKey(event.date)}
                      </div>
                      {event.location && (
                        <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 4 }}>
                          <MapPin size={11} color="#78716C" />
                          <span style={{ fontSize: 11, color: "#78716C" }}>{event.location}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 4, flex: "0 0 auto" }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
                        style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(30,58,47,0.14)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E3A2F" }}
                        aria-label="Edit"
                      >
                        <Edit3 size={12} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteSchedule(event); }}
                        style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}
                        aria-label="Delete"
                      >
                        <Trash2 size={12} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {upcomingEvents.length === 0 && !loading && (
                <div style={{ padding: "28px 12px", textAlign: "center" as const, color: "#78716C" }}>
                  <Calendar size={30} style={{ opacity: 0.4, marginBottom: 10 }} />
                  <div style={{ fontSize: 13, fontWeight: 500 }}>No upcoming events</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Day Events Modal */}
      {showDayModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 950,
            backdropFilter: "blur(6px)",
            padding: 24,
          }}
          onClick={() => setShowDayModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px 26px",
              maxWidth: 720,
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1C1917", margin: 0, fontFamily: "Georgia, serif" }}>
                  Events on {formatDateKey(selectedDateKey)}
                </h3>
                <div style={{ marginTop: 6, fontSize: 13, color: "#78716C", fontWeight: 500 }}>
                  {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => { setShowDayModal(false); openNewEventModal(); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(30,58,47,0.14)",
                    background: "rgba(30,58,47,0.08)",
                    color: "#1E3A2F",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <PlusCircle size={16} /> New Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowDayModal(false)}
                  style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", background: "#F5F3EF", color: "#78716C", cursor: "pointer", fontWeight: 800, lineHeight: 1 }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div style={{ padding: "22px 14px", textAlign: "center", color: "#78716C" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No events for this day</div>
                <div style={{ fontSize: 13 }}>Click “New Event” to add one.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedDayEvents.map((event) => (
                  <div
                    key={event._id}
                    style={{
                      padding: "14px 16px",
                      background: "#F5F3EF",
                      border: "1px solid rgba(30,58,47,0.1)",
                      borderLeft: "3px solid #1E3A2F",
                      borderRadius: "0 12px 12px 0",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#1C1917", marginBottom: 4 }}>{event.title}</div>
                      <div style={{ fontSize: 12, color: "#78716C", fontWeight: 600 }}>
                        {event.time}
                      </div>
                      {event.location && (
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
                          <MapPin size={12} color="#78716C" />
                          <span style={{ fontSize: 12, color: "#78716C", fontWeight: 500 }}>{event.location}</span>
                        </div>
                      )}
                      {event.description && (
                        <div style={{ marginTop: 8, fontSize: 13, color: "#1C1917", lineHeight: 1.6 }}>
                          {event.description}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => { setShowDayModal(false); openEditModal(event); }}
                        style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(30,58,47,0.14)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E3A2F" }}
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Edit3 size={14} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSchedule(event)}
                        style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div
          style={{
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
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setShowEventForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "28px 32px",
              maxWidth: 500,
              width: "90%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1C1917", margin: 0, fontFamily: "Georgia, serif" }}>
                {editingSchedule ? "Edit Schedule" : "New Schedule"}
              </h3>
              <button
                onClick={() => setShowEventForm(false)}
                style={{ background: "transparent", border: "none", color: "#78716C", cursor: "pointer", fontSize: 18, fontWeight: 700, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
              <input
                type="text"
                placeholder="Event title"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                style={{ padding: "14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 14, fontFamily: "system-ui", background: "#F5F3EF", outline: "none" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  style={{ padding: "14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 14, fontFamily: "system-ui", background: "#F5F3EF", outline: "none" }}
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
                  style={{ padding: "14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 14, fontFamily: "system-ui", background: "#F5F3EF", outline: "none" }}
                />
              </div>
              <input
                type="text"
                placeholder="Location (optional)"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                style={{ padding: "14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 14, fontFamily: "system-ui", background: "#F5F3EF", outline: "none" }}
              />
              <textarea
                placeholder="Description (optional)"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                style={{ padding: "14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 14, fontFamily: "system-ui", background: "#F5F3EF", outline: "none", resize: "vertical" as const }}
              />
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 4 }}>
                <button
                  onClick={() => setShowEventForm(false)}
                  style={{ padding: "12px 20px", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, color: "#78716C", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveSchedule}
                  style={{ padding: "12px 20px", background: "linear-gradient(135deg, #1E3A2F, #3D6B4F)", border: "none", borderRadius: 10, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}
                >
                  {editingSchedule ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
