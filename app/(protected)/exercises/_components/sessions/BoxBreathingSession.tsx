"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GuidedSessionShell } from "../GuidedSession";
import { useFadeSwitch } from "../useFadeSwitch";

type Phase = "Inhale" | "Hold" | "Exhale";

type Status = "begin" | "running" | "paused" | "complete";

type Props = {
  accent: string;
  onSave: (payload: { plannedSeconds: number; elapsedSeconds: number; title: string; category: string }) => Promise<boolean>;
  onClose: () => void;
  darkMode: boolean;
};

const PHASE_SECONDS = 4;
const CYCLES = 4;

function phaseInstruction(phase: Phase, holdSize: "large" | "small") {
  if (phase === "Inhale") return "Breathe in slowly…";
  if (phase === "Exhale") return "Breathe out slowly…";
  return holdSize === "large" ? "Hold your breath…" : "Hold…";
}

export function BoxBreathingSession({ accent, onSave, onClose, darkMode }: Props) {
  const [status, setStatus] = useState<Status>("begin");

  // timeline: 4 cycles × [inhale 4, hold 4, exhale 4, hold 4] = 64s
  const plannedSeconds = PHASE_SECONDS * 4 * CYCLES;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tick, setTick] = useState(0);
  const lastTickAtRef = useRef<number | null>(null);
  const didSaveRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const totalSegments = CYCLES * 4;

  const segment = useMemo(() => {
    const clamped = Math.max(0, Math.min(plannedSeconds, elapsedSeconds));
    const segIndex = Math.min(totalSegments - 1, Math.floor(clamped / PHASE_SECONDS));
    const segElapsed = clamped % PHASE_SECONDS;

    const segInCycle = segIndex % 4; // 0 inhale, 1 hold-large, 2 exhale, 3 hold-small
    const cycle = Math.floor(segIndex / 4) + 1;

    const phase: Phase = segInCycle === 0 ? "Inhale" : segInCycle === 2 ? "Exhale" : "Hold";
    const holdSize: "large" | "small" = segInCycle === 1 ? "large" : "small";

    const remainingInPhase = PHASE_SECONDS - segElapsed;

    return {
      segIndex,
      cycle,
      phase,
      holdSize,
      remainingInPhase,
      segInCycle,
    };
  }, [elapsedSeconds, plannedSeconds, totalSegments]);

  const progress = useMemo(() => {
    if (status === "begin") return 0;
    if (status === "complete") return 1;
    return Math.max(0, Math.min(1, elapsedSeconds / plannedSeconds));
  }, [elapsedSeconds, plannedSeconds, status]);

  useEffect(() => {
    if (status !== "running") return;

    lastTickAtRef.current = Date.now();
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
    }, 250);

    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== "running") return;
    const now = Date.now();
    const last = lastTickAtRef.current ?? now;
    const delta = Math.floor((now - last) / 1000);
    if (delta <= 0) return;

    lastTickAtRef.current = last + delta * 1000;
    setElapsedSeconds((s) => {
      const next = Math.min(plannedSeconds, s + delta);
      if (next >= plannedSeconds) {
        setStatus("complete");
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

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
        title: "Box Breathing",
        category: "Breathing",
      });
      setIsSaving(false);
      setSaveFailed(!ok);
    })();
  }, [status]);

  const begin = () => {
    setElapsedSeconds(0);
    setStatus("running");
  };

  const pause = () => {
    if (status !== "running") return;
    // sync to now before pausing
    setTick((t) => t + 1);
    setStatus("paused");
    lastTickAtRef.current = null;
  };

  const resume = () => {
    if (status !== "paused") return;
    setStatus("running");
  };

  const onExit = () => {
    const confirmed = window.confirm("Exit this session? It won’t be saved unless completed.");
    if (!confirmed) return;
    onClose();
  };

  const phaseColor = (() => {
    if (segment.phase === "Inhale") return darkMode ? "rgba(96,165,250,0.40)" : "rgba(96,165,250,0.25)";
    if (segment.phase === "Exhale") return darkMode ? "rgba(52,211,153,0.35)" : "rgba(52,211,153,0.22)";
    return darkMode ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.06)";
  })();

  const scale = (() => {
    if (segment.phase === "Inhale") {
      const p = 1 - segment.remainingInPhase / PHASE_SECONDS;
      return 0.72 + p * 0.38;
    }
    if (segment.phase === "Exhale") {
      const p = 1 - segment.remainingInPhase / PHASE_SECONDS;
      return 1.10 - p * 0.38;
    }
    // hold
    return segment.holdSize === "large" ? 1.10 : 0.72;
  })();

  const pulse = status === "running" && segment.phase === "Hold";

  const stepKey = status === "running" || status === "paused"
    ? `run-${segment.phase}-${segment.holdSize}-${segment.segIndex}`
    : status;

  const view = (() => {
    if (status === "begin") {
      return (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
              fontSize: "38px",
              fontWeight: 800,
              color: darkMode ? "#f9fafb" : "#111827",
            }}
          >
            Box Breathing
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)",
            }}
          >
            4 phases · 4 cycles · steady rhythm
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
                boxShadow: darkMode
                  ? "0 18px 40px rgba(0,0,0,0.55)"
                  : "0 18px 40px rgba(216,149,155,0.18)",
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
          <div
            style={{
              fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
              fontSize: "36px",
              fontWeight: 900,
              color: darkMode ? "#f9fafb" : "#111827",
            }}
          >
            Nicely done
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)",
            }}
          >
            You completed 4 calm breathing cycles.
          </div>

          <div
            style={{
              marginTop: "18px",
              fontSize: "13px",
              color: darkMode ? "rgba(243,244,246,0.55)" : "rgba(31,41,55,0.60)",
            }}
          >
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
      <div
        style={{
          fontSize: "40px",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          color: darkMode ? "#f9fafb" : "#111827",
        }}
      >
        {segment.phase}
      </div>

      <div
        style={{
          width: "260px",
          height: "260px",
          borderRadius: "999px",
          background: phaseColor,
          border: `1px solid ${accent}55`,
          boxShadow: darkMode ? "0 24px 70px rgba(0,0,0,0.55)" : `0 24px 70px ${accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale})`,
          transition: "transform 700ms ease, background 500ms ease",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "22px",
            borderRadius: "999px",
            border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.06)",
            opacity: pulse ? 1 : 0,
            animation: pulse ? "novanaPulse 1.2s ease-in-out infinite" : "none",
          }}
        />

        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: darkMode ? "rgba(243,244,246,0.92)" : "rgba(17,24,39,0.85)",
          }}
        >
          {Math.max(1, Math.floor(segment.remainingInPhase))}
        </div>
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, color: darkMode ? "rgba(243,244,246,0.65)" : "rgba(31,41,55,0.65)" }}>
        {phaseInstruction(segment.phase, segment.holdSize)}
      </div>

      <div style={{ marginTop: "4px", fontSize: "13px", fontWeight: 800, color: darkMode ? "rgba(243,244,246,0.55)" : "rgba(31,41,55,0.60)" }}>
        Cycle {Math.min(CYCLES, segment.cycle)} of {CYCLES}
      </div>

      <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
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
      </div>

      <style jsx>{`
        @keyframes novanaPulse {
          0% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.05); opacity: 0.75; }
          100% { transform: scale(1); opacity: 0.35; }
        }
      `}</style>

      <div
        style={{
          marginTop: "10px",
          fontSize: "12px",
          fontWeight: 800,
          color: darkMode ? "rgba(243,244,246,0.50)" : "rgba(31,41,55,0.55)",
        }}
      >
        {status === "paused" ? "Paused" : ""}
      </div>
    </div>
    );
  })();

  const { activeView, opacity, transition } = useFadeSwitch(stepKey, view, 200);

  return (
    <GuidedSessionShell
      title="Box Breathing"
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
