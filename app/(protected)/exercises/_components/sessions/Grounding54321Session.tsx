"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GuidedSessionShell } from "../GuidedSession";
import { useFadeSwitch } from "../useFadeSwitch";

type Status = "begin" | "running" | "paused" | "complete";

type Props = {
  accent: string;
  onSave: (payload: { plannedSeconds: number; elapsedSeconds: number; title: string; category: string }) => Promise<boolean>;
  onClose: () => void;
  darkMode: boolean;
};

type Step = {
  number: 5 | 4 | 3 | 2 | 1;
  label: string;
  prompt: string;
  description: string;
  seconds: number;
};

const steps: Step[] = [
  {
    number: 5,
    label: "See",
    prompt: "Name 5 things you can see",
    description: "Look around the room. Notice colors, shapes, objects.",
    seconds: 30,
  },
  {
    number: 4,
    label: "Hear",
    prompt: "Name 4 things you can hear",
    description: "Listen closely. Notice near and far sounds.",
    seconds: 25,
  },
  {
    number: 3,
    label: "Touch",
    prompt: "Name 3 things you can touch",
    description: "Feel texture and temperature — hands, clothes, chair.",
    seconds: 20,
  },
  {
    number: 2,
    label: "Smell",
    prompt: "Name 2 things you can smell",
    description: "Breathe gently. Notice any scents in the air.",
    seconds: 15,
  },
  {
    number: 1,
    label: "Taste",
    prompt: "Name 1 thing you can taste",
    description: "Notice a taste in your mouth, or take a small sip of water.",
    seconds: 10,
  },
];

export function Grounding54321Session({ accent, onSave, onClose, darkMode }: Props) {
  const plannedSeconds = useMemo(() => steps.reduce((sum, s) => sum + s.seconds, 0), []);

  const [status, setStatus] = useState<Status>("begin");
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(steps[0].seconds);
  const [tick, setTick] = useState(0);
  const lastTickAtRef = useRef<number | null>(null);

  const didSaveRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const elapsedSeconds = useMemo(() => {
    const completed = steps.slice(0, index).reduce((sum, s) => sum + s.seconds, 0);
    const currentSpent = steps[index] ? steps[index].seconds - remaining : 0;
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
    setRemaining((r) => {
      const next = Math.max(0, r - delta);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  useEffect(() => {
    if (status !== "running") return;
    if (remaining > 0) return;

    // advance
    if (index < steps.length - 1) {
      setIndex((i) => i + 1);
      setRemaining(steps[index + 1].seconds);
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
        title: "5-4-3-2-1 Grounding",
        category: "Anxiety",
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
    setRemaining(steps[0].seconds);
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

  const nextEarly = () => {
    if (status !== "running" && status !== "paused") return;
    if (index < steps.length - 1) {
      setIndex((i) => i + 1);
      setRemaining(steps[index + 1].seconds);
      lastTickAtRef.current = Date.now();
      return;
    }
    setStatus("complete");
  };

  const step = steps[index];

  const stepKey = status === "running" || status === "paused" ? `step-${step.number}` : status;

  const view = (() => {
    if (status === "begin") {
      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif", fontSize: "38px", fontWeight: 900 }}>
            5-4-3-2-1 Grounding
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
            One prompt at a time. Reflect silently — then we’ll move on.
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
            Back to the present
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
            You anchored yourself through your senses.
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

    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", fontWeight: 900, letterSpacing: "-0.02em" }}>{step.label}</div>
        <div style={{ marginTop: "10px", fontSize: "18px", fontWeight: 900 }}>{step.prompt}</div>
        <div style={{ marginTop: "10px", fontSize: "14px", color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
          {step.description}
        </div>

        <div
          style={{
            marginTop: "24px",
            display: "inline-flex",
            gap: "10px",
            alignItems: "center",
            padding: "12px 14px",
            borderRadius: "999px",
            background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
            border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
            fontWeight: 900,
          }}
        >
          {remaining}s
        </div>

        <div style={{ marginTop: "18px", fontSize: "13px", fontWeight: 900, color: darkMode ? "rgba(243,244,246,0.60)" : "rgba(31,41,55,0.60)" }}>
          {"5 → 4 → 3 → 2 → 1"} &nbsp;•&nbsp; Now: {step.number}
        </div>

        <div style={{ marginTop: "22px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
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
            onClick={nextEarly}
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
            Next
          </button>
        </div>
      </div>
    );
  })();

  const { activeView, opacity, transition } = useFadeSwitch(stepKey, view, 200);

  return (
    <GuidedSessionShell
      title="5-4-3-2-1 Grounding"
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
