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

type Prompt = {
  id: string;
  text: string;
  seconds: number;
};

const prompts: Prompt[] = [
  {
    id: "p1",
    text: "Name something you're grateful for today",
    seconds: 40,
  },
  {
    id: "p2",
    text: "Name someone who made a difference recently",
    seconds: 40,
  },
  {
    id: "p3",
    text: "Name something about yourself you appreciate",
    seconds: 40,
  },
];

export function GratitudePauseSession({ accent, onSave, onClose, darkMode }: Props) {
  const plannedSeconds = useMemo(() => prompts.reduce((sum, p) => sum + p.seconds, 0), []);

  const [status, setStatus] = useState<Status>("begin");
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(prompts[0].seconds);
  const [tick, setTick] = useState(0);
  const lastTickAtRef = useRef<number | null>(null);

  const didSaveRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const elapsedSeconds = useMemo(() => {
    const completed = prompts.slice(0, index).reduce((sum, p) => sum + p.seconds, 0);
    const currentSpent = prompts[index] ? prompts[index].seconds - remaining : 0;
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
   
  }, [tick]);

  useEffect(() => {
    if (status !== "running") return;
    if (remaining > 0) return;

    if (index < prompts.length - 1) {
      setIndex((i) => i + 1);
      setRemaining(prompts[index + 1].seconds);
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
        title: "Gratitude Pause",
        category: "Reflection",
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
    setRemaining(prompts[0].seconds);
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

  const doneReflecting = () => {
    if (status !== "running" && status !== "paused") return;

    if (index < prompts.length - 1) {
      setIndex((i) => i + 1);
      setRemaining(prompts[index + 1].seconds);
      lastTickAtRef.current = Date.now();
      return;
    }

    setStatus("complete");
  };

  const prompt = prompts[index];
  const stepKey = status === "running" || status === "paused" ? prompt.id : status;

  const view = (() => {
    if (status === "begin") {
      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif", fontSize: "38px", fontWeight: 900 }}>
            Gratitude Pause
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
            Three quiet prompts. Take your time.
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
            You took a moment for yourself.
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px", color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
            That matters.
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
        <div
          style={{
            fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            fontSize: "40px",
            fontWeight: 900,
            lineHeight: 1.15,
          }}
        >
          {prompt.text}
        </div>
        <div style={{ marginTop: "14px", fontSize: "14px", color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
          Take your time. There’s no right answer.
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
            onClick={doneReflecting}
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
            Done reflecting
          </button>
        </div>

        <div style={{ marginTop: "16px", fontSize: "12px", fontWeight: 800, color: darkMode ? "rgba(243,244,246,0.50)" : "rgba(31,41,55,0.55)" }}>
          Prompt {index + 1} of {prompts.length}
        </div>
      </div>
    );
  })();

  const { activeView, opacity, transition } = useFadeSwitch(stepKey, view, 200);

  return (
    <GuidedSessionShell
      title="Gratitude Pause"
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
