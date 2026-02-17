"use client";

import React from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  accent: string;
  progress: number; // 0..1
  onExit: () => void;
  children: React.ReactNode;
  opacity: number;
  transition: string;
  darkMode: boolean;
};

export function GuidedSessionShell({
  title,
  accent,
  progress,
  onExit,
  children,
  opacity,
  transition,
  darkMode,
}: Props) {
  const safeProgress = Math.max(0, Math.min(1, progress));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: darkMode
          ? "radial-gradient(900px 520px at 20% 10%, rgba(139, 92, 246, 0.18), transparent 60%), radial-gradient(900px 520px at 80% 20%, rgba(45, 212, 191, 0.15), transparent 60%), linear-gradient(135deg, #0b0f14 0%, #0a0a0a 60%, #0f172a 100%)"
          : "linear-gradient(135deg, #f4f3f1 0%, #e8f0e6 50%, #f2d1d4 100%)",
        color: darkMode ? "#f3f4f6" : "#111827",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "18px 20px 10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: darkMode ? "rgba(243,244,246,0.55)" : "rgba(31,41,55,0.55)",
            }}
          >
            Guided Exercise
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "18px",
              fontWeight: 900,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
        </div>

        <button
          onClick={onExit}
          style={{
            border: darkMode
              ? "1px solid rgba(255,255,255,0.12)"
              : "1px solid rgba(0,0,0,0.08)",
            background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
            borderRadius: "14px",
            padding: "10px",
            cursor: "pointer",
            color: darkMode ? "rgba(243,244,246,0.8)" : "rgba(17,24,39,0.7)",
          }}
          aria-label="Exit"
          title="Exit"
        >
          <X size={18} />
        </button>
      </div>

      <div
        style={{
          padding: "0 20px 16px 20px",
        }}
      >
        <div
          style={{
            height: "8px",
            borderRadius: "999px",
            background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${safeProgress * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${accent}, ${accent}AA)`,
              transition: "width 180ms ease",
            }}
          />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 20px 26px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "860px",
            opacity,
            transition,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
