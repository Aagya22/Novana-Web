import UpdateUserForm from "../components/updateform";
import { handleWhoAmI } from "@/lib/actions/auth-action";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfileSettingsPage() {
  const result = await handleWhoAmI();
  const user = result.success ? result.data : null;

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

        {user ? (
          <UpdateUserForm user={user} />
        ) : (
          <div style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid rgba(30,58,47,0.08)",
            boxShadow: "0 2px 12px rgba(30,58,47,0.06)",
            textAlign: "center",
            color: "#6b7280",
          }}>
            Unable to load profile.
          </div>
        )}
      </main>
    </div>
  );
}
