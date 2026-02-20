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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f4f3f1 0%, #e8f0e6 50%, #f2d1d4 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <Header />
      <Sidebar />

      <main
        style={{
          padding: "32px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.12em", color: "rgba(31,41,55,0.60)", fontWeight: 800 }}>
            MOOD TRACKER
          </div>
          <h1 style={{ margin: "8px 0 0 0", fontSize: "44px", fontWeight: 800, color: "#111827" }}>
            How are you?
          </h1>
        </div>

        {/* Mood Selector */}
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: "20px",
            padding: "22px",
            border: "1px solid rgba(216,149,155,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ textAlign: "center", fontSize: "12px", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(107,114,128,0.9)", marginBottom: "14px" }}>
            SELECT YOUR CURRENT MOOD
          </div>

          <div
            style={{
              display: "flex",
              gap: "14px",
              overflowX: "auto",
              paddingBottom: "6px",
              justifyContent: "center",
            }}
          >
            {MOOD_OPTIONS.map((opt) => {
              const selected = todayMoodType === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setTodayMoodType(opt.key);
                    setTodayMoodScore(opt.score);
                  }}
                  style={{
                    minWidth: "96px",
                    padding: "12px 10px",
                    background: selected ? "rgba(52,76,61,0.08)" : "rgba(255,255,255,0.85)",
                    border: selected ? "1px solid rgba(52,76,61,0.35)" : "1px solid rgba(216,149,155,0.18)",
                    borderRadius: "18px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: selected ? "rgba(52,76,61,0.12)" : "rgba(107,114,128,0.08)",
                    }}
                  >
                    <Icon icon={opt.icon} width={26} height={26} />
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: selected ? "#111827" : "rgba(17,24,39,0.75)" }}>
                    {opt.label}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginTop: "16px" }}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a short note (optional)"
              rows={2}
              style={{
                padding: "14px",
                border: "1px solid rgba(216,149,155,0.22)",
                borderRadius: "14px",
                fontSize: "14px",
                resize: "vertical",
                fontFamily: "'Inter', sans-serif",
                background: "rgba(255,255,255,0.75)",
                color: "#111827",
                lineHeight: "1.5",
              }}
            />

            <button
              type="button"
              onClick={handleSaveToday}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "14px 18px",
                background: "linear-gradient(135deg, #344C3D, #829672)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                fontWeight: 800,
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "14px",
                boxShadow: "0 10px 24px rgba(52,76,61,0.25)",
                opacity: saving ? 0.8 : 1,
              }}
            >
              <SmilePlus size={18} strokeWidth={2.5} />
              {saving ? "Saving..." : "Save Today's Mood"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginTop: "18px", marginBottom: "18px" }}>
          <button
            type="button"
            onClick={() => setTab("week")}
            style={{
              padding: "12px 16px",
              borderRadius: "999px",
              border: tab === "week" ? "1px solid rgba(52,76,61,0.35)" : "1px solid rgba(216,149,155,0.18)",
              background: tab === "week" ? "rgba(52,76,61,0.10)" : "rgba(255,255,255,0.75)",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => setTab("more")}
            style={{
              padding: "12px 16px",
              borderRadius: "999px",
              border: tab === "more" ? "1px solid rgba(52,76,61,0.35)" : "1px solid rgba(216,149,155,0.18)",
              background: tab === "more" ? "rgba(52,76,61,0.10)" : "rgba(255,255,255,0.75)",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            See more
          </button>
        </div>

        {tab === "week" ? (
          <>
            {/* Weekly Grid */}
            <div
              style={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: "20px",
                padding: "22px",
                border: "1px solid rgba(216,149,155,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                backdropFilter: "blur(10px)",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#111827" }}>This Week</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(107,114,128,0.9)", fontWeight: 700, fontSize: "13px" }}>
                  <Calendar size={16} />
                  Week of {weekStartDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>

              {overviewLoading ? (
                <div style={{ padding: "20px", color: "rgba(107,114,128,0.9)", fontWeight: 700 }}>Loading...</div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const dateObj = addDays(weekStartDate, idx);
                    const day = overview?.days?.[idx];
                    const dateKey = day?.date ?? toLocalDateKey(dateObj);
                    const entry = day?.entry ?? null;
                    const isSelected = selectedDay === dateKey;

                    const icon = entry ? getMoodIconByKey(entry.moodType, entry.mood) : null;
                    const score = entry?.mood ?? null;

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => setSelectedDay(dateKey)}
                        style={{
                          padding: "14px 10px",
                          borderRadius: "16px",
                          border: isSelected ? "1px solid rgba(52,76,61,0.35)" : "1px solid rgba(216,149,155,0.18)",
                          background: isSelected ? "rgba(52,76,61,0.10)" : "rgba(255,255,255,0.75)",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "10px",
                          minHeight: "104px",
                        }}
                      >
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: entry ? `${getMoodColor(entry.mood)}18` : "rgba(107,114,128,0.08)",
                        }}>
                          {icon ? <Icon icon={icon} width={24} height={24} /> : <Clock size={18} color="rgba(107,114,128,0.9)" />}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 900, color: "rgba(17,24,39,0.85)" }}>{formatWeekdayShort(dateObj)}</div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: entry ? "rgba(17,24,39,0.75)" : "rgba(107,114,128,0.85)" }}>
                          {entry ? getMoodLabelByEntry(entry) : "No log"}
                        </div>
                        {score !== null && (
                          <div style={{ fontSize: "11px", fontWeight: 900, color: getMoodColor(score) }}>{score}/10</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Click-to-show detail */}
              {selectedDay && (
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(216,149,155,0.18)" }}>
                  <div style={{ fontWeight: 900, color: "#111827", marginBottom: "8px" }}>
                    {selectedDay}
                  </div>

                  {selectedEntry ? (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `${getMoodColor(selectedEntry.mood)}18`,
                      }}>
                        <Icon icon={getMoodIconByKey(selectedEntry.moodType, selectedEntry.mood)} width={26} height={26} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "16px", fontWeight: 900, color: "#111827" }}>
                          {getMoodLabelByEntry(selectedEntry)}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "rgba(107,114,128,0.95)", marginTop: "2px" }}>
                          {selectedEntry.mood}/10
                        </div>
                        {selectedEntry.note && (
                          <div style={{ marginTop: "8px", color: "rgba(31,41,55,0.85)", fontWeight: 600, lineHeight: 1.5 }}>
                            {selectedEntry.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: "rgba(107,114,128,0.95)", fontWeight: 700 }}>
                      No mood logged for this day.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "14px",
              }}
            >
              <div style={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: "20px",
                padding: "22px",
                border: "1px solid rgba(216,149,155,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(107,114,128,0.08)",
                  }}>
                    {mostFrequentDisplay ? (
                      <Icon icon={mostFrequentDisplay.icon} width={26} height={26} />
                    ) : (
                      <Icon icon={neutralFace} width={26} height={26} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: "24px", fontWeight: 900, color: "#111827" }}>
                      {mostFrequentDisplay?.label || "—"}
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.08em", color: "rgba(107,114,128,0.9)" }}>
                      MOST FREQUENT
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: "20px",
                padding: "22px",
                border: "1px solid rgba(216,149,155,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "rgba(107,114,128,0.9)", letterSpacing: "0.08em" }}>
                  STREAK
                </div>
                <div style={{ fontSize: "34px", fontWeight: 950, marginTop: "10px", color: "#111827" }}>
                  {overview?.streak ?? 0}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 900, color: "rgba(107,114,128,0.9)", letterSpacing: "0.08em" }}>
                  DAYS
                </div>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: "20px",
                padding: "22px",
                border: "1px solid rgba(216,149,155,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "rgba(107,114,128,0.9)", letterSpacing: "0.08em" }}>
                  AVG MOOD (THIS WEEK)
                </div>
                <div style={{ fontSize: "28px", fontWeight: 950, marginTop: "10px", color: "#111827" }}>
                  {overview?.avgThisWeek?.label || "—"}
                </div>
                <div style={{ marginTop: "6px", fontSize: "13px", fontWeight: 800, color: "rgba(107,114,128,0.95)" }}>
                  {overview?.avgThisWeek ? `${overview.avgThisWeek.score}/10` : "No logs"}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* See more */
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              borderRadius: "20px",
              padding: "22px",
              border: "1px solid rgba(216,149,155,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "18px", fontWeight: 950, color: "#111827" }}>Search by date</div>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="date"
                  value={dateQuery}
                  onChange={(e) => setDateQuery(e.target.value)}
                  style={{
                    padding: "12px 14px",
                    border: "1px solid rgba(216,149,155,0.22)",
                    borderRadius: "14px",
                    fontWeight: 800,
                    background: "rgba(255,255,255,0.75)",
                    color: "#111827",
                  }}
                />
                <button
                  type="button"
                  onClick={() => fetchMoodByDate(dateQuery)}
                  disabled={dateResultLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: "1px solid rgba(52,76,61,0.30)",
                    background: "rgba(52,76,61,0.10)",
                    fontWeight: 900,
                    cursor: dateResultLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <Search size={18} />
                  {dateResultLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            <div style={{
              padding: "16px",
              borderRadius: "18px",
              border: "1px solid rgba(216,149,155,0.18)",
              background: "rgba(255,255,255,0.75)",
              marginBottom: "18px",
            }}>
              {dateResultLoading ? (
                <div style={{ color: "rgba(107,114,128,0.95)", fontWeight: 800 }}>Loading...</div>
              ) : dateResult ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `${getMoodColor(dateResult.mood)}18`,
                  }}>
                    <Icon icon={getMoodIconByKey(dateResult.moodType, dateResult.mood)} width={26} height={26} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 950, color: "#111827" }}>
                      {getMoodLabelByEntry(dateResult)}
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "rgba(107,114,128,0.95)" }}>
                      {dateResult.mood}/10 • {dateQuery}
                    </div>
                    {dateResult.note && (
                      <div style={{ marginTop: "8px", color: "rgba(31,41,55,0.85)", fontWeight: 650, lineHeight: 1.5 }}>
                        {dateResult.note}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ color: "rgba(107,114,128,0.95)", fontWeight: 800 }}>No mood found for this date.</div>
              )}
            </div>

            <div style={{ fontSize: "18px", fontWeight: 950, color: "#111827", marginBottom: "12px" }}>All entries</div>
            {entriesLoading ? (
              <div style={{ color: "rgba(107,114,128,0.95)", fontWeight: 800 }}>Loading...</div>
            ) : entries.length === 0 ? (
              <div style={{ color: "rgba(107,114,128,0.95)", fontWeight: 800 }}>No entries yet.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                {entries.map((entry) => (
                  <div
                    key={entry._id}
                    style={{
                      padding: "16px",
                      borderRadius: "18px",
                      border: "1px solid rgba(216,149,155,0.18)",
                      background: "rgba(255,255,255,0.75)",
                      boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `${getMoodColor(entry.mood)}18`,
                      }}>
                        <Icon icon={getMoodIconByKey(entry.moodType, entry.mood)} width={26} height={26} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "15px", fontWeight: 950, color: "#111827" }}>{getMoodLabelByEntry(entry)}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px", color: "rgba(107,114,128,0.95)", fontWeight: 800, fontSize: "12px" }}>
                          <Clock size={14} />
                          {entry.date ? toLocalDateKey(new Date(entry.date)) : ""} • {entry.mood}/10
                        </div>
                      </div>
                    </div>

                    {entry.note && (
                      <div style={{ marginTop: "10px", color: "rgba(31,41,55,0.85)", fontWeight: 650, lineHeight: 1.5, fontSize: "13px" }}>
                        {entry.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
