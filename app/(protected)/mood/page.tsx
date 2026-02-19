"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Calendar, Clock, Search, SmilePlus } from "lucide-react";
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

import { API } from "../../../lib/api/endpoints";
import AxiosInstance from "../../../lib/api/axios";
import { toast } from "react-toastify";

type TabKey = "week" | "more";

interface MoodEntry {
  _id: string;
  mood: number;
  moodType?: string;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

type MoodOption = {
  key: string;
  label: string;
  score: number;
  icon: any;
};

type MoodOverview = {
  weekStart: string;
  days: Array<{ date: string; entry: MoodEntry | null }>;
  avgThisWeek: null | { score: number; label: string };
  streak: number;
  mostFrequent: null | { key: string; count: number };
};

const MOOD_OPTIONS: MoodOption[] = [
  { key: "joyful", label: "Joyful", score: 9, icon: faceWithTearsOfJoy },
  { key: "calm", label: "Calm", score: 7, icon: relievedFace },
  { key: "hopeful", label: "Hopeful", score: 8, icon: slightlySmilingFace },
  { key: "anxious", label: "Anxious", score: 3, icon: anxiousFaceWithSweat },
  { key: "sad", label: "Sad", score: 2, icon: pensiveFace },
  { key: "tired", label: "Tired", score: 4, icon: sleepyFace },
  { key: "neutral", label: "Neutral", score: 5, icon: neutralFace },
  { key: "happy", label: "Happy", score: 8, icon: smilingFaceWithSmilingEyes },
  { key: "content", label: "Content", score: 7, icon: smilingFaceWithSmilingEyes },
  { key: "angry", label: "Angry", score: 2, icon: angryFace },
  { key: "stressed", label: "Stressed", score: 4, icon: anxiousFaceWithSweat },
];

function clampMoodScore(score: number) {
  return Math.max(1, Math.min(10, score));
}

function toLocalDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTitle(s: string) {
  return s
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getStartOfLocalWeek(d: Date) {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  // Week runs Sunday → Saturday
  start.setDate(start.getDate() - day);
  return start;
}

function parseLocalDateOnly(dateKey: string) {
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(dateKey);
  if (!m) return new Date(dateKey);
  const [y, mo, d] = dateKey.split("-").map((v) => Number(v));
  return new Date(y, mo - 1, d);
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function formatWeekdayShort(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getAverageLabel(score: number) {
  if (score <= 2) return "Awful";
  if (score <= 4) return "Bad";
  if (score <= 6) return "Okay";
  if (score <= 8) return "Good";
  return "Great";
}

function getMoodColor(score: number) {
  if (score <= 2) return "#ef4444";
  if (score <= 4) return "#f97316";
  if (score <= 6) return "#eab308";
  if (score <= 8) return "#22c55e";
  return "#16a34a";
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

function getMoodLabelByEntry(entry: Pick<MoodEntry, "mood" | "moodType">) {
  if (entry.moodType) {
    const opt = MOOD_OPTIONS.find((m) => m.key === entry.moodType);
    if (opt) return opt.label;
    return toTitle(entry.moodType);
  }
  return getAverageLabel(entry.mood);
}

export default function MoodPage() {
  const [tab, setTab] = useState<TabKey>("week");
  const [overview, setOverview] = useState<MoodOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [todayMoodType, setTodayMoodType] = useState<string>("joyful");
  const [todayMoodScore, setTodayMoodScore] = useState<number>(9);
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const [dateQuery, setDateQuery] = useState<string>(toLocalDateKey(new Date()));
  const [dateResult, setDateResult] = useState<MoodEntry | null>(null);
  const [dateResultLoading, setDateResultLoading] = useState(false);

  const weekStartDate = useMemo(() => {
    if (overview?.weekStart) return parseLocalDateOnly(overview.weekStart);
    return getStartOfLocalWeek(new Date());
  }, [overview?.weekStart]);

  const fetchOverview = async () => {
    try {
      const res = await AxiosInstance.get(API.MOODS.OVERVIEW);
      if (res.data?.success) {
        setOverview(res.data.data);
      } else {
        setOverview(null);
      }
    } catch (e) {
      console.error(e);
      setOverview(null);
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchEntries = async () => {
    setEntriesLoading(true);
    try {
      const res = await AxiosInstance.get(API.MOODS.LIST);
      if (res.data?.success) setEntries(res.data.data);
      else setEntries([]);
    } catch (e) {
      console.error(e);
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  };

  const fetchMoodByDate = async (date: string) => {
    if (!date) return;
    setDateResultLoading(true);
    try {
      const res = await AxiosInstance.get(API.MOODS.BY_DATE, { params: { date } });
      if (res.data?.success) setDateResult(res.data.data);
      else setDateResult(null);
    } catch (e: any) {
      console.error(e);
      setDateResult(null);
      const msg = e?.response?.data?.message;
      toast.error(msg || "Failed to fetch mood for date");
    } finally {
      setDateResultLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (tab === "more") fetchEntries();
  }, [tab]);

  const handleSaveToday = async () => {
    try {
      setSaving(true);
      const payload = {
        mood: clampMoodScore(todayMoodScore),
        moodType: todayMoodType,
        note: note.trim() ? note.trim() : undefined,
        date: toLocalDateKey(new Date()),
      };

      const res = await AxiosInstance.post(API.MOODS.CREATE, payload);
      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to save mood");
        return;
      }

      toast.success("Mood saved");
      setNote("");
      setSelectedDay(null);
      setOverviewLoading(true);
      await fetchOverview();
      if (tab === "more") await fetchEntries();
    } catch (e: any) {
      console.error(e);
      const msg = e?.response?.data?.message;
      toast.error(msg || "Failed to save mood");
    } finally {
      setSaving(false);
    }
  };

  const selectedEntry = useMemo(() => {
    if (!overview || !selectedDay) return null;
    return overview.days.find((d) => d.date === selectedDay)?.entry ?? null;
  }, [overview, selectedDay]);

  const mostFrequentDisplay = useMemo(() => {
    if (!overview?.mostFrequent) return null;
    const key = overview.mostFrequent.key;
    const icon = getMoodIconByKey(key);
    const label = toTitle(key);
    return { icon, label, count: overview.mostFrequent.count };
  }, [overview]);

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

          {/* Hero */}
          <div style={{
            position: "relative",
            background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
            borderRadius: "24px",
            padding: "40px",
            marginBottom: "24px",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(30,58,47,0.2)",
          }}>
            <div style={{ position: "absolute", top: "-60px", right: "180px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-80px", right: "20px", width: "260px", height: "260px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
            <div style={{ zIndex: 1, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "15px", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SmilePlus size={26} color="white" strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "34px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15 }}>
                    Mood Tracker
                  </h1>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 500 }}>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.65, maxWidth: "400px", margin: 0 }}>
                A moment of awareness goes a long way. Log how you feel and watch your patterns emerge.
              </p>
            </div>
          </div>

          {/* Mood selector card */}
          <div style={{ background: C.card, borderRadius: "20px", padding: "28px", marginBottom: "20px", border: `1px solid ${C.border}`, boxShadow: "0 2px 10px rgba(30,58,47,0.06)" }}>
            <p style={{ margin: "0 0 16px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase" }}>
              How are you feeling right now?
            </p>
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px", marginBottom: "20px" }}>
              {MOOD_OPTIONS.map((opt) => {
                const selected = todayMoodType === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { setTodayMoodType(opt.key); setTodayMoodScore(opt.score); }}
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      padding: "14px 12px",
                      minWidth: "84px",
                      background: selected ? `${C.blush}12` : "#F5F3EF",
                      border: selected ? `2px solid ${C.blush}` : "2px solid transparent",
                      borderRadius: "16px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: selected ? `0 4px 16px ${C.blush}30` : "none",
                    }}
                  >
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: selected ? `${C.blush}18` : "rgba(130,150,114,0.1)" }}>
                      <Icon icon={opt.icon} width={28} height={28} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: selected ? C.text : C.muted, whiteSpace: "nowrap" }}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)…"
                rows={2}
                style={{ flex: 1, padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: "12px", fontSize: "14px", resize: "vertical", fontFamily: "system-ui, -apple-system, sans-serif", background: "#F5F3EF", color: C.text, lineHeight: "1.6", outline: "none" }}
              />
              <button
                type="button"
                onClick={handleSaveToday}
                disabled={saving}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 22px",
                  background: `linear-gradient(135deg, ${C.forest}, ${C.sage})`,
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(30,58,47,0.25)",
                  opacity: saving ? 0.8 : 1,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                <SmilePlus size={16} />
                {saving ? "Saving…" : "Save Mood"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {([["week", "This Week"], ["more", "History"]] as [TabKey, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                style={{
                  padding: "10px 22px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: tab === key ? C.forest : C.card,
                  color: tab === key ? "white" : C.muted,
                  border: tab === key ? "none" : `1px solid ${C.border}`,
                  transition: "all 0.2s",
                  boxShadow: tab === key ? "0 4px 12px rgba(30,58,47,0.2)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "week" ? (
            <>
              {/* Weekly mood grid */}
              <div style={{ background: C.card, borderRadius: "20px", padding: "24px", border: `1px solid ${C.border}`, boxShadow: "0 2px 10px rgba(30,58,47,0.06)", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif" }}>This Week</h2>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: C.muted, fontWeight: 500 }}>
                    <Calendar size={14} />
                    Week of {weekStartDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                {overviewLoading ? (
                  <p style={{ color: C.muted, padding: "12px 0" }}>Loading…</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
                    {Array.from({ length: 7 }).map((_, idx) => {
                      const dateObj = addDays(weekStartDate, idx);
                      const day = overview?.days?.[idx];
                      const dateKey = day?.date ?? toLocalDateKey(dateObj);
                      const entry = day?.entry ?? null;
                      const isSelected = selectedDay === dateKey;
                      const isToday = toLocalDateKey(new Date()) === dateKey;
                      const icon = entry ? getMoodIconByKey(entry.moodType, entry.mood) : null;
                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                          style={{
                            padding: "14px 8px",
                            borderRadius: "16px",
                            border: isSelected ? `2px solid ${C.blush}` : isToday ? `2px solid ${C.sage}` : `1px solid ${C.border}`,
                            background: isSelected ? `${C.blush}10` : isToday ? `${C.sage}08` : "#F5F3EF",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.15s",
                          }}
                        >
                          <span style={{ fontSize: "10px", fontWeight: 700, color: isToday ? C.sage : C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {formatWeekdayShort(dateObj).slice(0, 2)}
                          </span>
                          <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: entry ? `${getMoodColor(entry.mood)}18` : "#E8E1D9" }}>
                            {icon ? <Icon icon={icon} width={24} height={24} /> : <span style={{ fontSize: "18px", color: "#C0B8B0" }}>·</span>}
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 600, color: entry ? C.text : "#A8A29E" }}>
                            {entry ? entry.mood + "/10" : "—"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedDay && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${C.border}` }}>
                    <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    {selectedEntry ? (
                      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: `${getMoodColor(selectedEntry.mood)}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon icon={getMoodIconByKey(selectedEntry.moodType, selectedEntry.mood)} width={30} height={30} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif" }}>
                            {getMoodLabelByEntry(selectedEntry)}
                          </p>
                          <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: C.muted }}>{selectedEntry.mood}/10</p>
                          {selectedEntry.note && <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: C.text, lineHeight: 1.65 }}>{selectedEntry.note}</p>}
                        </div>
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: C.muted, fontSize: "14px" }}>No mood logged for this day.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div style={{ background: C.card, borderRadius: "20px", padding: "22px 24px", border: `1px solid ${C.border}`, boxShadow: "0 2px 10px rgba(30,58,47,0.06)" }}>
                  <p style={{ margin: "0 0 14px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase" }}>Most Frequent</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `${C.blush}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {mostFrequentDisplay
                        ? <Icon icon={mostFrequentDisplay.icon} width={30} height={30} />
                        : <Icon icon={neutralFace} width={30} height={30} />
                      }
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif" }}>
                        {mostFrequentDisplay?.label || "—"}
                      </p>
                      <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: C.muted }}>
                        {mostFrequentDisplay ? `${mostFrequentDisplay.count}× this week` : "No data yet"}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ background: C.card, borderRadius: "20px", padding: "22px 24px", border: `1px solid ${C.border}`, boxShadow: "0 2px 10px rgba(30,58,47,0.06)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase" }}>Logging Streak</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{ fontSize: "44px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif", lineHeight: 1 }}>
                      {overview?.streak ?? 0}
                    </span>
                    <span style={{ fontSize: "16px", color: C.muted, fontWeight: 500 }}>days</span>
                  </div>
                  <div style={{ marginTop: "8px", height: "4px", borderRadius: "2px", background: `${C.border}`, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (overview?.streak ?? 0) * 14)}%`, background: C.sage, borderRadius: "2px", transition: "width 0.6s ease" }} />
                  </div>
                </div>

                <div style={{ background: C.card, borderRadius: "20px", padding: "22px 24px", border: `1px solid ${C.border}`, boxShadow: "0 2px 10px rgba(30,58,47,0.06)" }}>
                  <p style={{ margin: "0 0 14px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase" }}>Weekly Average</p>
                  <p style={{ margin: 0, fontSize: "26px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif" }}>
                    {overview?.avgThisWeek?.label || "—"}
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: C.muted }}>
                    {overview?.avgThisWeek ? `${overview.avgThisWeek.score}/10` : "No logs this week"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* History tab */
            <div style={{ background: C.card, borderRadius: "20px", padding: "24px", border: `1px solid ${C.border}`, boxShadow: "0 2px 10px rgba(30,58,47,0.06)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif", flex: 1 }}>Mood History</h2>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="date"
                    value={dateQuery}
                    onChange={(e) => setDateQuery(e.target.value)}
                    style={{ padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: "10px", background: "#F5F3EF", color: C.text, fontSize: "13px", fontFamily: "system-ui, -apple-system, sans-serif", outline: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => fetchMoodByDate(dateQuery)}
                    disabled={dateResultLoading}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", background: C.forest, color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: dateResultLoading ? "not-allowed" : "pointer" }}
                  >
                    <Search size={14} />
                    {dateResultLoading ? "…" : "Search"}
                  </button>
                </div>
              </div>

              {dateResult ? (
                <div style={{ display: "flex", gap: "14px", alignItems: "center", padding: "16px 18px", background: `${getMoodColor(dateResult.mood)}08`, borderRadius: "14px", marginBottom: "20px", borderLeft: `4px solid ${getMoodColor(dateResult.mood)}` }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `${getMoodColor(dateResult.mood)}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon icon={getMoodIconByKey(dateResult.moodType, dateResult.mood)} width={30} height={30} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif" }}>{getMoodLabelByEntry(dateResult)}</p>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: C.muted }}>{dateResult.mood}/10 · {dateQuery}</p>
                    {dateResult.note && <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: C.text, lineHeight: 1.65 }}>{dateResult.note}</p>}
                  </div>
                </div>
              ) : dateQuery && !dateResultLoading ? (
                <div style={{ padding: "14px 18px", background: "#F5F3EF", borderRadius: "12px", marginBottom: "20px", color: C.muted, fontSize: "14px" }}>
                  No mood log found for {dateQuery}.
                </div>
              ) : null}

              <p style={{ margin: "0 0 14px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase" }}>All Entries</p>
              {entriesLoading ? (
                <p style={{ color: C.muted }}>Loading…</p>
              ) : entries.length === 0 ? (
                <p style={{ color: C.muted }}>No entries yet.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
                  {entries.map((entry) => (
                    <div
                      key={entry._id}
                      style={{ padding: "16px 18px", borderRadius: "16px", background: "#F5F3EF", border: `1px solid ${C.border}`, borderLeft: `4px solid ${getMoodColor(entry.mood)}` }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${getMoodColor(entry.mood)}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon icon={getMoodIconByKey(entry.moodType, entry.mood)} width={26} height={26} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: C.text, fontFamily: "Georgia, serif" }}>{getMoodLabelByEntry(entry)}</p>
                          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: C.muted }}>
                            {entry.date ? toLocalDateKey(new Date(entry.date)) : ""} · {entry.mood}/10
                          </p>
                        </div>
                      </div>
                      {entry.note && (
                        <p style={{ margin: "10px 0 0 0", fontSize: "13px", color: C.text, lineHeight: 1.65 }}>{entry.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
