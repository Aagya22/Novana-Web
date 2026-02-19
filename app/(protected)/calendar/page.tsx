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
            border: "1px solid rgba(216,149,155,0.2)",
            borderRadius: "8px",
            padding: "8px",
            background: isToday 
              ? "linear-gradient(135deg, rgba(216,149,155,0.1), rgba(130,150,114,0.1))"
              : "rgba(255,255,255,0.7)",
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
            setShowEventForm(true);
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
              color: isToday ? "#344C3D" : "#1f2937",
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
                background: `rgba(52,76,61,0.10)`,
                color: "#344C3D",
                border: `1px solid rgba(52,76,61,0.18)`,
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
                <Calendar size={28} strokeWidth={2} />
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
                  Calendar
                </h1>
                <p style={{
                  color: "#6b7280",
                  fontSize: "16px",
                  margin: "4px 0 0 0",
                  fontWeight: "500"
                }}>
                  Track your wellness schedule • {schedules.length} scheduled items
                </p>
              </div>
              
              {/* View Toggle */}
              <div style={{ marginLeft: "auto" }} />
            </div>
            
            <button
              onClick={openNewEventModal}
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
              New Event
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
                placeholder="Search events..."
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
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "32px" }}>
          {/* Main Calendar */}
          <div style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid rgba(216,149,155,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
          }}>
            {/* Calendar Header */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              marginBottom: "24px" 
            }}>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                style={{
                  padding: "12px",
                  background: "rgba(216,149,155,0.1)",
                  border: "1px solid rgba(216,149,155,0.2)",
                  borderRadius: "12px",
                  color: "#D8959B",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <ChevronLeft size={20} strokeWidth={2} />
              </button>

              <h2 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1f2937",
                margin: 0
              }}>
                {formatDate(currentDate)}
              </h2>

              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                style={{
                  padding: "12px",
                  background: "rgba(216,149,155,0.1)",
                  border: "1px solid rgba(216,149,155,0.2)",
                  borderRadius: "12px",
                  color: "#D8959B",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <ChevronRight size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "1px",
                marginBottom: "8px"
              }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div
                    key={day}
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "700",
                      color: "#6b7280",
                      fontSize: "14px",
                      background: "rgba(216,149,155,0.05)"
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px"
              }}>
                {renderCalendarGrid()}
              </div>
            </div>
          </div>

          {/* Sidebar - Upcoming Events */}
          <div style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid rgba(216,149,155,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
            height: "fit-content"
          }}>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 20px 0"
            }}>
              Upcoming Events
            </h3>

            {loading && (
              <div style={{
                marginBottom: "12px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
              }}>
                Loading...
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {upcomingEvents.slice(0, 6).map((event) => (
                <div
                  key={event._id}
                  style={{
                    padding: "16px",
                    background: "rgba(52,76,61,0.04)",
                    border: "1px solid rgba(52,76,61,0.12)",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => openEditModal(event)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(52,76,61,0.07)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(52,76,61,0.04)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{
                      padding: "6px",
                      background: "rgba(52,76,61,0.12)",
                      borderRadius: "8px",
                      color: "#344C3D",
                    }}>
                      <Calendar size={14} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1f2937",
                        marginBottom: "2px",
                      }}>
                        {event.title}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        fontWeight: "500",
                      }}>
                        {event.time} • {formatDateKey(event.date)}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(event);
                        }}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          border: "1px solid rgba(52,76,61,0.14)",
                          background: "rgba(255,255,255,0.7)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#344C3D",
                        }}
                        aria-label="Edit schedule"
                      >
                        <Edit3 size={14} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSchedule(event);
                        }}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          border: "1px solid rgba(239,68,68,0.18)",
                          background: "rgba(255,255,255,0.7)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ef4444",
                        }}
                        aria-label="Delete schedule"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  {event.location && (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: event.description ? "8px" : 0 }}>
                      <MapPin size={12} strokeWidth={2} color="#6b7280" />
                      <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>{event.location}</div>
                    </div>
                  )}

                  {event.description && (
                    <p style={{
                      fontSize: "12px",
                      color: "#4b5563",
                      margin: 0,
                      lineHeight: "1.4",
                    }}>
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
              
              {upcomingEvents.length === 0 && (
                <div style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "#6b7280"
                }}>
                  <Calendar size={32} style={{ opacity: 0.5, marginBottom: "12px" }} />
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    No upcoming events
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Event Form Modal */}
      {showEventForm && (
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
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 24px 0"
            }}>
              {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <input
                type="text"
                placeholder="Event title"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                style={{
                  padding: "16px",
                  border: "1px solid rgba(216,149,155,0.3)",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontFamily: "'Inter', sans-serif",
                  background: "rgba(255,255,255,0.8)"
                }}
              />
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  style={{
                    padding: "16px",
                    border: "1px solid rgba(216,149,155,0.3)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontFamily: "'Inter', sans-serif",
                    background: "rgba(255,255,255,0.8)"
                  }}
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
                  style={{
                    padding: "16px",
                    border: "1px solid rgba(216,149,155,0.3)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontFamily: "'Inter', sans-serif",
                    background: "rgba(255,255,255,0.8)"
                  }}
                />
              </div>

              <input
                type="text"
                placeholder="Location (optional)"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                style={{
                  padding: "16px",
                  border: "1px solid rgba(216,149,155,0.3)",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontFamily: "'Inter', sans-serif",
                  background: "rgba(255,255,255,0.8)"
                }}
              />
              
              <textarea
                placeholder="Description (optional)"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                style={{
                  padding: "16px",
                  border: "1px solid rgba(216,149,155,0.3)",
                  borderRadius: "12px",
                  fontSize: "16px",
                  resize: "vertical",
                  fontFamily: "'Inter', sans-serif",
                  background: "rgba(255,255,255,0.8)"
                }}
              />
              
              <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowEventForm(false)}
                  style={{
                    padding: "16px 24px",
                    background: "transparent",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    color: "#6b7280",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveSchedule}
                  style={{
                    padding: "16px 24px",
                    background: "linear-gradient(135deg, #344C3D, #829672)",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  {editingSchedule ? "Save Changes" : "Create Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}