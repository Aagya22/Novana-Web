"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Sparkles, Dumbbell } from "lucide-react";
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

  const clearExerciseHistory = async () => {
    const ok = window.confirm(
      "Are you sure you want to delete all exercise history? This action cannot be undone.",
    );
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.EXERCISES.CLEAR_HISTORY, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      const payload = safeParseJson(text);
      if (!res.ok || !payload?.success) {
        toast.error(payload?.message || "Failed to clear history");
        return;
      }

      setHistory([]);
      toast.success("Exercise history cleared");
    } catch (e) {
      console.error(e);
      toast.error("Failed to clear history");
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
    <div style={{ minHeight: "100vh", background: "#F5F3EF", fontFamily: "system-ui, -apple-system, sans-serif" }}>
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

      <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* Forest Green Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #1E3A2F 0%, #3D6B4F 100%)",
          borderRadius: "24px",
          padding: "40px 44px",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(30,58,47,0.2)",
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: 100, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
          <div style={{ zIndex: 1, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "15px", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Dumbbell size={26} color="white" strokeWidth={1.8} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "34px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15 }}>
                  Mind &amp; Body
                </h1>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 500 }}>
                  Guided sessions for your wellness
                </p>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.65, maxWidth: "400px", margin: 0 }}>
              Explore breathing exercises, grounding techniques, and body stretches to build daily resilience.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "18px" }}>
          <div style={{ display: "flex", gap: "8px", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(216,149,155,0.2)", padding: "5px", borderRadius: "999px" }}>
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
                    padding: "10px 18px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "13px",
                    background: active ? "linear-gradient(135deg, #1E3A2F, #3D6B4F)" : "transparent",
                    color: active ? "#FFFFFF" : "rgba(30,58,43,0.65)",
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
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
              {categories.map((c) => {
                const active = selectedCategory === c;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    style={{
                      border: active ? "1px solid rgba(30,58,47,0.25)" : "1px solid rgba(30,58,47,0.12)",
                      cursor: "pointer",
                      padding: "10px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 700,
                      background: active ? "#1E3A2F" : "#FFFFFF",
                      color: active ? "#FFFFFF" : "rgba(30,58,43,0.70)",
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
                      background: "#FFFFFF",
                      border: "1px solid rgba(30,58,47,0.08)",
                      boxShadow: "0 2px 12px rgba(30,58,47,0.06)",
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
                          background: "rgba(130,150,114,0.12)",
                          border: `1px solid ${ex.accent}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Sparkles size={18} color="#344C3D" />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: 800,
                              color: "#111827",
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
                              background: "rgba(30,58,47,0.06)",
                              border: "1px solid rgba(30,58,47,0.10)",
                              color: "rgba(31,41,55,0.70)",
                              flexShrink: 0,
                            }}
                          >
                            {ex.minutesLabel}
                          </div>
                        </div>

                        <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: 800, color: "rgba(31,41,55,0.55)" }}>
                          {ex.category}
                        </div>

                        <div style={{ marginTop: "10px", fontSize: "13px", lineHeight: 1.45, color: "rgba(31,41,55,0.65)" }}>
                          {ex.description}
                        </div>

                        <div style={{ marginTop: "14px", fontSize: "12px", fontWeight: 900, color: "rgba(31,41,55,0.62)" }}>
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
              background: "#FFFFFF",
              border: "1px solid rgba(30,58,47,0.08)",
              borderRadius: "18px",
              padding: "18px",
              boxShadow: "0 2px 12px rgba(30,58,47,0.06)",
            }}
          >
            {!historyLoading && history.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                <button
                  onClick={clearExerciseHistory}
                  style={{
                    border: "1px solid rgba(30,58,47,0.16)",
                    cursor: "pointer",
                    padding: "10px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 900,
                    background: "#FFFFFF",
                    color: "rgba(30,58,43,0.75)",
                  }}
                >
                  Delete all history
                </button>
              </div>
            )}
            {historyLoading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "rgba(31,41,55,0.65)" }}>
                Loading history…
              </div>
            ) : history.length === 0 ? (
              <div style={{ padding: "28px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "rgba(31,41,55,0.75)" }}>
                  No guided exercise sessions yet
                </div>
                <div style={{ marginTop: "8px", fontSize: "13px", color: "rgba(31,41,55,0.60)" }}>
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
                      background: "rgba(30,58,47,0.02)",
                      border: "1px solid rgba(30,58,47,0.07)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 900, fontSize: "14px", color: "#111827" }}>
                        {new Date(day.date + "T00:00:00Z").toLocaleDateString()}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: "12px", color: "rgba(31,41,55,0.65)" }}>
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
                            background: "#FFFFFF",
                            border: "1px solid rgba(30,58,47,0.06)",
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 900, fontSize: "13px", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {s.title}
                            </div>
                            <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: 700, color: "rgba(31,41,55,0.60)" }}>
                              {s.category || "Guided"}
                            </div>
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontWeight: 900, fontSize: "13px", color: "rgba(31,41,55,0.80)" }}>
                              {s.duration} min
                            </div>
                            <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: 700, color: "rgba(31,41,55,0.55)" }}>
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
