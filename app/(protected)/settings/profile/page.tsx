import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProfileSettingsClient from "./_components/ProfileSettingsClient";

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfileSettingsPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F3EF",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <Header />
      <Sidebar />

      <main style={{
        padding: "32px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}>
        {/* Back link */}
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

        <ProfileSettingsClient />
      </main>
    </div>
  );
}
