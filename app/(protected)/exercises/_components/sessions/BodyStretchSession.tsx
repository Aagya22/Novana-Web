"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowLeftRight, HeartPulse, RotateCcw, Wind } from "lucide-react";
import { GuidedSessionShell } from "../GuidedSession";
import { useFadeSwitch } from "../useFadeSwitch";
import { playSoftChime } from "./utils";

type Status = "begin" | "running" | "paused" | "complete";

type Props = {
  accent: string;
  onSave: (payload: { plannedSeconds: number; elapsedSeconds: number; title: string; category: string }) => Promise<boolean>;
  onClose: () => void;
  darkMode: boolean;
};

type Stretch = {
  id: string;
  name: string;
  instruction: string;
  seconds: number;
  Icon: React.ComponentType<{ size?: number }>;
};

const stretches: Stretch[] = [
  {
    id: "neck-roll",
    name: "Neck Roll",
    instruction: "Slowly roll your head in a full circle.",
    seconds: 30,
    Icon: RotateCcw,
  },
  {
    id: "shoulder-shrug",
    name: "Shoulder Shrug",
    instruction: "Lift shoulders up, then relax them down.",
    seconds: 25,
    Icon: Activity,
  },
  {
    id: "forward-fold",
    name: "Forward Fold",
    instruction: "Hinge at the hips and let your head relax.",
    seconds: 35,
    Icon: ArrowDown,
  },
  {
    id: "chest-opener",
    name: "Chest Opener",
    instruction: "Open your chest and draw shoulders back gently.",
    seconds: 30,
    Icon: HeartPulse,
  },
  {
    id: "seated-twist",
    name: "Seated Twist",
    instruction: "Twist gently to one side, then the other.",
    seconds: 30,
    Icon: ArrowLeftRight,
  },
  {
    id: "deep-breath-hold",
    name: "Deep Breath Hold",
    instruction: "Inhale deeply, hold briefly, and exhale slowly.",
    seconds: 20,
    Icon: Wind,
  },
];

export function BodyStretchSession({ accent, onSave, onClose, darkMode }: Props) {
  const plannedSeconds = useMemo(() => stretches.reduce((sum, s) => sum + s.seconds, 0), []);

  const [status, setStatus] = useState<Status>("begin");
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(stretches[0].seconds);

  const [tick, setTick] = useState(0);
  const lastTickAtRef = useRef<number | null>(null);

  const didSaveRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const elapsedSeconds = useMemo(() => {
    const completed = stretches.slice(0, index).reduce((sum, s) => sum + s.seconds, 0);
    const currentSpent = stretches[index] ? stretches[index].seconds - remaining : 0;
    return Math.max(0, Math.min(plannedSeconds, completed + currentSpent));
  }, [index, remaining, plannedSeconds]);

  const progress = useMemo(() => {
    if (status === "begin") return 0;
    if (status === "complete") return 1;
    return Math.max(0, Math.min(1, elapsedSeconds / plannedSeconds));
  }, [elapsedSeconds, plannedSeconds, status]);

  useEffect(() => {
    if (status !== "running") return;
    lastTickAtRef.current = Date.now();
    const id = window.setInterval(() => setTick((t) => t + 1), 250);
    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== "running") return;

    const now = Date.now();
    const last = lastTickAtRef.current ?? now;
    const delta = Math.floor((now - last) / 1000);
    if (delta <= 0) return;

    lastTickAtRef.current = last + delta * 1000;
    setRemaining((r) => Math.max(0, r - delta));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  useEffect(() => {
    if (status !== "running") return;
    if (remaining > 0) return;

    playSoftChime();

    if (index < stretches.length - 1) {
      setIndex((i) => i + 1);
      setRemaining(stretches[index + 1].seconds);
      lastTickAtRef.current = Date.now();
      return;
    }

    setStatus("complete");
  }, [remaining, status, index]);

  useEffect(() => {
    if (status !== "complete") return;
    if (didSaveRef.current) return;
    didSaveRef.current = true;

    (async () => {
      setIsSaving(true);
      setSaveFailed(false);
      const ok = await onSave({
        plannedSeconds,
        elapsedSeconds: plannedSeconds,
        title: "Body Stretch Timer",
        category: "Body",
      });
      setIsSaving(false);
      setSaveFailed(!ok);
    })();
  }, [status, onSave, plannedSeconds]);

  const onExit = () => {
    const confirmed = window.confirm("Exit this session? It won’t be saved unless completed.");
    if (!confirmed) return;
    onClose();
  };

  const begin = () => {
    setIndex(0);
    setRemaining(stretches[0].seconds);
    setStatus("running");
  };

  const pause = () => {
    if (status !== "running") return;
    setTick((t) => t + 1);
    setStatus("paused");
    lastTickAtRef.current = null;
  };

  const resume = () => {
    if (status !== "paused") return;
    setStatus("running");
  };

  const nextStretch = () => {
    if (status !== "running" && status !== "paused") return;

    playSoftChime();

    if (index < stretches.length - 1) {
      setIndex((i) => i + 1);
      setRemaining(stretches[index + 1].seconds);
      lastTickAtRef.current = Date.now();
      return;
    }

    setStatus("complete");
  };

  const stretch = stretches[index];
  const stepKey = status === "running" || status === "paused" ? stretch.id : status;

  const view = (() => {
    if (status === "begin") {
      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif", fontSize: "38px", fontWeight: 900 }}>
            Body Stretch Timer
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
            A sequence of 6 timed stretches. Move gently.
          </div>
          <div style={{ marginTop: "26px", display: "flex", justifyContent: "center" }}>
            <button
              onClick={begin}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "14px 18px",
                borderRadius: "14px",
                fontWeight: 900,
                fontSize: "14px",
                background: `linear-gradient(135deg, ${accent}, ${accent}AA)`,
                color: "#0b0f14",
              }}
            >
              Begin session
            </button>
          </div>
        </div>
      );
    }

    if (status === "complete") {
      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif", fontSize: "36px", fontWeight: 900 }}>
            You’re done
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
            A few minutes of movement goes a long way.
          </div>
          <div style={{ marginTop: "18px", fontSize: "13px", color: darkMode ? "rgba(243,244,246,0.55)" : "rgba(31,41,55,0.60)" }}>
            {isSaving ? "Saving your session…" : saveFailed ? "Couldn’t save this session." : "Session saved to history."}
          </div>
          {saveFailed && (
            <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => {
                  didSaveRef.current = false;
                  setStatus("complete");
                }}
                style={{
                  border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)",
                  background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  fontWeight: 900,
                  cursor: "pointer",
                  color: darkMode ? "#f9fafb" : "#111827",
                }}
              >
                Try saving again
              </button>
            </div>
          )}
        </div>
      );
    }

    const Icon = stretch.Icon;

    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "640px",
            borderRadius: "18px",
            padding: "18px",
            background: darkMode
              ? "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)"
              : "rgba(255,255,255,0.88)",
            border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.06)",
            boxShadow: darkMode ? "0 18px 50px rgba(0,0,0,0.55)" : "0 18px 50px rgba(216,149,155,0.14)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: darkMode ? "rgba(255,255,255,0.06)" : `${accent}18`,
                border: `1px solid ${accent}44`,
              }}
            >
              <Icon size={24} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "20px", fontWeight: 900, color: darkMode ? "#f9fafb" : "#111827" }}>
                {stretch.name}
              </div>
              <div style={{ marginTop: "8px", fontSize: "14px", color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
                {stretch.instruction}
              </div>

              <div style={{ marginTop: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "inline-flex",
                    padding: "10px 12px",
                    borderRadius: "999px",
                    fontWeight: 900,
                    background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {remaining}s
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {status === "running" ? (
                    <button
                      onClick={pause}
                      style={{
                        border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)",
                        background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
                        borderRadius: "14px",
                        padding: "12px 14px",
                        fontWeight: 900,
                        cursor: "pointer",
                        color: darkMode ? "#f9fafb" : "#111827",
                      }}
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={resume}
                      style={{
                        border: "none",
                        background: `linear-gradient(135deg, ${accent}, ${accent}AA)`,
                        borderRadius: "14px",
                        padding: "12px 14px",
                        fontWeight: 900,
                        cursor: "pointer",
                        color: "#0b0f14",
                      }}
                    >
                      Resume
                    </button>
                  )}

                  <button
                    onClick={nextStretch}
                    style={{
                      border: `1px solid ${accent}55`,
                      background: darkMode ? `${accent}22` : `${accent}18`,
                      borderRadius: "14px",
                      padding: "12px 14px",
                      fontWeight: 900,
                      cursor: "pointer",
                      color: darkMode ? "#f9fafb" : "#111827",
                    }}
                  >
                    Next stretch
                  </button>
                </div>
              </div>

              <div style={{ marginTop: "14px", fontSize: "12px", fontWeight: 800, color: darkMode ? "rgba(243,244,246,0.50)" : "rgba(31,41,55,0.55)" }}>
                Stretch {index + 1} of {stretches.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })();

  const { activeView, opacity, transition } = useFadeSwitch(stepKey, view, 200);

  return (
    <GuidedSessionShell
      title="Body Stretch Timer"
      accent={accent}
      progress={progress}
      onExit={onExit}
      opacity={opacity}
      transition={transition}
      darkMode={darkMode}
    >
      {activeView}
    </GuidedSessionShell>
  );
}
