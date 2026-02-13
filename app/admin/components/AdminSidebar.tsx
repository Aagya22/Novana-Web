"use client";

import React, { useState } from "react";
import { Settings, LogOut, BarChart, Users, Shield, Database } from "lucide-react";

interface AdminSidebarProps {
  adminUser: any;
}

export default function AdminSidebar({ adminUser }: AdminSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    {
      href: "/admin/dashboard",
      icon: BarChart,
      label: "Dashboard",
      description: "Analytics & Overview"
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Users",
      description: "User Management"
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "Settings",
      description: "System Configuration"
    }
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      localStorage.clear();
      window.location.href = "/login";
    }
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
        {/* Logo Section */}
        <div
          style={{
            padding: "0 20px 24px 20px",
            borderBottom: "1px solid rgba(216,149,155,0.15)",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/novacane.png"
              alt="Novana"
              style={{
                height: "36px",
                width: "auto",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Novana
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#9ca3af",
                  fontWeight: "500",
                }}
              >
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav
          style={{
            flex: 1,
            padding: "0 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  background: isActive
                    ? "linear-gradient(90deg, rgba(216,149,155,0.12) 0%, rgba(130,150,114,0.08) 100%)"
                    : "transparent",
                  border: "none",
                  borderRadius: "14px",
                  color: isActive 
                    ? "#344C3D"
                    : "#6b7280",
                  textDecoration: "none",
                  fontSize: "15px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? "translateX(0)" : "translateX(-20px)",
                  transitionDelay: `${0.1 + index * 0.05}s`
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
                      height: "24px",
                      background: "linear-gradient(180deg, #829672, #344C3D)",
                      borderRadius: "2px"
                    }}
                  />
                )}

                <div 
                  style={{ 
                    display: "flex", 
                    alignItems: "center",
                    marginLeft: isActive ? "8px" : "0",
                    transition: "margin-left 0.3s ease"
                  }}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}>
                  <span style={{
                    fontSize: "15px",
                    fontWeight: isActive ? 600 : 500
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    fontWeight: "400"
                  }}>
                    {item.description}
                  </span>
                </div>
              </a>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div
          style={{
            padding: "24px",
            borderTop: "1px solid rgba(216,149,155,0.1)",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "14px",
              color: "#dc2626",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? "translateY(0)" : "translateY(10px)",
              transitionDelay: "0.3s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.05)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <LogOut size={20} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}