"use client";

import React, { useState } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";


// ─── Card Icons ──────────────────────────────────────────────────────────────
const JournalIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ExerciseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2" />
    <line x1="12" y1="22" x2="12" y2="15" />
    <path d="M10 22V15l-2-5" /><path d="M14 22V15l2-5" />
    <path d="M10 10l-2 5h8l-2-5" />
    <line x1="12" y1="10" x2="12" y2="7" />
  </svg>
);

const MoodIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const NotesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BellSmallIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── Reminder Items ─────────────────────────────────────────────────────────
const reminders = [
  { id: 1, title: "Morning Meditation", time: "7:00 AM", icon: "🧘", done: false },
  { id: 2, title: "Exercises", time: "5:00 PM", icon: "🏋️", done: false },
  { id: 3, title: "Evening Journal", time: "9:00 PM", icon: "📝", done: true },
  { id: 4, title: "Hydration Check", time: "12:00 PM", icon: "💧", done: true },
];

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function Page() {
  const [remindersDone, setRemindersDone] = useState<Record<number, boolean>>(
    Object.fromEntries(reminders.map((r) => [r.id, r.done]))
  );

  const toggleReminder = (id: number) => {
    setRemindersDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Card hover state
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const cards = [
    { id: "journal", label: "Journal", Icon: JournalIcon, accent: "#2E8B57", desc: "Write your thoughts" },
    { id: "exercises", label: "Exercises", Icon: ExerciseIcon, accent: "#3aaa6e", desc: "Stay active today" },
    { id: "mood", label: "Mood Tracker", Icon: MoodIcon, accent: "#2E8B57", desc: "Track how you feel" },
    { id: "notes", label: "Notes", Icon: NotesIcon, accent: "#3aaa6e", desc: "Quick notes & ideas" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4faf6",
        color: "#1e3a2b",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <Header />

      {/* Sidebar (hover-triggered) */}
      <Sidebar />

      {/* Main Content */}
      <main
        style={{
          display: "flex",
          gap: "24px",
          padding: "28px 32px",
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
        {/* Left Column: Hero + Cards Grid */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Hero Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #eaf7ee 0%, #dff0e6 50%, #e6f4eb 100%)",
              border: "1px solid rgba(46, 139, 87, 0.18)",
              borderRadius: "18px",
              padding: "36px 40px",
              position: "relative",
              overflow: "hidden",
              minHeight: "160px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                top: "-40px",
                right: "-40px",
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(46,139,87,0.18) 0%, transparent 70%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-30px",
                right: "120px",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(46,139,87,0.12) 0%, transparent 70%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "40%",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(46,139,87,0.1) 0%, transparent 70%)",
              }}
            />

            <p
              style={{
                fontSize: "13px",
                color: "#2E8B57",
                fontWeight: 500,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                position: "relative",
                zIndex: 1,
              }}
            >
              Good morning ☀️
            </p>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#1e3a2b",
                margin: 0,
                position: "relative",
                zIndex: 1,
                lineHeight: 1.3,
              }}
            >
              Welcome back, let's nurture
              <br />
              <span style={{ color: "#2E8B57" }}>your growth today.</span>
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#5a9a72",
                position: "relative",
                zIndex: 1,
              }}
            >
              You have 3 reminders pending today
            </p>
          </div>

          {/* 2×2 Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "18px",
            }}
          >
            {cards.map((card) => {
              const Icon = card.Icon;
              const isHovered = hoveredCard === card.id;
              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: isHovered
                      ? "linear-gradient(135deg, rgba(46,139,87,0.07), rgba(46,139,87,0.02))"
                      : "#ffffff",
                    border: isHovered
                      ? "1px solid rgba(46, 139, 87, 0.35)"
                      : "1px solid #e2ebe6",
                    borderRadius: "16px",
                    padding: "24px",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                    boxShadow: isHovered
                      ? "0 8px 28px rgba(46,139,87,0.12), 0 2px 6px rgba(0,0,0,0.06)"
                      : "0 2px 8px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Subtle glow on hover */}
                  {isHovered && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "2px",
                        background: "linear-gradient(90deg, transparent, #2E8B57, transparent)",
                        borderRadius: "16px 16px 0 0",
                      }}
                    />
                  )}

                  {/* Icon + Label Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(46, 139, 87, 0.08)",
                        border: "1px solid rgba(46, 139, 87, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: card.accent,
                      }}
                    >
                      <Icon />
                    </div>
                    <button
                      style={{
                        background: "rgba(46, 139, 87, 0.07)",
                        border: "1px solid rgba(46, 139, 87, 0.2)",
                        borderRadius: "8px",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#5a9a72",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(46, 139, 87, 0.14)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#2E8B57";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(46, 139, 87, 0.07)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#5a9a72";
                      }}
                    >
                      <PlusIcon />
                    </button>
                  </div>

                  {/* Title + Description */}
                  <div>
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#1e3a2b",
                      }}
                    >
                      {card.label}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#7aaa8e", margin: "3px 0 0 0" }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Reminders Panel */}
        <div style={{ width: "260px", flexShrink: 0 }}>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2ebe6",
              borderRadius: "18px",
              padding: "24px",
              position: "sticky",
              top: "88px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {/* Header Row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#1e3a2b",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#2E8B57" }}>
                  <BellSmallIcon />
                </span>
                Reminders
              </h2>
              <span
                style={{
                  fontSize: "11px",
                  color: "#2E8B57",
                  background: "rgba(46, 139, 87, 0.15)",
                  padding: "3px 9px",
                  borderRadius: "20px",
                  fontWeight: 600,
                }}
              >
                {Object.values(remindersDone).filter(Boolean).length}/{reminders.length} done
              </span>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                height: "4px",
                background: "#e8f0eb",
                borderRadius: "2px",
                marginBottom: "20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(Object.values(remindersDone).filter(Boolean).length / reminders.length) * 100}%`,
                  background: "linear-gradient(90deg, #2E8B57, #3aaa6e)",
                  borderRadius: "2px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            {/* Reminder List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reminders.map((reminder) => {
                const done = remindersDone[reminder.id];
                return (
                  <div
                    key={reminder.id}
                    onClick={() => toggleReminder(reminder.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: done
                        ? "rgba(46, 139, 87, 0.06)"
                        : "#f7fbf8",
                      border: done
                        ? "1px solid rgba(46, 139, 87, 0.18)"
                        : "1px solid #eef3f0",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      opacity: done ? 0.6 : 1,
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "5px",
                        border: done ? "none" : "2px solid rgba(46, 139, 87, 0.4)",
                        background: done
                          ? "linear-gradient(135deg, #2E8B57, #3aaa6e)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {done && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    {/* Emoji */}
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>{reminder.icon}</span>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "13px",
                          color: done ? "#7aaa8e" : "#1e3a2b",
                          margin: 0,
                          textDecoration: done ? "line-through" : "none",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {reminder.title}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#7aaa8e",
                          margin: "2px 0 0 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <ClockIcon /> {reminder.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}