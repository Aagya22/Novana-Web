"use client";

import React, { useState } from "react";

// ─── Icons ───────────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// ─── Nav Items Data ──────────────────────────────────────────────────────────
const navItems = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "progress", label: "Progress", icon: BarChartIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      {/* Hover Trigger Zone — invisible strip on the far left */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "8px",
          height: "100vh",
          zIndex: 200,
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      />

      {/* Sidebar Panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: isExpanded ? "220px" : "0px",
          background: "#ffffff",
          borderRight: "1px solid #e2ebe6",
          boxShadow: isExpanded ? "4px 0 16px rgba(0,0,0,0.06)" : "none",
          zIndex: 199,
          overflow: "hidden",
          transition: "width 0.32s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
          display: "flex",
          flexDirection: "column",
          paddingTop: "64px",
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "24px 0", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "11px 24px",
                  background: isActive
                    ? "linear-gradient(90deg, rgba(46,139,87,0.08) 0%, rgba(46,139,87,0.02) 100%)"
                    : "transparent",
                  border: "none",
                  borderLeft: isActive ? "3px solid #2E8B57" : "3px solid transparent",
                  borderRadius: "0 10px 10px 0",
                  cursor: "pointer",
                  color: isActive ? "#2E8B57" : "#7aaa8e",
                  fontSize: "13px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.3px",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  textAlign: "left" as const,
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "#f4faf6";
                    (e.currentTarget as HTMLButtonElement).style.color = "#2E8B57";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#7aaa8e";
                  }
                }}
              >
                <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <Icon />
                </span>
                <span
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? "translateX(0)" : "translateX(-8px)",
                    transition: isExpanded
                      ? "opacity 0.25s ease 0.12s, transform 0.25s ease 0.12s"
                      : "opacity 0.1s ease, transform 0.1s ease",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Dark Mode Toggle */}
        <div
          style={{
            padding: "20px 24px",
            borderTop: "1px solid #eef3f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
            onClick={() => setDarkMode(!darkMode)}
          >
            <div
              style={{
                width: "40px",
                height: "22px",
                borderRadius: "11px",
                background: darkMode
                  ? "linear-gradient(90deg, #2E8B57, #3aaa6e)"
                  : "#e2ebe6",
                position: "relative",
                transition: "background 0.3s ease",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "3px",
                  left: darkMode ? "21px" : "3px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "left 0.3s ease",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                  color: darkMode ? "#1e3a2b" : "#7aaa8e",
                }}
              >
                {darkMode ? <MoonIcon /> : <SunIcon />}
              </div>
            </div>
            <span
              style={{
                color: "#7aaa8e",
                fontSize: "12px",
                fontFamily: "'Inter', sans-serif",
                whiteSpace: "nowrap",
                opacity: isExpanded ? 1 : 0,
                transition: isExpanded
                  ? "opacity 0.25s ease 0.15s"
                  : "opacity 0.1s ease",
              }}
            >
              Dark mode
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}