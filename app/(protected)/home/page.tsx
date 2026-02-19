"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import {
  BookOpen,
  Dumbbell,
  SmilePlus,
  Bell,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API } from "../../../lib/api/endpoints";
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

interface Reminder {
  _id: string;
  title: string;
  time: string;
  type?: "journal" | "mood" | "exercise";
  daysOfWeek?: number[];
  enabled?: boolean;
  done?: boolean;
}

interface MoodRangeItem {
  _id: string;
  dayKey: string; // YYYY-MM-DD
  mood: number;
  moodType?: string;
}

interface ScheduleItem {
  _id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description?: string;
  location?: string;
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

function toLocalDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function getStartOfLocalWeek(d: Date) {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
 
  start.setDate(start.getDate() - day);
  return start;
}

function formatHeaderDate(d: Date) {
  return d
    .toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    .toUpperCase();
}

function getGreeting(d: Date) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function parseReminderTimeToHoursMinutes(time: string): null | { hours: number; minutes: number } {
  const t = time.trim();

  const hhmm = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);
  if (hhmm) {
    return { hours: Number(hhmm[1]), minutes: Number(hhmm[2]) };
  }

  const legacy = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t);
  if (legacy) {
    const rawH = Number(legacy[1]);
    const rawM = Number(legacy[2]);
    const ampm = legacy[3].toUpperCase();
    if (rawH < 1 || rawH > 12) return null;
    let hours = rawH % 12;
    if (ampm === "PM") hours += 12;
    return { hours, minutes: rawM };
  }

  return null;
}

function getNextReminderOccurrence(reminder: Reminder, now: Date): Date | null {
  if (reminder.enabled === false) return null;
  const time = parseReminderTimeToHoursMinutes(reminder.time);
  if (!time) return null;

  const daysOfWeek = Array.isArray(reminder.daysOfWeek) ? reminder.daysOfWeek : [0, 1, 2, 3, 4, 5, 6];
  const today = new Date(now);
  today.setSeconds(0, 0);

  for (let offset = 0; offset <= 7; offset++) {
    const candidate = addDays(today, offset);
    candidate.setHours(time.hours, time.minutes, 0, 0);
    if (!daysOfWeek.includes(candidate.getDay())) continue;
    if (candidate > now) return candidate;
  }

  return null;
}

function parseScheduleDateTime(s: Pick<ScheduleItem, "date" | "time">): Date | null {
  const m = s.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = s.time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!m || !t) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const hh = Number(t[1]);
  const mm = Number(t[2]);
  return new Date(y, mo - 1, d, hh, mm, 0, 0);
}

export default function Page() {
  const router = useRouter();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [weekMoodsByDay, setWeekMoodsByDay] = useState<Record<string, MoodRangeItem>>({});
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview();
    fetchReminders();
    fetchWeekMoods();
    fetchUpcomingSchedules();
  }, []);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem("token");

      const who = await fetch(API.AUTH.WHOAMI, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const whoData = await who.json();
      if (whoData?.success) {
        setUserName(whoData.data?.fullName || whoData.data?.username);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.REMINDERS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReminders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekMoods = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const weekStart = getStartOfLocalWeek(new Date());
      const weekEnd = addDays(weekStart, 6);
      const from = toLocalDateKey(weekStart);
      const to = toLocalDateKey(weekEnd);

      const res = await fetch(`${API.MOODS.RANGE}?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success) {
        const next: Record<string, MoodRangeItem> = {};
        for (const item of (data.data ?? []) as MoodRangeItem[]) {
          next[item.dayKey] = item;
        }
        setWeekMoodsByDay(next);
      } else {
        setWeekMoodsByDay({});
      }
    } catch (err) {
      console.error(err);
      setWeekMoodsByDay({});
    }
  };

  const fetchUpcomingSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const from = toLocalDateKey(new Date());
      const to = toLocalDateKey(addDays(new Date(), 30));

      const res = await fetch(`${API.SCHEDULES.LIST}?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success) setSchedules(data.data ?? []);
      else setSchedules([]);
    } catch (err) {
      console.error(err);
      setSchedules([]);
    }
  };

  const heroDate = formatHeaderDate(new Date());
  const heroGreeting = getGreeting(new Date());

  const weeklyDays = (() => {
    const start = getStartOfLocalWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      return { date, key: toLocalDateKey(date) };
    });
  })();

  const now = new Date();

  const upcomingReminderItems = reminders
    .map((r) => ({ reminder: r, nextAt: getNextReminderOccurrence(r, now) }))
    .filter((x): x is { reminder: Reminder; nextAt: Date } => Boolean(x.nextAt))
    .sort((a, b) => a.nextAt.getTime() - b.nextAt.getTime())
    .slice(0, 5);

  const upcomingEvents = schedules
    .map((s) => ({ schedule: s, dt: parseScheduleDateTime(s) }))
    .filter((x): x is { schedule: ScheduleItem; dt: Date } => Boolean(x.dt))
    .filter((x) => x.dt.getTime() > now.getTime())
    .sort((a, b) => a.dt.getTime() - b.dt.getTime())
    .slice(0, 5);

  const C = {
    bg: "#F5F3EF",
    forest: "#1E3A2F",
    forestMid: "#3D6B4F",
    sage: "#829672",
    blush: "#D8959B",
    blushLight: "#F7EEE8",
    sageLight: "#EBF0E6",
    card: "#FFFFFF",
    text: "#1C1917",
    muted: "#78716C",
    border: "#E8E1D9",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Header />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>

          {/* HERO CARD */}
          <div style={{
            position: "relative",
            background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
            borderRadius: "24px",
            padding: "48px 40px",
            marginBottom: "28px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "24px",
            boxShadow: "0 8px 40px rgba(30,58,47,0.25)",
          }}>
            <div style={{ position:"absolute", top:"-60px", right:"200px", width:"220px", height:"220px", borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:"-80px", right:"60px", width:"280px", height:"280px", borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", top:"20px", left:"40%", width:"120px", height:"120px", borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />
            <div style={{ zIndex:1 }}>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"12px" }}>
                {heroDate}
              </p>
              <h1 style={{ color:"#FFFFFF", fontFamily:"Georgia, 'Times New Roman', serif", fontSize:"clamp(28px, 3vw, 42px)", fontWeight:700, lineHeight:1.2, marginBottom:"10px" }}>
                {heroGreeting},<br />
                {userName ?? "there"} 
              </h1>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"16px", lineHeight:1.6, maxWidth:"420px" }}>
                Your wellness journey continues — every mindful moment counts.
              </p>
            </div>
            <div style={{ flexShrink:0, zIndex:1 }}>
              <Image
                src="/landd.png"
                alt="Wellness illustration"
                width={260}
                height={280}
                style={{ objectFit:"contain", filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.3))" }}
              />
            </div>
          </div>

          {/* 3-COLUMN INFO GRID */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"20px", marginBottom:"28px" }}>

            {/* Weekly Mood */}
            <div style={{ background:C.card, borderRadius:"20px", padding:"24px", boxShadow:"0 2px 12px rgba(30,58,47,0.08)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:`${C.blush}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <SmilePlus size={18} color={C.blush} />
                  </div>
                  <span style={{ fontSize:"15px", fontWeight:700, color:C.text }}>Weekly Mood</span>
                </div>
                <button onClick={() => router.push("/mood")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, color:C.sage }}>
                  See more
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:"6px" }}>
                {weeklyDays.map(({ date, key }) => {
                  const todayKey = toLocalDateKey(new Date());
                  const isToday = key === todayKey;
                  const moodItem = weekMoodsByDay[key];
                  const dayLabel = date.toLocaleDateString("en-US", { weekday:"short" }).charAt(0);
                  return (
                    <div key={key} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px" }}>
                      <span style={{ fontSize:"11px", fontWeight:600, color:isToday ? C.blush : C.muted, textTransform:"uppercase" }}>{dayLabel}</span>
                      <div style={{
                        width:"38px", height:"38px", borderRadius:"12px",
                        background: moodItem ? `${C.blush}15` : `${C.muted}12`,
                        border: isToday ? `2px solid ${C.blush}` : "2px solid transparent",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        transition:"all 0.2s",
                      }}>
                        {moodItem
                          ? <Icon icon={getMoodIconByKey(moodItem.moodType, moodItem.mood)} width={22} height={22} />
                          : <span style={{ fontSize:"16px", color:`${C.muted}60` }}>·</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Reminders */}
            <div style={{ background:C.card, borderRadius:"20px", padding:"24px", boxShadow:"0 2px 12px rgba(30,58,47,0.08)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:`${C.forest}15`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Bell size={18} color={C.forest} />
                  </div>
                  <span style={{ fontSize:"15px", fontWeight:700, color:C.text }}>Reminders</span>
                </div>
                <button onClick={() => router.push("/reminders")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, color:C.sage }}>
                  See more
                </button>
              </div>
              {loading ? (
                <p style={{ color:C.muted, fontSize:"13px" }}>Loading…</p>
              ) : upcomingReminderItems.length === 0 ? (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <Bell size={32} color={`${C.muted}50`} />
                  <p style={{ color:C.muted, fontSize:"13px", marginTop:"8px" }}>No upcoming reminders</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {upcomingReminderItems.map(({ reminder, nextAt }) => (
                    <div key={reminder._id} style={{
                      padding:"10px 12px",
                      borderRadius:"12px",
                      background:`${C.forest}07`,
                      borderLeft:`3px solid ${C.sage}`,
                    }}>
                      <div style={{ fontSize:"13px", fontWeight:600, color:C.text }}>{reminder.title}</div>
                      <div style={{ fontSize:"12px", color:C.muted, marginTop:"2px" }}>
                        {nextAt.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
                        {" · "}
                        {nextAt.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div style={{ background:C.card, borderRadius:"20px", padding:"24px", boxShadow:"0 2px 12px rgba(30,58,47,0.08)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:`${C.blush}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Calendar size={18} color={C.blush} />
                  </div>
                  <span style={{ fontSize:"15px", fontWeight:700, color:C.text }}>Events</span>
                </div>
                <button onClick={() => router.push("/calendar")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, color:C.sage }}>
                  See more
                </button>
              </div>
              {upcomingEvents.length === 0 ? (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <Calendar size={32} color={`${C.muted}50`} />
                  <p style={{ color:C.muted, fontSize:"13px", marginTop:"8px" }}>No upcoming events</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {upcomingEvents.map(({ schedule, dt }) => (
                    <div key={schedule._id} style={{
                      padding:"10px 12px",
                      borderRadius:"12px",
                      background:`${C.blush}08`,
                      borderLeft:`3px solid ${C.blush}`,
                    }}>
                      <div style={{ fontSize:"13px", fontWeight:600, color:C.text }}>{schedule.title}</div>
                      <div style={{ fontSize:"12px", color:C.muted, marginTop:"2px" }}>
                        {dt.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
                        {" · "}
                        {dt.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2-COLUMN PROMO CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>

            {/* Journal */}
            <div
              onClick={() => router.push("/journal")}
              style={{
                background: C.blushLight,
                borderRadius:"20px",
                padding:"28px",
                boxShadow:"0 2px 12px rgba(30,58,47,0.08)",
                cursor:"pointer",
                display:"flex",
                justifyContent:"space-between",
                alignItems:"center",
                gap:"20px",
                transition:"transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow="0 8px 32px rgba(217,149,155,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow="0 2px 12px rgba(30,58,47,0.08)"; }}
            >
              <div>
                <span style={{ display:"inline-block", background:`${C.blush}30`, color:C.blush, fontSize:"11px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 10px", borderRadius:"20px", marginBottom:"14px" }}>
                  Journal
                </span>
                <h3 style={{ fontFamily:"Georgia, serif", fontSize:"22px", fontWeight:700, color:C.text, lineHeight:1.3, marginBottom:"8px" }}>
                  Your Daily Reflection
                </h3>
                <p style={{ fontSize:"14px", color:C.muted, lineHeight:1.6, maxWidth:"280px" }}>
                  Capture thoughts, track growth, and reflect on your journey one entry at a time.
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"16px", color:C.blush, fontWeight:600, fontSize:"14px" }}>
                  <BookOpen size={16} />
                  Write today's entry
                </div>
              </div>
              <div style={{ flexShrink:0, borderRadius:"16px", overflow:"hidden" }}>
                <Image src="/journal.jpg" alt="Journal" width={140} height={120} style={{ objectFit:"cover", display:"block", borderRadius:"16px" }} />
              </div>
            </div>

            {/* Exercises */}
            <div
              onClick={() => router.push("/exercises")}
              style={{
                background: C.sageLight,
                borderRadius:"20px",
                padding:"28px",
                boxShadow:"0 2px 12px rgba(30,58,47,0.08)",
                cursor:"pointer",
                display:"flex",
                justifyContent:"space-between",
                alignItems:"center",
                gap:"20px",
                transition:"transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow="0 8px 32px rgba(130,150,114,0.3)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow="0 2px 12px rgba(30,58,47,0.08)"; }}
            >
              <div>
                <span style={{ display:"inline-block", background:`${C.sage}30`, color:C.sage, fontSize:"11px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 10px", borderRadius:"20px", marginBottom:"14px" }}>
                  Exercises
                </span>
                <h3 style={{ fontFamily:"Georgia, serif", fontSize:"22px", fontWeight:700, color:C.text, lineHeight:1.3, marginBottom:"8px" }}>
                  Move With Purpose
                </h3>
                <p style={{ fontSize:"14px", color:C.muted, lineHeight:1.6, maxWidth:"280px" }}>
                  Log workouts, stay consistent, and celebrate every step toward a healthier you.
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"16px", color:C.sage, fontWeight:600, fontSize:"14px" }}>
                  <Dumbbell size={16} />
                  Log a workout
                </div>
              </div>
              <div style={{ flexShrink:0, borderRadius:"16px", overflow:"hidden" }}>
                <Image src="/brain.jpg" alt="Exercise" width={140} height={120} style={{ objectFit:"cover", display:"block", borderRadius:"16px" }} />
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
