import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import Link from "next/link";
import { ChevronLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy & Security",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F3EF", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Header />
      <Sidebar />

      <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link
            href="/settings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#829672",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Back to Settings
          </Link>
        </div>

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
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "15px", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={26} color="white" strokeWidth={1.8} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "34px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15 }}>
                  Privacy &amp; Security
                </h1>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 500 }}>
                  Account security and data
                </p>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.65, maxWidth: "400px", margin: 0 }}>
              Manage your password, security preferences, and data privacy settings.
            </p>
          </div>
        </div>

        <div style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "48px 32px",
          border: "1px solid rgba(30,58,47,0.08)",
          boxShadow: "0 2px 12px rgba(30,58,47,0.06)",
          textAlign: "center",
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "rgba(30,58,47,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Shield size={26} color="#829672" strokeWidth={1.8} />
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
            Coming Soon
          </div>
          <div style={{ fontSize: "14px", color: "rgba(31,41,55,0.55)", maxWidth: "300px", margin: "0 auto", lineHeight: 1.6 }}>
            Privacy and security settings are being built. Check back soon.
          </div>
        </div>
      </main>
    </div>
  );
}
