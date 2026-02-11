"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Calendar,
  BarChart3,
  Settings,
  Moon,
  Sun,
} from "lucide-react";


const navItems = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "calendar", label: "Calendar", icon: Calendar, href: "/calendar" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  const [darkMode, setDarkMode] = useState(false);

  const handleNavigation = (item: (typeof navItems)[0]) => {
    setActiveItem(item.id);
    router.push(item.href);
  };

  return (
    <>
      {/* Hover Trigger Zone */}
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
          transition:
            "width 0.32s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
          display: "flex",
          flexDirection: "column",
          paddingTop: "64px",
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Nav Links */}
        <nav
          style={{
            flex: 1,
            padding: "24px 0",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "11px 24px",
                  background: isActive
                    ? "linear-gradient(90deg, rgba(46,139,87,0.08) 0%, rgba(46,139,87,0.02) 100%)"
                    : "transparent",
                  border: "none",
                  borderLeft: isActive
                    ? "3px solid #2E8B57"
                    : "3px solid transparent",
                  borderRadius: "0 10px 10px 0",
                  cursor: "pointer",
                  color: isActive ? "#2E8B57" : "#7aaa8e",
                  fontSize: "13px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.3px",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#f4faf6";
                    e.currentTarget.style.color = "#2E8B57";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#7aaa8e";
                  }
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  <Icon size={18} strokeWidth={2} />
                </span>

                <span
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded
                      ? "translateX(0)"
                      : "translateX(-8px)",
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

        {/* Dark Mode Toggle */}
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
                {darkMode ? (
                  <Moon size={14} strokeWidth={2} />
                ) : (
                  <Sun size={14} strokeWidth={2} />
                )}
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