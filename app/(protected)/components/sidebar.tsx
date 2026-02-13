"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Settings,
  BookOpen,
  SmilePlus,
  Target,
  Dumbbell,
  Bell,
} from "lucide-react";

const navItems = [
  { id: "home", label: "Dashboard", icon: Home, href: "/home" },
  { id: "journal", label: "Journal", icon: BookOpen, href: "/journal" },
  { id: "mood", label: "Mood", icon: SmilePlus, href: "/mood" },
  { id: "habits", label: "Habits", icon: Target, href: "/habits" },
  { id: "exercises", label: "Exercises", icon: Dumbbell, href: "/exercises" },
  { id: "reminders", label: "Reminders", icon: Bell, href: "/reminders" },
  { id: "calendar", label: "Calendar", icon: Calendar, href: "/calendar" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current active item based on pathname
  const getCurrentItem = () => {
    if (pathname === "/home" || pathname === "/") return "home";
    const pathSegments = pathname.split("/").filter(Boolean);
    return pathSegments[pathSegments.length - 1];
  };

  const [activeItem, setActiveItem] = useState(getCurrentItem());

  // Update active item when pathname changes
  useEffect(() => {
    setActiveItem(getCurrentItem());
  }, [pathname]);
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
          width: "12px",
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
          width: isExpanded ? "280px" : "0px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(216,149,155,0.2)",
          boxShadow: isExpanded 
            ? "8px 0 32px rgba(216,149,155,0.15)"
            : "none",
          zIndex: 199,
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          paddingTop: "20px",
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Nav Links */}
        <nav
          style={{
            flex: 1,
            padding: "0 20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 16px",
                  background: isActive
                    ? "linear-gradient(90deg, rgba(216,149,155,0.12) 0%, rgba(130,150,114,0.08) 100%)"
                    : "transparent",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  color: isActive 
                    ? "#344C3D"
                    : "#6b7280",
                  fontSize: "15px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: "0.3px",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s ease",
                  textAlign: "left",
                  width: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(216,149,155,0.06)";
                    e.currentTarget.style.color = "#344C3D";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#6b7280";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: "6px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "3px",
                      height: "20px",
                      background: "linear-gradient(180deg, #829672, #344C3D)",
                      borderRadius: "2px",
                    }}
                  />
                )}

                <span 
                  style={{ 
                    display: "flex", 
                    alignItems: "center",
                    marginLeft: isActive ? "8px" : "0",
                    transition: "margin-left 0.3s ease"
                  }}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </span>

                <span
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded
                      ? "translateX(0)"
                      : "translateX(-12px)",
                    transition: isExpanded
                      ? `opacity 0.3s ease ${0.1 + index * 0.03}s, transform 0.3s ease ${0.1 + index * 0.03}s`
                      : "opacity 0.15s ease, transform 0.15s ease",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}