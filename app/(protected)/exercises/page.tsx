"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Sparkles } from "lucide-react";
import { API } from "../../../lib/api/endpoints";
import { toast } from "react-toastify";

import { guidedExercises, type GuidedExerciseId } from "./_components/guidedExercises";
import { BoxBreathingSession } from "./_components/sessions/BoxBreathingSession";
import { Grounding54321Session } from "./_components/sessions/Grounding54321Session";
import { GratitudePauseSession } from "./_components/sessions/GratitudePauseSession";
import { BodyStretchSession } from "./_components/sessions/BodyStretchSession";

type TabKey = "exercises" | "history";

type CategoryFilter = "All" | "Breathing" | "Anxiety" | "Reflection" | "Body";

type HistoryDay = {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  sessions: Array<{
    _id: string;
    title: string;
    category?: string;
    duration: number;
    durationSeconds?: number;
    date: string;
  }>;
};

function safeParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function ExercisesPage() {
  const [tab, setTab] = useState<TabKey>("exercises");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");

  const [darkMode, setDarkMode] = useState(false);

  const [activeSession, setActiveSession] = useState<GuidedExerciseId | null>(null);

  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const historyLoadedOnceRef = useRef(false);

  // ✅ Properly closed useEffect
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    if (savedDarkMode) {
      document.documentElement.className = "dark";
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "darkMode") {
        const newDarkMode = e.newValue === "true";
        setDarkMode(newDarkMode);
        document.documentElement.className = newDarkMode ? "dark" : "";
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const categories: CategoryFilter[] = useMemo(() => ["All", "Breathing", "Anxiety", "Reflection", "Body"], []);

  const filteredExercises = useMemo(() => {
    if (selectedCategory === "All") return guidedExercises;
    return guidedExercises.filter((e) => e.category === selectedCategory);
  }, [selectedCategory]);

  const fetchGuidedHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.EXERCISES.GUIDED_HISTORY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await res.text();
      const payload = safeParseJson(text);
      if (!res.ok) {
        toast.error(payload?.message || "Failed to load history");
        return;
      }
      if (payload?.success) {
        setHistory(payload.data || []);
      } else {
        toast.error(payload?.message || "Failed to load history");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== "history") return;
    if (historyLoadedOnceRef.current) return;
    historyLoadedOnceRef.current = true;
    fetchGuidedHistory();
  }, [tab]);

  const saveGuidedCompletion = async (payload: {
    title: string;
    category: string;
    plannedSeconds: number;
    elapsedSeconds: number;
  }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.EXERCISES.GUIDED_COMPLETE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: payload.title,
          category: payload.category,
          plannedDurationSeconds: payload.plannedSeconds,
          elapsedSeconds: payload.elapsedSeconds,
          completedAt: new Date().toISOString(),
        }),
      });

      const text = await res.text();
      const data = safeParseJson(text);
      if (!res.ok || !data?.success) {
        toast.error(data?.message || "Failed to save session");
        return false;
      }

      toast.success("Session saved to history");
      historyLoadedOnceRef.current = false;
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Failed to save session");
      return false;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode
          ? "radial-gradient(1200px 600px at 20% 10%, rgba(139, 92, 246, 0.20), transparent 55%), radial-gradient(900px 500px at 85% 25%, rgba(45, 212, 191, 0.18), transparent 55%), linear-gradient(135deg, #0b0f14 0%, #0a0a0a 60%, #0f172a 100%)"
          : "linear-gradient(135deg, #f4f3f1 0%, #e8f0e6 50%, #f2d1d4 100%)",
        color: darkMode ? "#f3f4f6" : "#1e3a2b",
        fontFamily: "'Inter', sans-serif",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <Header />
      <Sidebar />

      {activeSession && (
        <>
          {activeSession === "box-breathing" && (
            <BoxBreathingSession
              accent={guidedExercises.find((e) => e.id === activeSession)?.accent || "#8B5CF6"}
              darkMode={darkMode}
              onClose={() => setActiveSession(null)}
              onSave={({ plannedSeconds, elapsedSeconds, title, category }) =>
                saveGuidedCompletion({
                  title,
                  category,
                  plannedSeconds,
                  elapsedSeconds,
                })
              }
            />
          )}

          {activeSession === "grounding-54321" && (
            <Grounding54321Session
              accent={guidedExercises.find((e) => e.id === activeSession)?.accent || "#FB923C"}
              darkMode={darkMode}
              onClose={() => setActiveSession(null)}
              onSave={({ plannedSeconds, elapsedSeconds, title, category }) =>
                saveGuidedCompletion({
                  title,
                  category,
                  plannedSeconds,
                  elapsedSeconds,
                })
              }
            />
          )}

          {activeSession === "gratitude-pause" && (
            <GratitudePauseSession
              accent={guidedExercises.find((e) => e.id === activeSession)?.accent || "#FBBF24"}
              darkMode={darkMode}
              onClose={() => setActiveSession(null)}
              onSave={({ plannedSeconds, elapsedSeconds, title, category }) =>
                saveGuidedCompletion({
                  title,
                  category,
                  plannedSeconds,
                  elapsedSeconds,
                })
              }
            />
          )}

          {activeSession === "body-stretch" && (
            <BodyStretchSession
              accent={guidedExercises.find((e) => e.id === activeSession)?.accent || "#2DD4BF"}
              darkMode={darkMode}
              onClose={() => setActiveSession(null)}
              onSave={({ plannedSeconds, elapsedSeconds, title, category }) =>
                saveGuidedCompletion({
                  title,
                  category,
                  plannedSeconds,
                  elapsedSeconds,
                })
              }
            />
          )}
        </>
      )}

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "28px 32px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(30,58,43,0.65)",
                fontWeight: 700,
              }}
            >
              Exercises
            </div>
            <div
              style={{
                fontSize: "44px",
                fontWeight: 800,
                lineHeight: 1.05,
                marginTop: "8px",
                fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
              }}
            >
              Mind &amp; Body
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.65)",
              border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(216,149,155,0.25)",
              padding: "6px",
              borderRadius: "999px",
              backdropFilter: "blur(16px)",
            }}
          >
            {([
              { key: "exercises", label: "Explore" },
              { key: "history", label: "History" },
            ] as Array<{ key: TabKey; label: string }>).map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    padding: "10px 16px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "13px",
                    letterSpacing: "0.02em",
                    background: active
                      ? darkMode
                        ? "rgba(255,255,255,0.14)"
                        : "rgba(52,76,61,0.12)"
                      : "transparent",
                    color: active
                      ? darkMode
                        ? "#f9fafb"
                        : "#344C3D"
                      : darkMode
                        ? "rgba(243,244,246,0.72)"
                        : "rgba(30,58,43,0.72)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "exercises" ? (
          <>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {categories.map((c) => {
                const active = selectedCategory === c;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    style={{
                      border: darkMode
                        ? "1px solid rgba(255,255,255,0.10)"
                        : "1px solid rgba(216,149,155,0.30)",
                      cursor: "pointer",
                      padding: "10px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 700,
                      background: active
                        ? darkMode
                          ? "rgba(255,255,255,0.14)"
                          : "rgba(255,255,255,0.9)"
                        : darkMode
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(255,255,255,0.55)",
                      color: active
                        ? darkMode
                          ? "#f9fafb"
                          : "#1f2937"
                        : darkMode
                          ? "rgba(243,244,246,0.62)"
                          : "rgba(30,58,43,0.70)",
                      backdropFilter: "blur(16px)",
                      transition: "transform 0.15s ease, background 0.2s ease, color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "18px",
                marginTop: "6px",
              }}
            >
              {filteredExercises.map((ex) => {
                return (
                  <div
                    key={ex.id}
                    onClick={() => setActiveSession(ex.id)}
                    style={{
                      borderRadius: "18px",
                      padding: "18px",
                      background: darkMode
                        ? "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)"
                        : "rgba(255,255,255,0.88)",
                      border: darkMode
                        ? "1px solid rgba(255,255,255,0.10)"
                        : "1px solid rgba(216,149,155,0.18)",
                      boxShadow: darkMode
                        ? "0 16px 40px rgba(0,0,0,0.45)"
                        : "0 16px 40px rgba(216,149,155,0.14)",
                      backdropFilter: "blur(18px)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(500px 220px at 10% 5%, ${ex.accent}22, transparent 60%)`,
                        pointerEvents: "none",
                      }}
                    />

                    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", position: "relative" }}>
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "14px",
                          background: darkMode
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(242,209,212,0.35)",
                          border: `1px solid ${ex.accent}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Sparkles size={18} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: 800,
                              color: darkMode ? "#f9fafb" : "#111827",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {ex.title}
                          </div>

                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 800,
                              padding: "8px 10px",
                              borderRadius: "999px",
                              background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                              border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.06)",
                              color: darkMode ? "rgba(243,244,246,0.70)" : "rgba(31,41,55,0.70)",
                              flexShrink: 0,
                            }}
                          >
                            {ex.minutesLabel}
                          </div>
                        </div>

                        <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: 800, color: darkMode ? "rgba(243,244,246,0.55)" : "rgba(31,41,55,0.55)" }}>
                          {ex.category}
                        </div>

                        <div style={{ marginTop: "10px", fontSize: "13px", lineHeight: 1.45, color: darkMode ? "rgba(243,244,246,0.68)" : "rgba(31,41,55,0.65)" }}>
                          {ex.description}
                        </div>

                        <div style={{ marginTop: "14px", fontSize: "12px", fontWeight: 900, color: darkMode ? "rgba(243,244,246,0.62)" : "rgba(31,41,55,0.62)" }}>
                          Tap to begin • Includes begin screen, step-by-step flow, and completion.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div
            style={{
              background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)",
              border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(216,149,155,0.18)",
              borderRadius: "18px",
              padding: "18px",
              backdropFilter: "blur(18px)",
            }}
          >
            {historyLoading ? (
              <div style={{ padding: "24px", textAlign: "center", color: darkMode ? "rgba(243,244,246,0.75)" : "rgba(31,41,55,0.65)" }}>
                Loading history…
              </div>
            ) : history.length === 0 ? (
              <div style={{ padding: "28px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 800, color: darkMode ? "rgba(243,244,246,0.80)" : "rgba(31,41,55,0.75)" }}>
                  No guided exercise sessions yet
                </div>
                <div style={{ marginTop: "8px", fontSize: "13px", color: darkMode ? "rgba(243,244,246,0.60)" : "rgba(31,41,55,0.60)" }}>
                  Start a session in Explore to see it here.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {history.map((day) => (
                  <div
                    key={day.date}
                    style={{
                      borderRadius: "16px",
                      padding: "16px",
                      background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                      border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 900, fontSize: "14px", color: darkMode ? "#f9fafb" : "#111827" }}>
                        {new Date(day.date + "T00:00:00Z").toLocaleDateString()}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: "12px", color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
                        Total: {day.totalMinutes} min
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                      {day.sessions.map((s) => (
                        <div
                          key={s._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            padding: "12px 12px",
                            borderRadius: "14px",
                            background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
                            border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 900, fontSize: "13px", color: darkMode ? "#f9fafb" : "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {s.title}
                            </div>
                            <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: 700, color: darkMode ? "rgba(243,244,246,0.60)" : "rgba(31,41,55,0.60)" }}>
                              {s.category || "Guided"}
                            </div>
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontWeight: 900, fontSize: "13px", color: darkMode ? "rgba(243,244,246,0.85)" : "rgba(31,41,55,0.80)" }}>
                              {s.duration} min
                            </div>
                            <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: 700, color: darkMode ? "rgba(243,244,246,0.55)" : "rgba(31,41,55,0.55)" }}>
                              {new Date(s.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
