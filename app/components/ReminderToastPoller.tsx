"use client";

import { useEffect, useRef } from "react";
import { API } from "@/lib/api/endpoints";
import { showToast } from "@/lib/toast";

type DeliveredReminderNotification = {
  _id: string;
  title: string;
  type: "journal" | "mood" | "exercise";
  deliveredAt: string;
  scheduledFor: string;
};

function playReminderBeep() {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 880;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    osc.onended = () => {
      try {
        ctx.close();
      } catch {
        // ignore
      }
    };
  } catch {
    // Many browsers block autoplay audio until a user gesture; ignore failures.
  }
}

export default function ReminderToastPoller() {
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isRunningRef = useRef(false);

  useEffect(() => {
    let disposed = false;

    const poll = async () => {
      if (disposed) return;
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        const token = window.localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(API.REMINDERS.DUE(2), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!payload?.success || !Array.isArray(payload?.data)) return;

        const delivered: DeliveredReminderNotification[] = payload.data;
        for (const n of delivered) {
          if (!n?._id) continue;
          if (seenIdsRef.current.has(n._id)) continue;
          seenIdsRef.current.add(n._id);

          const label = n.type === "journal" ? "Journal" : n.type === "mood" ? "Mood" : "Exercise";
          const scheduled = n.scheduledFor
            ? new Date(n.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";
          playReminderBeep();
          showToast(`${label} reminder${scheduled ? ` (${scheduled})` : ""}: ${n.title}`, "info", "top");
        }

        if (delivered.length > 0) {
          window.dispatchEvent(new CustomEvent("reminder_notifications_updated"));
        }
      } catch {
        // silent
      } finally {
        isRunningRef.current = false;
      }
    };

    poll();
    const id = window.setInterval(poll, 60_000);
    return () => {
      disposed = true;
      window.clearInterval(id);
    };
  }, []);

  return null;
}
