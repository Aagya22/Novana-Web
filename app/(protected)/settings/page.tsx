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
      background: "linear-gradient(135deg, #f4f3f1 0%, #e8f0e6 50%, #f2d1d4 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
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
            background: "rgba(255,255,255,0.9)",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid rgba(216,149,155,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
            color: "#6b7280"
          }}>
            Unable to load profile.
          </div>
        )}
      </main>
    </div>
  );
}
