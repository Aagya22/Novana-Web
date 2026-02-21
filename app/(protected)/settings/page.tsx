"use client";

import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Link from "next/link";
import { User, Shield, Palette, ChevronRight } from "lucide-react";

const options = [
  {
    href: "/settings/profile",
    icon: User,
    label: "Profile Settings",
    description: "Update your name, avatar, email and personal information.",
    accent: "#1E3A2F",
  },
  {
    href: "/settings/privacy",
    icon: Shield,
    label: "Privacy & Security",
    description: "Manage your password, account security and data preferences.",
    accent: "#344C3D",
  },
  {
    href: "/settings/appearance",
    icon: Palette,
    label: "Appearance",
    description: "Customize the look and feel of your Novana experience.",
    accent: "#829672",
  },
];

export default function SettingsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F3EF", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Header />
      <Sidebar />

      <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #1E3A2F 0%, #3D6B4F 100%)",
          borderRadius: "24px",
          padding: "40px 44px",
          marginBottom: "28px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(30,58,47,0.2)",
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: 100, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "15px", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={26} color="white" strokeWidth={1.8} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "34px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15 }}>
                  Settings
                </h1>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 500 }}>
                  Manage your account and preferences
                </p>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.65, maxWidth: "400px", margin: 0 }}>
              Configure your profile, security settings, and how Novana looks and feels.
            </p>
          </div>
        </div>

        {/* Options Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
          {options.map(({ href, icon: Icon, label, description, accent }) => (
            <Link
              key={href}
              href={href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(30,58,47,0.08)",
                  borderRadius: "20px",
                  padding: "28px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "18px",
                  boxShadow: "0 2px 12px rgba(30,58,47,0.06)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(30,58,47,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(30,58,47,0.06)";
                }}
              >
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: `${accent}14`,
                  border: `1px solid ${accent}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={22} color={accent} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                      {label}
                    </div>
                    <ChevronRight size={16} color="#9ca3af" strokeWidth={2.5} />
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.55, color: "rgba(31,41,55,0.60)" }}>
                    {description}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

