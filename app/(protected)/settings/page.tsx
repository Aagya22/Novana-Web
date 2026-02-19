import UpdateUserForm from "./components/updateform";
import { handleWhoAmI } from "@/lib/actions/auth-action";
import Header from "../components/header";
import Sidebar from "../components/sidebar";

export const metadata = {
  title: "Settings - Profile",
};

export default async function SettingsPage() {
  const result = await handleWhoAmI();
  const user = result.success ? result.data : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F3EF",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <Header />
      <Sidebar />
      
      <main style={{
        marginLeft: "0",
        padding: "32px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}>
        {user ? (
          <UpdateUserForm user={user} />
        ) : (
          <div style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid rgba(30,58,47,0.08)",
            boxShadow: "0 2px 12px rgba(30,58,47,0.08)",
            textAlign: "center",
            color: "#78716C"
          }}>
            Unable to load profile.
          </div>
        )}
      </main>
    </div>
  );
}
