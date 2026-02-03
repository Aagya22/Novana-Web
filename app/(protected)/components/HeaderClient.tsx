"use client";

import React, { useRef, useState } from "react";
import { Bell, MessageSquare, Search, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { handleLogout, handleUpdateProfile } from "@/lib/actions/auth-action";

type Props = {
  user: any | null;
};

export default function HeaderClient({ user }: Props) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onLogout = async () => {
    try {
      setIsLoggingOut(true);
      await handleLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const uploadAvatar = () => {
    fileRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploading(true);
      const result = await handleUpdateProfile(formData);
      setIsUploading(false);
      if (result.success) {
        // refresh server component wrapper to get updated user
        router.refresh();
      } else {
        alert(result.message || "Failed to upload image");
      }
    } catch (err) {
      setIsUploading(false);
      console.error(err);
      alert("Upload failed");
    }
  };

  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  const initials = (() => {
    const name = user?.fullName || user?.username || "U";
    return name
      .split(" ")
      .map((s: string) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  })();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        padding: "0 28px",
        background: "#ffffff",
        borderBottom: "1px solid #e2ebe6",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Left: Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "20px",
            fontWeight: 700,
            color: "#2E8B57",
            letterSpacing: "0.5px",
          }}
        >
          Novana
        </span>
      </div>

      {/* Center: Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#f4faf6",
          border: "1px solid #e2ebe6",
          borderRadius: "10px",
          padding: "8px 16px",
          width: "320px",
          transition: "all 0.3s ease",
          color: "#7aaa8e",
        }}
      >
        <Search size={16} />
        <input
          type="text"
          placeholder="Search..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#1e3a2b",
            fontSize: "13px",
            width: "100%",
            fontFamily: "'Inter', sans-serif",
          }}
        />
      </div>

      {/* Right: Icons + Avatar + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          style={{
            background: "#f4faf6",
            border: "1px solid #e2ebe6",
            borderRadius: "10px",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#7aaa8e",
            transition: "all 0.2s ease",
            position: "relative" as const,
          }}
        >
          <MessageSquare size={20} />
        </button>

        <button
          style={{
            background: "#f4faf6",
            border: "1px solid #e2ebe6",
            borderRadius: "10px",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#7aaa8e",
            transition: "all 0.2s ease",
            position: "relative" as const,
          }}
        >
          <Bell size={20} />
        </button>

        {/* Avatar area */}
        <div style={{ position: "relative" }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onFileChange}
          />

          <button
            onClick={uploadAvatar}
            disabled={isUploading}
            title={user?.fullName || "Change avatar"}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid rgba(46,139,87,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isUploading ? "not-allowed" : "pointer",
              background: "#f4faf6",
              padding: 0,
            }}
          >
            {user?.imageUrl ? (
              <img
                src={`${backendBase}${user.imageUrl}`}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#fff",
                  background: "linear-gradient(135deg, #2E8B57, #3aaa6e)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {initials}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "10px",
            background: isLoggingOut ? "#f0f0f0" : "#f4faf6",
            border: "1px solid #e2ebe6",
            color: "#7aaa8e",
            fontSize: "13px",
            fontWeight: 500,
            cursor: isLoggingOut ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            opacity: isLoggingOut ? 0.6 : 1,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <LogOut size={16} />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
