"use client";

import React from "react";



const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Header() {
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
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(46,139,87,0.4)";
          (e.currentTarget as HTMLDivElement).style.background = "#eaf7ee";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#e2ebe6";
          (e.currentTarget as HTMLDivElement).style.background = "#f4faf6";
        }}
      >
        <SearchIcon />
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

      {/* Right: Icons + Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Message Icon */}
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
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#eaf7ee";
            (e.currentTarget as HTMLButtonElement).style.color = "#2E8B57";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#f4faf6";
            (e.currentTarget as HTMLButtonElement).style.color = "#7aaa8e";
          }}
        >
          <MessageIcon />
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "8px",
              height: "8px",
              background: "#2E8B57",
              borderRadius: "50%",
              border: "2px solid #ffffff",
            }}
          />
        </button>

        {/* Bell Icon */}
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
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#eaf7ee";
            (e.currentTarget as HTMLButtonElement).style.color = "#2E8B57";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#f4faf6";
            (e.currentTarget as HTMLButtonElement).style.color = "#7aaa8e";
          }}
        >
          <BellIcon />
        </button>

        {/* Avatar */}
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2E8B57, #3aaa6e)",
            border: "2px solid rgba(46,139,87,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          U
        </div>
      </div>
    </header>
  );
}